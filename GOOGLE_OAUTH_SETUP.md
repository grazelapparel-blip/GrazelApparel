# Google OAuth Setup Guide

**Date:** May 3, 2026  
**Status:** Complete - Ready for Configuration  
**Feature:** Sign up / Login with Google

---

## Overview

Your application now supports **Google OAuth authentication**! Users can sign up and login using their Google account in addition to email/password.

---

## Step-by-Step Setup

### Step 1: Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **grazel-apparel**
3. Click **Authentication** (left sidebar)
4. Click **Sign-in method** tab
5. Click **Google**
6. Toggle **Enable** to ON
7. Select or create a support email
8. Click **Save**

✅ **Google sign-in is now enabled in Firebase**

---

### Step 2: Configure OAuth Consent Screen (Google Cloud Console)

This step is only needed if you're deploying to production.

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Choose **External** as User Type
5. Click **Create**
6. Fill in the form:
   - **App name:** Grazel Apparel
   - **User support email:** your-email@gmail.com
   - **Developer contact email:** your-email@gmail.com
7. Click **Save and Continue**
8. Click **Save and Continue** on Scopes page (use default scopes)
9. Click **Save and Continue** on Test users page
10. Review and click **Back to Dashboard**

✅ **OAuth consent screen is configured**

---

### Step 3: Test Google Sign-In (Development)

#### Development (Localhost)

For development, you can sign in with any Google account without additional setup:

1. Open your app: `http://localhost:5173`
2. Click **"Continue with Google"** button
3. Select your Google account
4. Google will ask for permission to access your profile
5. Click **Allow**
6. You'll be signed in! ✅

#### Local Testing with Authorized Domains

To test on localhost, Firebase automatically allows:
- `localhost:3000` to `localhost:9999`
- `127.0.0.1:3000` to `127.0.0.1:9999`

#### Testing with Custom Domain

If testing with a custom domain (not localhost), you need to add it to Firebaseauthorized domains:

1. Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Enter your domain: `example.com` (or `subdomain.example.com`)
5. Click **Add**

---

### Step 4: Deploy to Production

When deploying to production:

1. **Update OAuth Redirect URI** in Google Cloud Console:
   - Go to Google Cloud Console
   - APIs & Services → Credentials
   - Find your Web application
   - Click to edit
   - Add Authorized redirect URIs:
     ```
     https://grazel-apparel.firebaseapp.com/__/auth/handler
     https://your-domain.com/__/auth/handler
     https://www.your-domain.com/__/auth/handler
     ```
   - Click Save

2. **Add Domain to Firebase**:
   - Firebase Console → Authentication → Settings
   - Authorized domains → Add your production domains

3. **Deploy your app**:
   ```bash
   firebase deploy
   ```

---

## Features

✅ **Sign Up with Google**
- New users can create account using Google
- Email and name auto-populated from Google account
- User automatically created in Firestore

✅ **Sign In with Google**
- Existing users can login with Google
- Same email = Same account
- Session maintained across page refreshes

✅ **Account Linking**
- Users can link Google account to existing email account
- Currently not implemented (can be added later)

✅ **Profile Data**
- Name from Google account used
- Profile photo/avatar from Google available
- Stored in Firestore for future use

---

## Error Handling

The app handles these scenarios:

### Pop-up Blocked
```
❌ Pop-up was blocked. Please enable pop-ups for this site.
```
**Solution:** User needs to allow pop-ups in browser settings

### Operation Not Supported
```
❌ Google sign-in is not available in this environment. Please use email/password instead.
```
**Solution:** This happens in environments without pop-up support (older browsers, specific frameworks). Fallback to email/password.

### User Cancelled
```
❌ Google sign-in was cancelled. Please try again.
```
**Solution:** User clicked cancel or closed the popup. Try again.

### Missing Configuration
```
❌ Google sign-in failed. Please try again or use email/password.
```
**Solution:** Check Firebase configuration in environment variables

---

## Environment Variables (Already Configured)

Your `.env.local` should have these (auto-loaded from Firebase):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**No additional Google-specific env vars needed!** Firebase handles it automatically.

---

## Code Implementation

### Backend (Already Done)
**File:** `src/lib/firebase.ts`
- ✅ `signInWithGoogle()` function
- ✅ Google provider setup
- ✅ Firestore user creation on first sign-in
- ✅ Error handling for all scenarios

### Frontend (Already Done)
**File:** `src/app/components/user-auth.tsx`
- ✅ "Continue with Google" button
- ✅ `handleGoogleSignIn()` function
- ✅ Loading state management
- ✅ Error display
- ✅ Works for both signup and signin

---

## Testing Checklist

- [ ] Test Google sign-in on localhost
- [ ] Test Google sign-up (new email)
- [ ] Test Google sign-in (existing account)
- [ ] Test error handling (block pop-ups, cancel, etc.)
- [ ] Test logout and re-login with Google
- [ ] Verify user data saved to Firestore
- [ ] Test on mobile device
- [ ] Test in different browsers (Chrome, Firefox, Safari)
- [ ] Test in production after deployment

---

## FAQ

### Q: Can users link Google to existing email account?
**A:** Not currently. If user signed up with email and tries Google with different email, they get a new account. This can be added later.

### Q: Is Google sign-in secure?
**A:** Yes! Firebase handles all OAuth security. Your API key is safe (it's restricted to your domain).

### Q: Do I need to use Google Console?
**A:** 
- **Development:** No, Firebase Console only.
- **Production:** Yes, for OAuth consent screen and redirect URLs.

### Q: What data does Google send us?
**A:** Only what user authorizes (email, name, profile photo). No credit card or password info.

### Q: Can users sign out and sign back in?
**A:** Yes! Sign out button works for both email and Google sign-ins.

---

## Support

- **Firebase Docs:** https://firebase.google.com/docs/auth/web/google-signin
- **Google OAuth Docs:** https://developers.google.com/identity
- **Troubleshooting:** https://firebase.google.com/support

---

## Summary

✅ **Code Implementation:** Complete - Google OAuth functions ready  
✅ **UI Integration:** Complete - "Continue with Google" button added  
⏳ **Firebase Console Setup:** You need to enable Google provider  
⏳ **Google Cloud Console:** Needed for production deployment  
⏳ **Testing:** Ready to test once Firebase is configured

**Next Steps:**
1. Go to Firebase Console
2. Enable Google sign-in provider
3. Test on localhost
4. Deploy to production

**Status:** Ready for Google OAuth! 🚀
