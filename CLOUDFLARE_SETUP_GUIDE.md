# Cloudflare Setup Guide for Xpenses

This guide will help you deploy your Xpenses application to Cloudflare for better performance, security, and global distribution.

## 🚀 Quick Start

### Prerequisites
- Cloudflare account (free)
- Domain name (optional - you can use Cloudflare Pages subdomain)
- GitHub/GitLab repository with your Xpenses code

## 📋 Step-by-Step Setup

### 1. Cloudflare Account Setup
1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for a free account
3. Verify your email address

### 2. Domain Configuration (Optional)
If you have a custom domain:
1. In Cloudflare dashboard, click "Add a Site"
2. Enter your domain name
3. Choose the Free plan
4. Update your domain's nameservers as instructed by Cloudflare

### 3. Frontend Deployment (Cloudflare Pages)

#### Option A: Connect Repository
1. Go to **Pages** in your Cloudflare dashboard
2. Click **"Create a project"**
3. Connect your GitHub/GitLab account
4. Select your Xpenses repository
5. Configure build settings:
   - **Framework preset**: React
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `/` (leave empty)

#### Option B: Manual Deployment
1. Build your frontend: `npm run build`
2. Deploy using Wrangler: `npm run deploy:pages`

### 4. Backend Deployment (Cloudflare Workers)

#### Setup Worker
1. Go to **Workers & Pages** in Cloudflare dashboard
2. Click **"Create application"**
3. Choose **"HTTP handler"**
4. Name your worker: `xpenses-backend`

#### Deploy Backend
```bash
# Authenticate with Cloudflare
wrangler login

# Deploy your backend
npm run deploy:worker
```

### 5. Environment Variables Setup

#### Frontend Variables (Cloudflare Pages)
In your Pages project settings:
- Go to **Settings** → **Environment variables**
- Add these variables:
  ```
  REACT_APP_API_URL=https://xpenses-backend.workers.dev/api
  REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
  REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  REACT_APP_FIREBASE_PROJECT_ID=your-project-id
  REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
  REACT_APP_FIREBASE_APP_ID=your-app-id
  ```

#### Backend Secrets (Cloudflare Workers)
In your Worker settings:
- Go to **Settings** → **Variables**
- Add these secrets:
  ```
  DATABASE_URL=your-postgresql-connection-string
  JWT_SECRET=your-jwt-secret
  MASTERCARD_PARTNER_ID=your-mastercard-partner-id
  MASTERCARD_CLIENT_ID=your-mastercard-client-id
  MASTERCARD_CLIENT_SECRET=your-mastercard-client-secret
  FIREBASE_PROJECT_ID=your-firebase-project-id
  FIREBASE_PRIVATE_KEY=your-firebase-private-key
  FIREBASE_CLIENT_EMAIL=your-firebase-client-email
  ```

### 6. Update CORS Configuration

Your backend needs to allow requests from your Cloudflare Pages domain:

1. Go to your Worker settings
2. Add environment variable:
   ```
   ALLOWED_ORIGINS=https://your-app.pages.dev,https://yourdomain.com
   ```

### 7. Custom Domain (Optional)

To use a custom domain:
1. In your Pages project, go to **Custom domains**
2. Click **"Set up a custom domain"**
3. Enter your domain name
4. Follow the DNS configuration instructions

## 🔧 Configuration Files

The following files have been created for Cloudflare deployment:

- `wrangler.toml` - Worker configuration
- `cloudflare-pages.toml` - Pages configuration
- `_headers` - Security headers
- `env.example` - Environment variables template

## 🚀 Deployment Commands

```bash
# Deploy frontend to Pages
npm run deploy:pages

# Deploy backend to Workers
npm run deploy:worker

# Deploy both (run from project root)
npm run deploy:pages && npm run deploy:worker
```

## 🔍 Testing Your Deployment

1. **Frontend**: Visit your Pages URL (e.g., `https://your-app.pages.dev`)
2. **Backend**: Test API endpoints at `https://xpenses-backend.workers.dev/api/health`
3. **Integration**: Try logging in and connecting a bank account

## 🛠️ Troubleshooting

### Common Issues

#### CORS Errors
- Make sure `ALLOWED_ORIGINS` includes your Pages domain
- Check that your frontend is using the correct API URL

#### Environment Variables Not Working
- Verify variables are set in the correct environment (production/staging)
- Make sure variable names match exactly (case-sensitive)

#### Build Failures
- Check that all dependencies are in `package.json`
- Verify build commands are correct
- Check build logs in Cloudflare dashboard

#### Authentication Issues
- Verify Firebase configuration
- Check that API keys are correctly set
- Ensure CORS allows your domain

### Getting Help

1. Check Cloudflare dashboard logs
2. Use browser developer tools to debug frontend issues
3. Test API endpoints directly using curl or Postman

## 📊 Benefits of Cloudflare

- **Global CDN**: Fast loading worldwide
- **DDoS Protection**: Built-in security
- **SSL/TLS**: Automatic HTTPS
- **Edge Computing**: Workers run close to users
- **Analytics**: Built-in performance monitoring
- **Free Tier**: Generous free limits

## 🔄 Continuous Deployment

Once set up, your app will automatically deploy when you push changes to your repository (if using Git integration).

## 📝 Next Steps

1. Set up monitoring and alerts
2. Configure custom error pages
3. Enable Cloudflare Analytics
4. Set up backup and disaster recovery
5. Consider upgrading to paid plans for higher limits
