# Firebase Authentication Setup Guide

## Prerequisites
- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Your Firebase configuration keys (already added to the project)

## Firebase Console Configuration

### 1. Enable Authentication
1. Go to your Firebase Console
2. Navigate to **Authentication** in the left sidebar
3. Click on **Get started**

### 2. Enable Google Authentication
1. In the Authentication section, go to **Sign-in method** tab
2. Click on **Google** provider
3. Enable it by toggling the switch
4. Add your authorized domain (localhost for development)
5. Save the changes

### 3. Enable Email/Password Authentication
1. In the Authentication section, go to **Sign-in method** tab
2. Click on **Email/Password** provider
3. Enable it by toggling the switch
4. Optionally enable "Email link (passwordless sign-in)" if desired
5. Save the changes

### 4. Configure Authorized Domains
1. In the Authentication section, go to **Settings** tab
2. Scroll down to **Authorized domains**
3. Add your domains:
   - `localhost` (for development)
   - Your production domain when deployed

### 5. Set Up Password Reset (Optional)
1. In the Authentication section, go to **Templates** tab
2. Click on **Password reset**
3. Customize the email template if desired
4. Save the changes

## Features Implemented

### Authentication Methods
- ✅ Google Sign-in with popup
- ✅ Email/Password Sign-in
- ✅ Email/Password Sign-up
- ✅ Password Reset
- ✅ Sign Out
- ✅ Authentication State Management

### User Experience
- ✅ Modal-based authentication
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Password visibility toggle
- ✅ Responsive design

### Security Features
- ✅ Firebase security rules (configure in Firestore)
- ✅ Password strength requirements
- ✅ Email verification (can be enabled)
- ✅ Session management

## Usage

### For Users
1. Click on the profile icon in the header
2. Choose between Google or Email authentication
3. For email auth: Switch between Sign In, Sign Up, and Password Reset modes
4. Complete the authentication process

### For Developers
The authentication system is fully integrated with:
- `useAuth` hook for authentication state
- `AuthModal` component for UI
- Firebase configuration in `src/config/firebase.js`

## Next Steps

### 1. Enable Firestore (if not already done)
1. Go to **Firestore Database** in Firebase Console
2. Create a database in test mode or production mode
3. Set up security rules for user data

### 2. Configure Security Rules
```javascript
// Example Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Enable Analytics (Optional)
1. Go to **Analytics** in Firebase Console
2. Follow the setup instructions
3. Analytics ID is already in your config

## Troubleshooting

### Common Issues
1. **"Firebase: Error (auth/popup-closed-by-user)"**
   - User closed the popup window
   - This is normal behavior

2. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console

3. **"Firebase: Error (auth/weak-password)"**
   - Password must be at least 6 characters

4. **"Firebase: Error (auth/email-already-in-use)"**
   - User already has an account with that email

### Development Tips
- Use browser developer tools to check for console errors
- Check Firebase Console logs for authentication events
- Test with different browsers and devices
- Verify Firebase configuration keys are correct

## Security Best Practices
1. Never commit Firebase config keys to public repositories
2. Use environment variables for production
3. Set up proper Firestore security rules
4. Enable email verification for production apps
5. Monitor authentication logs in Firebase Console

## Environment Variables (Production)
Create a `.env` file for production:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Then update `src/config/firebase.js` to use environment variables:
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```
