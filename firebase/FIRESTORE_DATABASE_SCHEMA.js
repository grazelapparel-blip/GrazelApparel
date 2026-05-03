// ============================================
// FIREBASE FIRESTORE DATABASE SCHEMA
// Complete replacement for Supabase
// ============================================
// Date: May 2, 2026
// Database: Firebase Firestore (Real-time Database)
// ============================================

// COLLECTIONS STRUCTURE

// 1. USERS COLLECTION
// Path: /users/{userId}
// Document structure:
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+91-9876543210",
  "avatar_url": "https://...",
  "joined_date": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "is_frequent_customer": false,
  "last_purchase_date": "2024-05-01T15:20:00Z",
  "total_orders": 5,
  "total_spent": 25000,
  "role": "customer" // admin, customer
}

// 2. PRODUCTS COLLECTION
// Path: /products/{productId}
{
  "name": "Premium Cotton Shirt",
  "description": "High-quality cotton shirt",
  "price": 1499,
  "image": "https://...",
  "fabric": "Cotton",
  "fit": "Regular Fit",
  "gender": "Men",
  "category": "Shirts",
  "size": ["XS", "S", "M", "L", "XL", "XXL"],
  "stock": 50,
  "currency_code": "INR",
  "offer_percentage": 15,
  "is_essential": true,
  "is_active": true,
  "sku": "SHIRT-001",
  "created_at": "2024-01-10T08:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}

// 3. ORDERS COLLECTION
// Path: /orders/{orderId}
{
  "user_id": "userId123",
  "order_number": "ORD-20260502-1234",
  "status": "ordered", // ordered, acknowledged, shipping, delivered, cancelled
  "total_amount": 2999,
  "subtotal": 2499,
  "tax_amount": 300,
  "shipping_amount": 200,
  "shipping_street": "123 Main St",
  "shipping_city": "Bangalore",
  "shipping_postcode": "560001",
  "shipping_country": "India",
  "billing_street": "123 Main St",
  "billing_city": "Bangalore",
  "billing_postcode": "560001",
  "billing_country": "India",
  "notes": "Leave at door",
  "packaging_id": "simple", // simple, elegant, premium, gift
  "packaging_price": 0,
  "created_at": "2024-05-02T14:30:00Z",
  "updated_at": "2024-05-02T14:30:00Z",
  "shipped_at": null,
  "delivered_at": null
}

// 4. ORDER_ITEMS SUB-COLLECTION
// Path: /orders/{orderId}/order_items/{itemId}
{
  "product_id": "productId123",
  "product_name": "Premium Cotton Shirt",
  "quantity": 2,
  "price": 1499,
  "selected_size": "L",
  "created_at": "2024-05-02T14:30:00Z"
}

// 5. CART_ITEMS COLLECTION
// Path: /cart_items/{cartItemId}
{
  "user_id": "userId123",
  "product_id": "productId123",
  "quantity": 1,
  "selected_size": "M",
  "selected_packaging": "simple",
  "added_at": "2024-05-02T10:00:00Z",
  "updated_at": "2024-05-02T10:00:00Z"
}

// 6. FIT_PROFILES COLLECTION
// Path: /fit_profiles/{profileId}
{
  "user_id": "userId123",
  "height": "180cm",
  "weight": "75kg",
  "chest": "40",
  "waist": "32",
  "hips": "38",
  "body_type": "Athletic",
  "preferred_fit": "slim", // slim, regular, relaxed
  "preferred_size": "M",
  "notes": "Prefer fitted clothing",
  "created_at": "2024-01-20T08:00:00Z",
  "updated_at": "2024-01-20T08:00:00Z"
}

// 7. USER_FAVORITES COLLECTION (WISHLIST)
// Path: /user_favorites/{favoriteId}
{
  "user_id": "userId123",
  "product_id": "productId456",
  "added_at": "2024-05-01T12:00:00Z"
}

// 8. REVIEWS COLLECTION
// Path: /reviews/{reviewId}
{
  "user_id": "userId123",
  "product_id": "productId123",
  "rating": 4,
  "title": "Great quality!",
  "comment": "Very comfortable and well-made",
  "is_verified_purchase": true,
  "helpful_count": 15,
  "created_at": "2024-05-02T08:00:00Z",
  "updated_at": "2024-05-02T08:00:00Z"
}

// 9. NEWSLETTER_SUBSCRIBERS COLLECTION
// Path: /newsletter_subscribers/{subscriberId}
{
  "email": "subscriber@example.com",
  "is_active": true,
  "subscribed_at": "2024-04-15T10:00:00Z",
  "unsubscribed_at": null,
  "created_at": "2024-04-15T10:00:00Z",
  "updated_at": "2024-04-15T10:00:00Z"
}

// 10. PACKAGING_OPTIONS COLLECTION
// Path: /packaging_options/{packageId}
{
  "name": "simple",
  "label": "Simple Package",
  "description": "Basic packaging",
  "price": 0,
  "currency_code": "INR",
  "is_active": true,
  "display_order": 1,
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}

// Default data for packaging_options:
// 1. simple - Simple Package - ₹0 - Order 1
// 2. elegant - Elegant Package - ₹50 - Order 2
// 3. premium - Premium Package - ₹100 - Order 3
// 4. gift - Gift Package - ₹150 - Order 4

// 11. ORDER_RETURNS COLLECTION
// Path: /order_returns/{returnId}
{
  "order_id": "orderId123",
  "user_id": "userId123",
  "product_id": "productId123",
  "reason": "Size too small",
  "status": "requested", // requested, approved, rejected, completed
  "requested_date": "2024-05-02",
  "resolved_date": null,
  "notes": "Will exchange for size L",
  "created_at": "2024-05-02T14:30:00Z",
  "updated_at": "2024-05-02T14:30:00Z"
}

// 12. NAVIGATION_MENU_ITEMS COLLECTION
// Path: /navigation_menu_items/{menuItemId}
{
  "label": "Men",
  "path": "/men",
  "is_active": true,
  "menu_order": 1,
  "icon_name": "Men",
  "description": "Men's clothing collection",
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}

// Default menu items:
// 1. Men - /men - Order 1
// 2. Women - /women - Order 2
// 3. Essentials - /essentials - Order 3
// 4. New In - /new-in - Order 4
// 5. Collections - /collections - Order 5

// 13. PRODUCT_CATEGORIES COLLECTION
// Path: /product_categories/{categoryId}
{
  "name": "Shirts",
  "description": "All types of shirts",
  "slug": "shirts",
  "is_active": true,
  "display_order": 1,
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}

// 14. USER_ANALYTICS COLLECTION
// Path: /user_analytics/{analyticsId}
{
  "user_id": "userId123",
  "total_orders": 5,
  "total_spent": 25000,
  "last_order_date": "2024-05-02T14:30:00Z",
  "frequency_score": 4.5,
  "return_count": 1,
  "average_order_value": 5000,
  "return_rate": 2.5,
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-02T14:30:00Z"
}

// 15. ORDER_PACKAGING_HISTORY COLLECTION
// Path: /order_packaging_history/{historyId}
{
  "order_id": "orderId123",
  "packaging_option_id": "simple",
  "packaging_name": "Simple Package",
  "packaging_price": 0,
  "created_at": "2024-05-02T14:30:00Z"
}

// ============================================
// FIRESTORE INDEXES REQUIRED
// ============================================

// 1. Users by email
// Collection: users
// Fields: email (Ascending)

// 2. Orders by user and date
// Collection: orders
// Fields: user_id (Ascending), created_at (Descending)

// 3. Orders by status
// Collection: orders
// Fields: status (Ascending), created_at (Descending)

// 4. Cart items by user
// Collection: cart_items
// Fields: user_id (Ascending), added_at (Descending)

// 5. Reviews by product
// Collection: reviews
// Fields: product_id (Ascending), created_at (Descending)

// 6. User favorites by user
// Collection: user_favorites
// Fields: user_id (Ascending), added_at (Descending)

// 7. Fit profiles by user
// Collection: fit_profiles
// Fields: user_id (Ascending)

// 8. Order returns by status
// Collection: order_returns
// Fields: status (Ascending), requested_date (Descending)

// 9. Order returns by user
// Collection: order_returns
// Fields: user_id (Ascending), requested_date (Descending)

// 10. User analytics by frequency
// Collection: user_analytics
// Fields: frequency_score (Descending), total_spent (Descending)

// 11. Navigation menu by order
// Collection: navigation_menu_items
// Fields: menu_order (Ascending)

// 12. Products by category
// Collection: products
// Fields: category (Ascending), created_at (Descending)

// 13. Products by stock
// Collection: products
// Fields: stock (Ascending)

// ============================================
// FIRESTORE SECURITY RULES
// ============================================

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading any user (for admin dashboard)
      allow write: if request.auth.uid == userId || hasAdminRole(request.auth.uid);
    }
    
    // Allow public read, authenticated write
    match /products/{productId} {
      allow read: if true;
      allow write: if hasAdminRole(request.auth.uid);
    }
    
    // Users can read/write own orders
    match /orders/{orderId} {
      allow read, write: if resource.data.user_id == request.auth.uid || hasAdminRole(request.auth.uid);
    }
    
    // Order items - read if order is accessible
    match /orders/{orderId}/order_items/{itemId} {
      allow read: if get(/databases/$(database)/documents/orders/$(orderId)).data.user_id == request.auth.uid || hasAdminRole(request.auth.uid);
    }
    
    // Users can read/write own cart
    match /cart_items/{cartId} {
      allow read, write: if resource.data.user_id == request.auth.uid;
    }
    
    // Users can read/write own fit profile
    match /fit_profiles/{profileId} {
      allow read, write: if resource.data.user_id == request.auth.uid;
    }
    
    // Users can read/write own favorites
    match /user_favorites/{favoriteId} {
      allow read, write: if resource.data.user_id == request.auth.uid;
    }
    
    // Anyone can read reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.user_id || hasAdminRole(request.auth.uid);
    }
    
    // Anyone can read packaging options
    match /packaging_options/{packageId} {
      allow read: if true;
      allow write: if hasAdminRole(request.auth.uid);
    }
    
    // Users can read own returns
    match /order_returns/{returnId} {
      allow read: if resource.data.user_id == request.auth.uid || hasAdminRole(request.auth.uid);
      allow write: if hasAdminRole(request.auth.uid);
    }
    
    // Anyone can read navigation menu
    match /navigation_menu_items/{menuItemId} {
      allow read: if true;
      allow write: if hasAdminRole(request.auth.uid);
    }
    
    // Anyone can read categories
    match /product_categories/{categoryId} {
      allow read: if true;
      allow write: if hasAdminRole(request.auth.uid);
    }
    
    // Users can read own analytics
    match /user_analytics/{analyticsId} {
      allow read: if resource.data.user_id == request.auth.uid || hasAdminRole(request.auth.uid);
      allow write: if hasAdminRole(request.auth.uid);
    }
    
    // Admin can write packaging history
    match /order_packaging_history/{historyId} {
      allow read: if true;
      allow write: if hasAdminRole(request.auth.uid);
    }
    
    // Helper function to check admin role
    function hasAdminRole(uid) {
      return get(/databases/$(database)/documents/users/$(uid)).data.role == 'admin';
    }
  }
}

// ============================================
// FIRESTORE COMPOSITE INDEX SETUP
// ============================================
// To create indexes automatically, Firestore will prompt you
// when you run queries that need indexes.
//
// Alternatively, go to Firebase Console → Firestore → Indexes
// and create them manually using the definitions above.
// ============================================
