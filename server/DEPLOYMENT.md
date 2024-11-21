# ReviseWise Server Deployment Guide

## Prerequisites

1. Azure CLI installed
2. Azure account with active subscription
3. Node.js 18.x or later installed
4. Docker installed

## Environment Setup

1. Install Azure CLI (if not already installed):

```bash
# Windows (PowerShell as Administrator)
winget install -e --id Microsoft.AzureCLI
macOS
brew install azure-cli
Ubuntu/Debian
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```


2. Login to Azure:

```bash
az login
```

## Container Registry Setup

1. Create Azure Container Registry:

```bash
# Create Azure Container Registry (ACR) named 'revisewiseregistry' in Basic tier with admin access enabled
az acr create --resource-group revisewise-rg --name revisewiseregistry --sku Basic --admin-enabled true
```

2. Build and push container:

```bash
# Login to Azure Container Registry
az acr login --name revisewiseregistry

# Build the image
docker build -t revisewise-api .

# Tag the image 
docker tag revisewise-api revisewiseregistry.azurecr.io/revisewise-api:latest

# Push to ACR
docker push revisewiseregistry.azurecr.io/revisewise-api:latest
```

## Deployment Steps

1. Deploy initial web app:

```bash
# Deploy to Azure App Service
az webapp up --name revisewise-api --resource-group revisewise-rg --plan revisewise-plan-linux --sku F1 --location eastus
```

2. Configure web app to use container:

```bash
# Update web app to use container from ACR
az webapp config container set --name revisewise-api --resource-group revisewise-rg --container-image-name revisewiseregistry.azurecr.io/revisewise-api:latest
```

## Post-Deployment Configuration

1. Set environment variables:

```bash
az webapp config appsettings set \
--name revisewise-api \
--resource-group revisewise-rg \
--settings \
OPENAI_API_KEY="your-key" \
NODE_ENV="production"
```


2. View application logs:

```bash
az webapp log tail \
--name revisewise-api \
--resource-group revisewise-rg
```


3. View current app settings:

```bash
# View current app settings
az webapp config appsettings list --name revisewise-api --resource-group revisewise-rg --output table
```


## Troubleshooting

1. Check application status:

```bash
az webapp show \
--name revisewise-api \
--resource-group revisewise-rg
```


2. Restart the application:

```bash
az webapp restart \
--name revisewise-api \
--resource-group revisewise-rg
```


3. View error logs:

```bash
az webapp log download \
--name revisewise-api \
--resource-group revisewise-rg
```


## Important URLs

- Main API: `https://revisewise-api.azurewebsites.net/api/v1`
- Health Check: `https://revisewise-api.azurewebsites.net/health`
- Azure Portal: `https://portal.azure.com`
- Container Registry: `https://revisewiseregistry.azurecr.io`

## Local Docker Testing

1. Build and run locally:

```bash
# Build the image
docker build -t revisewise-api .

# Run the container
docker run -p 8080:8080 --name revisewise-api-container revisewise-api
```

2. Test local endpoints:

```bash
# Health check
curl http://localhost:8080/health

# API root
curl http://localhost:8080/api/v1
```

## Cost Management

The F1 (Free) tier includes:
- 60 minutes/day of compute
- 1GB storage
- Shared infrastructure

To upgrade to a paid tier for production:

```bash
az appservice plan update \
--name revisewise-plan-linux \
--resource-group revisewise-rg \
--sku B1
```


## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Node.js on Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [Azure CLI Documentation](https://docs.microsoft.com/en-us/cli/azure/)
- [Azure Container Registry Documentation](https://docs.microsoft.com/en-us/azure/container-registry/)
