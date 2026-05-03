# Grazel Apparel - Admin Dashboard Integration Guide

## Overview
Complete integration of the comprehensive admin dashboard system with 11 management features, database schema updates, and enhanced UI components.

**Last Updated:** May 2, 2026  
**Status:** ✅ Ready for Implementation

---

## 1. Database Schema Updates

### 1.1 Schema Update File
**File:** `supabase/schema-update-admin-features.sql`

This SQL file contains all necessary database updates to support the admin dashboard features. It is fully idempotent and safe to run multiple times on your Supabase database.

### 1.2 Database Changes Summary

#### Tables Updated
- `products` - Added `stock` (INTEGER) and `currency_code` (TEXT) columns
- `orders` - Added `packaging_id` (UUID) and `packaging_price` (DECIMAL) columns
- `users` - Added analytics tracking columns (is_frequent_customer, last_purchase_date, total_orders, total_spent)

#### New Tables Created

**1. packaging_options**
- Stores packaging tier options (Simple, Elegant, Premium, Gift)
- Columns: id, name, label, description, price, currency_code, is_active, display_order
- Default data: 4 packaging tiers (₹0, ₹50, ₹100, ₹150)

**2. order_returns**
- Tracks product returns and exchanges
- Columns: id, order_id, user_id, product_id, reason, status, requested_date, resolved_date, notes
- Status values: 'requested' | 'approved' | 'rejected' | 'completed'

**3. navigation_menu_items**
- Website navigation menu control
- Columns: id, label, path, is_active, menu_order, icon_name, description
- Default data: 5 menu items (Men, Women, Essentials, New In, Collections)

**4. product_categories**
- Structured category management
- Columns: id, name, description, slug, is_active, display_order

**5. user_analytics**
- Customer behavior and metrics tracking
- Columns: id, user_id, total_orders, total_spent, last_order_date, frequency_score, return_count, average_order_value, return_rate

**6. order_packaging_history**
- Audit trail of packaging selections per order
- Columns: id, order_id, packaging_option_id, packaging_name, packaging_price

### 1.3 How to Apply Database Updates

#### Option A: Using Supabase Dashboard
1. Go to Supabase Dashboard → Your Project
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy entire contents of `supabase/schema-update-admin-features.sql`
5. Paste into SQL Editor
6. Click "Run"

#### Option B: Using Supabase CLI
```bash
supabase db push supabase/schema-update-admin-features.sql
```

#### Option C: Local Development (if running Supabase locally)
```bash
psql postgresql://... -f supabase/schema-update-admin-features.sql
```

### 1.4 Verification
After running the update, verify in Supabase SQL Editor:
```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('packaging_options', 'order_returns', 'navigation_menu_items', 'product_categories', 'user_analytics');

-- Check new columns in products table
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('stock', 'currency_code');

-- Verify packaging options seeded
SELECT * FROM packaging_options;

-- Verify navigation menu seeded
SELECT * FROM navigation_menu_items;
```

---

## 2. React Component Updates

### 2.1 Cart Checkout Component
**File:** `src/app/components/cart-checkout.tsx`

**Updates Made:**
- ✅ Added packaging selection UI with 4 tiers
- ✅ Packaging costs dynamically added to order total
- ✅ Updated shipping threshold to ₹500 (free shipping over ₹500)
- ✅ All prices display in ₹ (Indian Rupees)
- ✅ Radio button selection for packaging options with descriptions and prices

**Key Features:**
```tsx
// Packaging selection with live price updates
<label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer">
  <input type="radio" name="packaging" checked={...} onChange={...} />
  <div>
    <p className="font-medium">{option.label}</p>
    <p className="text-sm text-gray-500">{option.description}</p>
  </div>
  <span className="text-crimson font-medium">
    {option.price > 0 ? `+₹${option.price}` : 'Free'}
  </span>
</label>
```

**Usage:**
- Users see 4 packaging options on checkout
- Default: Simple Package (₹0)
- Can upgrade to Elegant (₹50), Premium (₹100), or Gift (₹150)
- Total recalculates with packaging cost included

### 2.2 Product Card Component
**File:** `src/app/components/product-card.tsx`

**Updates Made:**
- ✅ Added `stock` property to component props
- ✅ Stock status badge displays on product images
- ✅ Color-coded stock indicators:
  - **Green** (>10): "✓ In Stock"
  - **Amber** (1-10): "X Left" showing exact count
  - **Red** (0): "Out of Stock"

**Key Features:**
```tsx
{/* Stock Status Badge */}
{stock !== undefined && (
  <div className={`absolute bottom-4 left-4 px-3 py-1 text-[12px] font-medium text-white ${
    stock > 10 ? 'bg-green-600' : stock > 0 ? 'bg-amber-500' : 'bg-red-600'
  }`}>
    {stock > 10 ? '✓ In Stock' : stock > 0 ? `${stock} Left` : 'Out of Stock'}
  </div>
)}
```

### 2.3 Product Detail Component
**File:** `src/app/components/product-detail.tsx`

**Updates Made:**
- ✅ Added stock availability display with status indicator
- ✅ "Add to Cart" button disabled when out of stock
- ✅ Button text changes to "Out of Stock" when unavailable
- ✅ Updated free shipping threshold to ₹500
- ✅ Stock status shows inline with product price

**Key Features:**
```tsx
{/* Stock Status Indicator */}
{product.stock !== undefined && (
  <div className={`mt-3 text-[14px] font-medium flex items-center gap-2 ${
    product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'
  }`}>
    <span className={`w-3 h-3 rounded-full ${
      product.stock > 10 ? 'bg-green-600' : product.stock > 0 ? 'bg-amber-600' : 'bg-red-600'
    }`}></span>
    {product.stock > 10 ? '✓ In Stock' : product.stock > 0 ? `Only ${product.stock} Left` : 'Out of Stock'}
  </div>
)}

{/* Disabled add to cart for out of stock */}
<button disabled={!selectedSize || product.stock === 0}>
  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
</button>
```

### 2.4 Product Listing Component
**File:** `src/app/components/product-listing.tsx`

**Updates Made:**
- ✅ Stock data automatically passed to product cards via `{...product}` spread
- ✅ No changes needed - already supports new props

---

## 3. Firebase Integration

### 3.1 New Firebase Functions
**File:** `src/lib/firebase.ts`

**New Interfaces Added:**
- `FirebasePackagingOption` - Packaging tier data
- `FirebaseOrderReturn` - Return request data
- `FirebaseNavigationMenuItem` - Menu item data
- `FirebaseUserAnalytics` - Customer analytics data

**New Functions Implemented:**

#### Packaging Options (6 functions)
```typescript
getPackagingOptions(onlyActive?: boolean)
createPackagingOption(data)
updatePackagingOption(optionId, updates)
deletePackagingOption(optionId)
```

#### Order Returns (6 functions)
```typescript
getOrderReturns(filters?)
createOrderReturn(data)
updateOrderReturn(returnId, updates)
deleteOrderReturn(returnId)
```

#### Navigation Menu (4 functions)
```typescript
getNavigationMenu(onlyActive?)
createNavigationMenuItem(data)
updateNavigationMenuItem(menuItemId, updates)
deleteNavigationMenuItem(menuItemId)
```

#### User Analytics (5 functions)
```typescript
getUserAnalytics(userId)
createUserAnalytics(data)
updateUserAnalytics(analyticsId, updates)
getFrequentCustomers(limit?)
getAnalyticsStats()
```

### 3.2 Using Firebase Functions

#### Example: Add Packaging Option
```typescript
import { createPackagingOption } from '@/lib/firebase';

const newPackaging = await createPackagingOption({
  name: 'custom',
  label: 'Custom Package',
  description: 'Custom wrapping service',
  price: 200,
  currencyCode: 'INR',
  isActive: true,
  displayOrder: 5
});
```

#### Example: Track Product Return
```typescript
import { createOrderReturn } from '@/lib/firebase';

const returnRequest = await createOrderReturn({
  orderId: 'order-123',
  userId: 'user-456',
  productId: 'product-789',
  reason: 'Size too small',
  status: 'requested',
  requestedDate: new Date().toISOString()
});
```

#### Example: Get Analytics
```typescript
import { getAnalyticsStats, getFrequentCustomers } from '@/lib/firebase';

const stats = await getAnalyticsStats();
// Returns: { totalRevenue, totalCustomers, totalReturnRequests, returnRate, averageOrderValue }

const topCustomers = await getFrequentCustomers(10);
// Returns top 10 customers by frequency and spending
```

---

## 4. Admin Dashboard Features

### 4.1 Feature Breakdown

**Tab 1: Overview**
- Revenue metrics in ₹
- Order count and status breakdown
- User metrics
- Product inventory status
- Return statistics

**Tab 2: Users**
- User list with CRUD operations
- Total orders and spending per user
- User management (add, edit, delete)
- Search functionality

**Tab 3: Orders**
- Order list with status filtering
- Status updates (ordered → acknowledged → shipping → delivered)
- Order detail modal showing items and pricing
- Packaging information display

**Tab 4: Categories**
- Add/remove product categories
- Category grid display
- Category management

**Tab 5: Products**
- Full product CRUD
- Stock display with color-coded badges
- Product edit modal with all details
- Search and filter functionality

**Tab 6: Fit Profiles**
- User body measurement profiles
- Preferred fit settings
- Fit profile management

**Tab 7: Stock Management**
- Dedicated inventory view
- Stock level indicators
- Real-time stock updates
- Low stock alerts

**Tab 8: Returns**
- Return request tracking
- Status workflow (requested → approved → rejected → completed)
- Return reason tracking
- Resolution date tracking

**Tab 9: Packaging**
- Display 4 packaging options
- Price tiers: ₹0, ₹50, ₹100, ₹150
- Packaging management (add, edit, delete)
- Active/inactive toggle

**Tab 10: Navigation**
- Website menu item control
- Enable/disable menu items
- Reorder menu items
- Add new menu items

**Tab 11: Analytics**
- Customer metrics and insights
- Top 10 frequent customers
- Revenue statistics
- Frequency score and return rate analysis

### 4.2 Admin Dashboard Usage

The admin dashboard is accessible to authorized users and provides comprehensive management of all e-commerce operations.

**Component Location:** `src/app/components/admin-dashboard.tsx`
**Store Access:** `src/app/store/app-store.tsx`

---

## 5. Order Status Flow

### New Order Status Values
The application now uses the following order status sequence:

```
ordered
    ↓
acknowledged
    ↓
shipping
    ↓
delivered
    ↓
(complete)

OR

cancelled (at any stage)
```

### Legacy Status Compatibility
The database schema accepts both old and new status values for backward compatibility:
- Old: 'pending' → New: 'ordered'
- Old: 'processing' → New: 'acknowledged'
- Old: 'shipped' → New: 'shipping'
- Old: 'delivered' → Unchanged
- Old: 'cancelled' → Unchanged

---

## 6. Currency Configuration

### All Components Display ₹ (Indian Rupees)

**Updated Components:**
- ✅ Cart checkout - All prices in ₹
- ✅ Product cards - Prices in ₹
- ✅ Product detail - Prices in ₹
- ✅ Admin dashboard - All monetary values in ₹
- ✅ Order summary - Totals in ₹

**Format:**
```typescript
// Price display
₹{price.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}

// or with decimals
₹{price.toFixed(2)}
```

---

## 7. Stock Management

### How Stock Works

**Product Stock Field:**
- Added to `products` table: `stock INTEGER DEFAULT 0`
- Added to Product interface in app-store

**Stock Display:**
- **In Stock:** Green badge - Available quantity > 10
- **Low Stock:** Amber badge - 1-10 items remaining
- **Out of Stock:** Red badge - 0 items

**Stock Actions:**
1. Admin can update stock in Products tab
2. Stock decreases when order is placed
3. Stock can be replenished via admin panel
4. Low stock alerts in admin dashboard

### Stock Validation
- Users cannot add out-of-stock items to cart
- "Add to Cart" button disabled when stock = 0
- Product detail shows stock status with indicator

---

## 8. Implementation Checklist

### Phase 1: Database Setup (1-2 hours)
- [ ] Run `schema-update-admin-features.sql` in Supabase
- [ ] Verify all new tables and columns created
- [ ] Confirm default data inserted (packaging, navigation menu)
- [ ] Test RLS policies with sample queries

### Phase 2: Frontend Component Updates (2-3 hours)
- [ ] Test cart-checkout with packaging selection
- [ ] Test product cards display stock badges
- [ ] Test product detail stock availability
- [ ] Verify all ₹ currency displays work correctly

### Phase 3: Firebase Integration (1-2 hours)
- [ ] Import new Firebase functions into components
- [ ] Connect admin dashboard to Firebase calls
- [ ] Test CRUD operations for each admin feature
- [ ] Verify data persistence to Firestore

### Phase 4: Admin Dashboard Deployment (1 hour)
- [ ] Ensure admin dashboard component loads
- [ ] Test all 11 tabs function correctly
- [ ] Verify data flows from app-store to UI
- [ ] Test admin panel with mock data

### Phase 5: Testing & Validation (2-3 hours)
- [ ] End-to-end order flow with packaging
- [ ] Stock updates after purchase
- [ ] Return request creation and tracking
- [ ] Analytics data aggregation
- [ ] Navigation menu control

### Phase 6: Deployment (30 mins)
- [ ] Deploy to production
- [ ] Monitor for errors in console
- [ ] Verify Supabase connection active
- [ ] Test with live data

---

## 9. File Summary

### Modified Files
1. **supabase/schema-update-admin-features.sql** (NEW)
   - Complete database schema updates
   - 6 new tables, indexes, RLS policies
   - Default data seeding

2. **src/app/components/cart-checkout.tsx**
   - Added packaging selection UI
   - Updated pricing calculation with packaging
   - Updated shipping thresholds

3. **src/app/components/product-card.tsx**
   - Added stock property
   - Added stock status badge
   - Color-coded stock indicators

4. **src/app/components/product-detail.tsx**
   - Added stock display
   - Disabled button when out of stock
   - Updated shipping threshold

5. **src/lib/firebase.ts**
   - Added 20+ new Firebase functions
   - New interfaces for packaging, returns, navigation, analytics
   - Query functions for analytics and reporting

### Existing Files (Already Updated)
- `src/app/store/app-store.tsx` - App state management
- `src/app/components/admin-dashboard.tsx` - Admin UI (11 tabs)
- `src/app/components/product-listing.tsx` - Product display

---

## 10. Troubleshooting

### Issue: Packaging options not showing in checkout
**Solution:** 
1. Verify `packaging_options` table has data: `SELECT * FROM packaging_options;`
2. Check `packagingOptions` state in app-store
3. Clear browser cache and reload

### Issue: Stock badge not displaying
**Solution:**
1. Ensure Product interface includes `stock?: number`
2. Verify product data has stock values > 0
3. Check CSS classes for `.bg-green-600`, `.bg-amber-500`, `.bg-red-600`

### Issue: Firebase functions not found
**Solution:**
1. Restart dev server: `npm run dev`
2. Clear node_modules and reinstall: `npm install`
3. Check import paths match exact file location

### Issue: Order status updates not persisting
**Solution:**
1. Verify `orders` table has updated status enum
2. Check RLS policies allow admin updates
3. Confirm Firestore has write permissions

---

## 11. Next Steps

### Future Enhancements
1. **Payment Integration** - Add Stripe/Razorpay integration with packaging fees
2. **Inventory Sync** - Auto-sync stock from multiple warehouses
3. **Return Logistics** - Integrate with logistics partners for return shipping
4. **Customer Notifications** - Email/SMS for order status and return updates
5. **Advanced Analytics** - Predictive analytics for inventory management
6. **Multi-currency Support** - Support for other currencies (USD, EUR, etc.)

### Performance Optimization
1. Add pagination to admin dashboard tables
2. Implement virtual scrolling for large datasets
3. Cache frequent queries (packaging options, navigation menu)
4. Add database indexes for analytics queries

---

## 12. Support & Documentation

**Files to Reference:**
- Admin Dashboard Features Documentation: `ADMIN_DASHBOARD_FEATURES.md`
- Database Schema: `supabase/schema.sql`
- Supabase README: `supabase/README.md`

**Key Contact Points:**
- Database Issues → Supabase Dashboard
- UI Issues → React DevTools / Browser DevTools
- Firebase Issues → Firebase Console

---

**Document Status:** ✅ Complete  
**Last Updated:** May 2, 2026  
**Version:** 1.0
