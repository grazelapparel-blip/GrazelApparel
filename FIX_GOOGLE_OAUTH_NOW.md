# 🔧 Fix Google OAuth - Complete Solution

## Problem
Two errors blocking Google OAuth:
1. ❌ "Missing or insufficient permissions" - Firestore security rules not deployed
2. ❌ "Cross-Origin-Opener-Policy blocked" - CORS headers missing

## Solution (3 Easy Steps)

---

## Step 1: Deploy Firestore Security Rules

### In Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **grazel-apparel** project
3. Click **Firestore Database** (left sidebar)
4. Click **Rules** tab
5. **Clear everything** in the rules editor
6. **Copy & paste** this entire code:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection - user specific and admin
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if request.auth.uid == userId;
      allow create: if request.auth.uid != null;
    }

    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Categories - public read, admin write
    match /product_categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Packaging - public read, admin write
    match /packaging_options/{packageId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Navigation Menu - public read, admin write
    match /navigation_menu_items/{navId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Cart Items - authenticated users
    match /cartItems/{cartId} {
      allow read: if request.auth.uid != null;
      allow create, update, delete: if request.auth.uid != null;
    }

    // Orders - authenticated users
    match /orders/{orderId} {
      allow read: if request.auth.uid != null;
      allow create, update, delete: if request.auth.uid != null;
    }

    // Order Items - authenticated users
    match /orderItems/{itemId} {
      allow read: if request.auth.uid != null;
      allow create, update, delete: if request.auth.uid != null;
    }

    // Fit Profiles - authenticated users
    match /fitProfiles/{profileId} {
      allow read: if request.auth.uid != null;
      allow create, update, delete: if request.auth.uid != null;
    }

    // Reviews - public read, authenticated create
    match /reviews/{reviewId} {
      allow read: if true;
      allow create, update, delete: if request.auth.uid != null;
    }

    // Newsletter - public create
    match /newsletterSubscribers/{subId} {
      allow create: if true;
      allow read, update, delete: if false;
    }

    // Favorites - authenticated users
    match /user_favorites/{favId} {
      allow read, create, update, delete: if request.auth.uid != null;
    }

    // Returns - authenticated users
    match /order_returns/{returnId} {
      allow read, create, update, delete: if request.auth.uid != null;
    }

    // Analytics - authenticated users
    match /user_analytics/{analyticsId} {
      allow read, create, update, delete: if request.auth.uid != null;
    }
  }
}
```

7. Click **Publish** button
8. Confirm the deployment ✅

---

## Step 2: Redeploy Firebase Hosting (NEW CONFIG)

The firebase.json has been updated with CORS headers for Google OAuth.

### Run this command:
```bash
firebase deploy --only hosting
```

This updates the Cross-Origin-Opener-Policy headers to allow Google OAuth popups.

---

## Step 3: Clear Browser Cache & Test

1. **Hard refresh** your browser:
   - Windows: `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`

2. **Clear site data** (optional but recommended):
   - Open DevTools (F12)
   - Application tab → Storage → Clear site data
   - Close and reopen your app

3. **Test Google Sign-In**:
   - Click "Continue with Google"
   - Sign in with your Google account
   - ✅ You should be signed in!

---

## What Changed

### firebase.json (Updated)
- Added `"headers"` section
- Sets `Cross-Origin-Opener-Policy: same-origin-allow-popups`
- Allows Google OAuth popups to communicate with your app

### FIRESTORE_RULES.txt (Reference)
- Already correct, just needs deployment to Firebase Console

---

## Why These Fixes Work

| Error | Cause | Fix |
|-------|-------|-----|
| "Missing or insufficient permissions" | Security rules not deployed to Firebase | Deploy rules to Firebase Console |
| "Cross-Origin-Opener-Policy blocked" | Firebase hosting missing CORS headers | Update firebase.json with headers |

---

## Verification Checklist

- [ ] Security rules deployed in Firebase Console
- [ ] firebase.json updated with headers
- [ ] `firebase deploy --only hosting` completed
- [ ] Browser cache cleared
- [ ] Google OAuth popup works
- [ ] User created in Firestore `users` collection
- [ ] Successfully signed in

---

## If Still Not Working

### Try This:
1. Go to Firebase Console
2. **Authentication** → **Settings**
3. Scroll to **Authorized domains**
4. Verify your domain is listed:
   - If dev: `localhost:5173` should be auto-allowed
   - If production: Add your domain name

### Debug Console Errors:
Open DevTools (F12) → Console and check for:
- ✅ No "Missing or insufficient permissions" error
- ✅ No "Cross-Origin-Opener-Policy" error
- ✅ Google popup opens successfully

---

## Summary

✅ **Code**: Google OAuth fully implemented  
✅ **Firebase Rules**: Deploy to Firebase Console (Step 1)  
✅ **CORS Headers**: Updated firebase.json (Step 2)  
✅ **Deploy**: Run firebase deploy --only hosting (Step 2)  
✅ **Test**: Clear cache and test (Step 3)  

**Estimated Time**: 5 minutes  
**Difficulty**: Easy

---

**Status**: 🟢 Ready to Fix!
