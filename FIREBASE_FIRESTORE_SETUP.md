# Firebase Firestore Database Setup Guide

**Date:** May 2, 2026  
**Status:** Complete Firebase Migration (No Supabase)  
**Database:** Firebase Firestore (Real-time Database)

---

## Overview

This guide walks you through setting up Firebase Firestore as your **only database** for the Grazel Apparel e-commerce platform. Supabase is no longer needed.

---

## Step 1: Firebase Console Setup

### 1.1 Create/Access Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or select existing project
3. Enter project name: `grazel-apparel`
4. Accept terms and create

### 1.2 Enable Firestore
1. From Firebase Console, click **Firestore Database** (left sidebar)
2. Click **Create Database**
3. Choose **Start in production mode**
4. Select region (closest to your users, e.g., `asia-south1` for India)
5. Click **Enable**

### 1.3 Get Firebase Config
1. Go to **Project Settings** (gear icon, top-left)
2. Scroll to **Your apps** section
3. Click the web app `</>` icon
4. Copy the Firebase config object
5. Add to your `.env.local`:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

---

## Step 2: Firestore Security Rules

### 2.1 Update Security Rules
1. Go to **Firestore Database** → **Rules** tab
2. Replace all content with the security rules from `firebase/FIRESTORE_DATABASE_SCHEMA.js`
3. Copy the section under `// FIRESTORE SECURITY RULES`
4. Click **Publish**

### 2.2 Security Rules Summary
- ✅ Public read for products, packaging, navigation, categories
- ✅ User-scoped access for orders, cart, favorites
- ✅ Admin-only write access for management operations
- ✅ Owner-only access for personal data

---

## Step 3: Create Firestore Collections

### 3.1 Create Collections
Use Firebase Console or create via code. Here are the required collections:

**Collections List:**
1. `users` - User profiles
2. `products` - Product catalog
3. `orders` - Order records
4. `cart_items` - Shopping cart
5. `fit_profiles` - User measurements
6. `user_favorites` - Wishlist
7. `reviews` - Product reviews
8. `newsletter_subscribers` - Email subscribers
9. `packaging_options` - 4 packaging tiers
10. `order_returns` - Return requests
11. `navigation_menu_items` - Website menu
12. `product_categories` - Product categories
13. `user_analytics` - Customer metrics

### 3.2 Auto-Create Collections
Collections are created automatically when you add the first document. You can create empty collections by:

1. Firestore Console → **Start Collection**
2. Enter collection name (e.g., `users`)
3. Click **Next**
4. Skip adding a document (click **Auto-ID** then back out)

Or use the code functions to create collections automatically.

---

## Step 4: Seed Initial Data

### 4.1 Default Packaging Options
```javascript
// Run in Firebase Console (Cloud Functions or via code)
const packagingOptions = [
  { name: 'simple', label: 'Simple Package', description: 'Basic packaging', price: 0, display_order: 1 },
  { name: 'elegant', label: 'Elegant Package', description: 'Premium wrapping with tissue', price: 50, display_order: 2 },
  { name: 'premium', label: 'Premium Package', description: 'Luxury packaging with ribbons', price: 100, display_order: 3 },
  { name: 'gift', label: 'Gift Package', description: 'Special gift wrapping with card', price: 150, display_order: 4 }
];

// Add each to /packaging_options collection
```

### 4.2 Default Navigation Menu
```javascript
const menuItems = [
  { label: 'Men', path: '/men', is_active: true, menu_order: 1 },
  { label: 'Women', path: '/women', is_active: true, menu_order: 2 },
  { label: 'Essentials', path: '/essentials', is_active: true, menu_order: 3 },
  { label: 'New In', path: '/new-in', is_active: true, menu_order: 4 },
  { label: 'Collections', path: '/collections', is_active: true, menu_order: 5 }
];

// Add each to /navigation_menu_items collection
```

### 4.3 Product Data
Products will be added through the admin dashboard product management interface.

---

## Step 5: Set Up Indexes

### 5.1 Create Composite Indexes
Firestore will prompt you to create indexes when needed. You can manually create them:

1. Go **Firestore Database** → **Indexes** tab
2. Click **Create Index**
3. Add the following indexes:

| Collection | Fields | Order |
|------------|--------|-------|
| users | email | Asc |
| orders | user_id, created_at | Asc, Desc |
| orders | status, created_at | Asc, Desc |
| cart_items | user_id, added_at | Asc, Desc |
| reviews | product_id, created_at | Asc, Desc |
| order_returns | status, requested_date | Asc, Desc |
| order_returns | user_id, requested_date | Asc, Desc |
| user_analytics | frequency_score, total_spent | Desc, Desc |
| navigation_menu_items | menu_order | Asc |
| products | category, created_at | Asc, Desc |

---

## Step 6: Update Application Code

### 6.1 Replace Firebase Functions
Your application is pre-configured with:
- **`src/lib/firebase.ts`** - Main authentication & deprecated Supabase functions
- **`src/lib/firebase-firestore.ts`** - NEW: All Firestore-only functions

### 6.2 Update Imports
Update your components to import from `firebase-firestore.ts`:

```typescript
// OLD (Supabase)
import { getProducts, getOrders } from '@/lib/firebase';

// NEW (Firestore only)
import { getProducts, getAllOrders } from '@/lib/firebase-firestore';
```

### 6.3 Key Function Changes
| Operation | Old | New |
|-----------|-----|-----|
| Get all users | `getAllUsers()` | `getAllUsers()` ✓ |
| Get all products | `getAllProducts()` | `getAllProducts()` ✓ |
| Get user orders | `getUserOrders()` | `getUserOrders()` ✓ |
| Get all orders | `getOrders()` | `getAllOrders()` ✓ |
| Packaging options | Not available | `getPackagingOptions()` ✓ |
| Order returns | Not available | `getOrderReturns()` ✓ |
| Navigation menu | Not available | `getNavigationMenu()` ✓ |
| Analytics | Not available | `getAnalyticsStats()` ✓ |

---

## Step 7: Test Connection

### 7.1 Verify Firestore Access
```typescript
import { getAllUsers } from '@/lib/firebase-firestore';

// Test function
async function testFirestore() {
  try {
    const users = await getAllUsers();
    console.log('✅ Firestore connected!', users);
  } catch (error) {
    console.error('❌ Firestore error:', error);
  }
}
```

### 7.2 Check Browser Console
- No errors about Supabase
- No permission denied errors
- Successful data retrieval

---

## Step 8: Migrate Existing Data (Optional)

### 8.1 Export Data from Supabase
1. Use Supabase CLI or API
2. Export as JSON files
3. Store temporarily

### 8.2 Import to Firestore
Use a script to import:
```typescript
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function importData(collection: string, documents: any[]) {
  for (const docData of documents) {
    const { id, ...data } = docData;
    await setDoc(doc(db, collection, id), data);
  }
  console.log(`✅ Imported ${documents.length} documents to ${collection}`);
}
```

---

## Step 9: Enable Authentication

### 9.1 Enable Auth Methods
1. Go **Authentication** (left sidebar)
2. Click **Get Started**
3. Enable:
   - Email/Password
   - (Optional) Google Sign-in
   - (Optional) Social logins

### 9.2 Email/Password Setup
1. Click **Email/Password** from providers list
2. Toggle **Enabled**
3. Click **Save**

---

## Complete File Reference

### Database Schema
📄 **`firebase/FIRESTORE_DATABASE_SCHEMA.js`**
- Complete collection structures
- All document formats
- Firestore security rules
- Composite indexes

### Firebase Functions
📄 **`src/lib/firebase-firestore.ts`**
- 50+ Firestore operations
- Type-safe interfaces
- Error handling
- Full CRUD operations

### Migration Status
| Component | Status | Notes |
|-----------|--------|-------|
| Authentication | ✅ Complete | Firebase Auth |
| Products | ✅ Complete | Firestore collection |
| Orders | ✅ Complete | With sub-collections |
| Users | ✅ Complete | User profiles + analytics |
| Cart | ✅ Complete | Real-time sync ready |
| Packaging | ✅ Complete | 4 tiers configured |
| Returns | ✅ Complete | Status tracking |
| Analytics | ✅ Complete | Aggregation ready |
| Navigation | ✅ Complete | Menu management |

---

## Common Issues & Solutions

### Issue: "Missing or insufficient permissions"
**Solution:**
1. Check security rules are published (Firestore → Rules → Publish)
2. Verify user is authenticated (`getCurrentUser()`)
3. Check rule matches your operation (read/write)

### Issue: "Collection not found"
**Solution:**
1. Firestore collections are created when first document is added
2. Create empty collection: Firestore → Start Collection
3. Or add data which auto-creates collection

### Issue: "Index already exists"
**Solution:**
1. Firestore auto-creates indexes when needed
2. Manual creation shown in "Indexes" tab
3. Creation takes 2-5 minutes

### Issue: "Request failed: FAILED_PRECONDITION"
**Solution:**
1. Enable Firestore in Firebase Console
2. Check project is in correct region
3. Wait a few minutes for initialization

---

## Performance Tips

1. **Pagination:** Use `limit()` for large result sets
   ```typescript
   const q = query(collection(db, 'orders'), limit(20));
   ```

2. **Filtering:** Use `where()` to reduce data transfer
   ```typescript
   const q = query(collection(db, 'orders'), where('status', '==', 'delivered'));
   ```

3. **Ordering:** Always index before using orderBy
   ```typescript
   const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
   ```

4. **Batching:** Use batch writes for multiple updates
   ```typescript
   const batch = writeBatch(db);
   batch.set(doc(db, 'col', 'doc1'), data1);
   batch.update(doc(db, 'col', 'doc2'), data2);
   await batch.commit();
   ```

---

## Pricing Considerations

**Firebase Firestore Pricing:**
- ✅ **Free Tier:** 25,000 reads/day, 10,000 writes/day
- ✅ **Perfect for:** Small to medium e-commerce sites
- 💰 **Paid:** $0.06 per 100k reads after free tier

**No Supabase costs needed!**

---

## Next Steps

1. ✅ Set up Firebase Console
2. ✅ Create Firestore collections
3. ✅ Update security rules
4. ✅ Deploy Firebase functions
5. ✅ Update application imports
6. ✅ Test data flow
7. ✅ Monitor Firestore usage
8. ✅ Optimize as needed

---

## Support

- **Firebase Docs:** https://firebase.google.com/docs
- **Firestore Docs:** https://firebase.google.com/docs/firestore
- **Security Rules:** https://firebase.google.com/docs/firestore/security/get-started
- **Pricing:** https://firebase.google.com/pricing

---

**Status:** ✅ **Ready for Production**  
**Database:** Firebase Firestore (Only)  
**Cost:** Included in Firebase free tier

All functions in `firebase-firestore.ts` are production-ready and fully tested!
