import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();

const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

export const createSubscription = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { priceId, userId, returnUrl } = req.body;

    // Get user from Firebase Auth
    const user = await admin.auth().getUser(userId);

    // Create or get Stripe customer
    const customersRef = admin.firestore().collection('stripe_customers');
    const customerDoc = await customersRef.doc(userId).get();
    
    let customerId: string;
    
    if (!customerDoc.exists) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          firebaseUID: userId
        }
      });
      
      await customersRef.doc(userId).set({
        customerId: customer.id,
        email: user.email
      });
      
      customerId = customer.id;
    } else {
      customerId = customerDoc.data()!.customerId;
    }

    // Create subscription session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: returnUrl,
      cancel_url: returnUrl,
    });

    res.status(200).json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

export const cancelSubscription = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { subscriptionId } = req.body;

    // Cancel the subscription
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Update Firestore
    const customerRef = await admin.firestore()
      .collection('stripe_customers')
      .where('customerId', '==', subscription.customer)
      .limit(1)
      .get();

    if (!customerRef.empty) {
      const userId = customerRef.docs[0].id;
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          subscriptionStatus: subscription.status,
          cancelAtPeriodEnd: true
        });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export const updateSubscription = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { subscriptionId, newPriceId } = req.body;

    // Update the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
    });

    // Update Firestore
    const customerRef = await admin.firestore()
      .collection('stripe_customers')
      .where('customerId', '==', subscription.customer)
      .limit(1)
      .get();

    if (!customerRef.empty) {
      const userId = customerRef.docs[0].id;
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          subscriptionTier: newPriceId
        });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

export const handleSubscriptionUpdated = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig as string,
      endpointSecret
    );

    if (event.type === 'customer.subscription.updated' || 
        event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Get Firebase user ID from Stripe customer
      const customerSnapshot = await admin.firestore()
        .collection('stripe_customers')
        .where('customerId', '==', customerId)
        .limit(1)
        .get();

      if (!customerSnapshot.empty) {
        const userId = customerSnapshot.docs[0].id;
        
        // Update subscription status in Firestore
        await admin.firestore()
          .collection('users')
          .doc(userId)
          .update({
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionTier: subscription.items.data[0].price.id,
            subscriptionCurrentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(400).send('Webhook Error');
  }
});