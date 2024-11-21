import { o as w, l as o, s as y, a as s, b as E, g as I, d as p, c as L } from "./logger.C_sQt7f9.js";
const u = document.getElementById("loginView"), l = document.getElementById("profileView"), m = document.getElementById("loginForm"), v = document.getElementById("logoutButton"), B = document.getElementById("startSession"), C = document.getElementById("userName"), S = document.getElementById("userEmail"), b = document.getElementById("userRole"), A = document.getElementById("userAvatar"), T = document.getElementById("studyTime"), x = document.getElementById("sessionCount"), i = document.getElementById("errorMessage");
m.addEventListener("submit", F);
v.addEventListener("click", N);
B.addEventListener("click", V);
w(s, P);
window.addEventListener("online", () => {
  o.syncLocalLogs();
});
async function F(t) {
  t.preventDefault();
  const n = document.getElementById("email"), e = document.getElementById("password"), r = n.value, d = e.value;
  try {
    U(), await o.info("Login attempt", { email: r });
    const a = await y(s, r, d);
    await g(a.user), await o.info("Login successful", { userId: a.user.uid }), f();
  } catch (a) {
    console.error("Authentication error:", a), await o.error("Login failed", { email: r }, a), c(R(a.code));
  }
}
async function N() {
  var t, n;
  try {
    const e = (t = s.currentUser) == null ? void 0 : t.uid;
    await o.info("Logout attempt", { userId: e }), await E(s), await o.info("Logout successful", { userId: e }), h();
  } catch (e) {
    console.error("Sign out error:", e), await o.error("Logout failed", { userId: (n = s.currentUser) == null ? void 0 : n.uid }, e), c("Failed to sign out. Please try again.");
  }
}
async function P(t) {
  try {
    t ? (await g(t), f(), await o.info("Auth state changed - user logged in", { userId: t.uid })) : (h(), await o.info("Auth state changed - user logged out"));
  } catch (n) {
    await o.error("Error handling auth state change", {}, n);
  }
}
async function g(t) {
  try {
    const e = (await I(p(L, "users", t.uid))).data();
    C.textContent = (e == null ? void 0 : e.name) || "Student", S.textContent = t.email, b.textContent = (e == null ? void 0 : e.role) || "Student", A.src = (e == null ? void 0 : e.photoURL) || "icons/default-avatar.png", e != null && e.stats && (T.textContent = M(e.stats.totalStudyTime || 0), x.textContent = e.stats.sessionsCompleted || 0), await o.info("User profile loaded", { userId: t.uid }), chrome.tabs.query({ active: !0, currentWindow: !0 }, async (r) => {
      try {
        if (!r[0].id) throw new Error("No active tab found");
        await chrome.tabs.sendMessage(r[0].id, {
          type: "ENABLE_TEXT_SELECTION",
          userRole: e == null ? void 0 : e.role
        }), await o.info("Text selection enabled", {
          userId: t.uid,
          tabId: r[0].id
        });
      } catch (d) {
        await o.error("Failed to enable text selection", {
          userId: t.uid,
          tabId: r[0].id
        }, d);
      }
    });
  } catch (n) {
    console.error("Error loading profile:", n), await o.error("Failed to load user profile", { userId: t.uid }, n), c("Failed to load profile data.");
  }
}
function V() {
  chrome.tabs.create({ url: "https://app.revisewise.co/dashboard" });
}
function h() {
  u.classList.remove("hidden"), l.classList.add("hidden"), m.reset();
}
function f() {
  u.classList.add("hidden"), l.classList.remove("hidden");
}
function M(t) {
  return `${Math.floor(t / 60)}h`;
}
function c(t) {
  i.textContent = t, i.classList.remove("hidden");
}
function U() {
  i.textContent = "", i.classList.add("hidden");
}
function R(t) {
  switch (t) {
    case "auth/invalid-credential":
      return "Invalid email or password";
    case "auth/user-disabled":
      return "This account has been disabled";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later";
    default:
      return "An error occurred. Please try again";
  }
}
