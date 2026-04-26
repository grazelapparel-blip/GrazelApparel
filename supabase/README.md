# Supabase Database Setup - Grazel Apparel

## 📁 Complete Database Solution

This directory contains the **complete database setup** for Grazel Apparel.

---

## 🚀 **USE THIS FILE: `schema.sql`**

**`schema.sql`** is the ONLY file you need. It contains:

✅ All 10 database tables  
✅ Performance indexes  
✅ Row-level security (RLS) policies
✅ User registration and sync functions
✅ Order number generation triggers
✅ Multi-user data isolation
✅ Complete e-commerce schema  

**Everything in one file. Idempotent. Safe to run multiple times.**

---

## 📖 Quick Setup (3 Steps)

### Step 1: Open Supabase
Go to: https://app.supabase.com
- Select your project
- Click "SQL Editor" in sidebar

### Step 2: Create New Query
Click "New Query" button

### Step 3: Copy & Run
1. Open `schema.sql`
2. Copy ALL content
3. Paste into SQL editor
4. Click "Run"
5. Wait for completion ✓

**Done! Your database is ready.**

---

## ✨ What Gets Created

### 10 Tables
```
✓ users                  - User accounts and profiles
✓ user_addresses         - Shipping/billing addresses
✓ products               - Product catalog
✓ orders                 - Customer orders
✓ order_items            - Order line items
✓ cart_items             - Shopping cart (user-specific)
✓ fit_profiles           - User fit preferences
✓ user_favorites         - Wishlist/favorites (user-specific)
✓ reviews                - Product reviews
✓ newsletter_subscribers - Newsletter subscriptions
```

### Features
```
✓ Multi-user support with independent sessions
✓ Row Level Security (RLS) for data protection
✓ User authentication via Supabase Auth
✓ Automatic order number generation
✓ User data isolation (each user sees only their data)
✓ Performance indexes on frequently queried columns
✓ Automatic timestamps and audit trails
```

---

## 📋 File Structure

```
supabase/
├── schema.sql          ← RUN THIS FILE (combined schema)
└── README.md           ← You are here
```

**OLD FILES REMOVED:**
- ~~complete.sql~~ (merged into schema.sql)
- ~~fit_profiles.sql~~ (merged into schema.sql)
- ~~multi_user_setup.sql~~ (merged into schema.sql)

---

## 🔐 Security Features

### Row Level Security (RLS) Policies
Each table has RLS policies that ensure:
- Users can only see their own data
- Users can only modify their own data
- Products are visible to everyone
- Reviews are visible to everyone (but users can only edit their own)

### Data Isolation
```
Each user has separate:
- Cart (cart_items table with user_id)
- Orders (orders table with user_id)
- Fit profile (fit_profiles table with unique user_id)
- Wishlist/Favorites (user_favorites table with user_id)
```

---

## 🚀 Application Integration

The frontend application is configured to:
1. Use sessionStorage for per-tab user sessions
2. Use localStorage for user-specific data (cart, favorites, profiles)
3. Map all user data by userId (key-value pairs)
4. Support multiple users on same device (different tabs)
5. Sync with Supabase RLS policies

---

## ✅ Verification

After running the SQL, you should see:
- ✓ All 10 tables created
- ✓ All indexes created
- ✓ RLS enabled on all tables
- ✓ RLS policies created
- ✓ Functions created
- ✓ Triggers created

No errors should appear.

---

## 🔄 Idempotency

This file is **100% idempotent**, meaning:
- Safe to run multiple times
- Existing objects won't be duplicated
- Uses `CREATE TABLE IF NOT EXISTS`
- Drops and recreates policies safely

You can run this file as many times as needed.

---

## 📞 Support

If you encounter issues:
1. Check that all content was copied
2. Verify Supabase project is active
3. Check SQL error messages for hints
4. Try running in smaller chunks if needed

---

## 📅 Version Info

- **Date:** February 11, 2026
- **Version:** 1.0 (Combined schema)
- **Status:** Production Ready
- **Tested:** Yes

---

**Ready to use! Copy `schema.sql` and run in Supabase SQL Editor.** ✨

user_addresses
products
orders
order_items
cart_items
fit_profiles
wishlist_items
reviews
newsletter_subscribers
```

### Security Features
- ✅ Row-Level Security (RLS)
- ✅ User isolation
- ✅ Authentication checks
- ✅ Data privacy

### Performance
- ✅ 19 indexed columns
- ✅ Optimized queries
- ✅ Fast lookups

### Functionality
- ✅ User management
- ✅ Product catalog
- ✅ Shopping cart
- ✅ Order processing
- ✅ Fit profiles
- ✅ Reviews
- ✅ Wishlist
- ✅ Newsletter

---

## 🔍 File Structure

```
supabase/
├── complete.sql           ⭐ USE THIS (Combined)
├── FIX_USER_REGISTRATION.md  (Documentation)
└── README.md             (This file)
```

**Old files removed.** Everything is now in `complete.sql`.

---

## ✅ Verify Setup

After running SQL, check these:

### Check 1: Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
Should show 10 tables.

### Check 2: RLS Enabled
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```
Should show all tables with RLS enabled.

### Check 3: Indexes Created
```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;
```
Should show many indexes.

---

## 📋 What's Inside `complete.sql`

### Section 1: Database Schema
- 10 tables with relationships
- Proper constraints
- Default values

### Section 2: Indexes
- 19 performance indexes
- Foreign key indexes
- Search indexes

### Section 3: Row-Level Security
- User isolation policies
- Product read access
- Admin policies

### Section 4: Functions
- Order number generation
- Timestamp management
- User sync function

### Section 5: Triggers
- Auto-generate order numbers
- Update timestamps
- Sync auth users

### Section 6: Verification
- Table checks
- Index checks
- RLS verification

---

## 🛠️ Database Details

### Users Table
- Extends Supabase auth
- Stores profile info
- Email, name, phone, avatar
- RLS protected

### Products Table
- Product catalog
- Gender, essentials, offers
- Category, fabric, fit
- Real-time updates supported

### Orders Table
- Order tracking
- Status management
- Shipping address
- Billing address
- Timestamps

### Other Tables
- cart_items - Shopping cart
- order_items - Order details
- fit_profiles - User preferences
- wishlist_items - Saved products
- reviews - Ratings & comments
- user_addresses - Addresses
- newsletter_subscribers - Email list

---

## 🔐 Security Features

### Row-Level Security
- Users see only their data
- Products readable by all
- Orders isolated per user
- Cart items private

### Authentication
- Extends Supabase Auth
- Automatic user sync
- Email verification
- Secure passwords

### Policies
- 20+ RLS policies
- Permission controls
- Data isolation
- Admin capabilities

---

## 🚨 Important Notes

✅ **Idempotent** - Safe to run multiple times  
✅ **No data loss** - Won't delete existing data  
✅ **Complete** - Everything in one file  
✅ **Fixes included** - All issues resolved  
✅ **Optimized** - Indexes for performance  

---

## ❓ Common Questions

### Q: Is it safe to run multiple times?
**A:** Yes! It's idempotent - uses `IF NOT EXISTS` everywhere.

### Q: Will it delete my data?
**A:** No! It only creates tables/functions/triggers if they don't exist.

### Q: Can I modify the SQL?
**A:** Yes, but be careful with table structure changes.

### Q: How long does it take?
**A:** 30-60 seconds typically.

### Q: What if I get an error?
**A:** 
1. Check error message
2. Verify Supabase project is active
3. Try running again
4. Check permissions

---

## 🔄 Migration Path

### If You Had Old Files
The old separate files are now combined:
- ~~schema.sql~~ → `complete.sql`
- ~~migrations.sql~~ → `complete.sql`
- ~~QUICK_FIX.sql~~ → `complete.sql`
- ~~FIX_USER_REGISTRATION.sql~~ → `complete.sql`

**Just run `complete.sql` and you have everything!**

---

## 📚 Related Documentation

For more details, see:
- **`LIVE_UPDATES_SETUP.md`** - Real-time product updates
- **`IMPLEMENTATION_SUMMARY.md`** - Complete system overview
- **`FIX_USER_REGISTRATION.md`** - User registration details

---

## 🎯 Next Steps

1. ✅ Run `complete.sql`
2. ✅ Verify with checks above
3. ✅ Test signup in app
4. ✅ Test product listing
5. ✅ Start selling!

---

## ✨ Status

**Date:** February 10, 2026  
**Status:** ✅ Complete and Production Ready  
**Consolidated:** All SQL files combined  
**Tested:** Yes  
**Ready:** Yes!  

---

**That's all you need! Run `complete.sql` and you're set! 🚀**

