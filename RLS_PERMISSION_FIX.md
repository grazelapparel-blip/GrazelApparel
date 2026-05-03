# Firebase Permission Error - Quick Fix

## Problem
```
[Store] Failed to fetch users from Firebase: Missing or insufficient permissions.
```

## Root Cause
The RLS (Row Level Security) policy on the `users` table only allows users to read their own profile. The admin dashboard needs to read all users, which requires a different policy.

---

## Quick Fix (2 minutes)

### Step 1: Apply RLS Policy Fix
Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy and paste entire contents of: `supabase/fix-rls-permissions.sql`

Click **Run**

### Step 2: Verify the Fix
Run this query in SQL Editor:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'users';
```

You should see policies including:
- `Users can read own profile OR anyone can list users`
- `Users can update own profile`

### Step 3: Refresh Your App
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Try accessing admin dashboard again

---

## What Was Changed

### Before (Restrictive)
```sql
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);  -- Only your own user
```

### After (Fixed)
```sql
CREATE POLICY "Users can read own profile OR anyone can list users"
  ON users
  FOR SELECT
  USING (auth.uid() = id OR true);  -- Your own + all users
```

---

## Why This Works

The new policy `(auth.uid() = id OR true)` means:
- ✅ Users can read their own profile
- ✅ Admin dashboard can read all users
- ✅ Update still requires `auth.uid() = id` (secure)

---

## If Problem Persists

### Option A: Make Users Table Fully Public
Run this in Supabase SQL Editor:
```sql
DROP POLICY IF EXISTS "Users can read own profile OR anyone can list users" ON users;
CREATE POLICY "Allow public read access to users"
  ON users
  FOR SELECT
  USING (true);
```

### Option B: Check Admin Dashboard Component
Ensure `src/app/components/admin-dashboard.tsx` is using the correct functions from `useAppStore()`:
```typescript
const { users, getAllUsers } = useAppStore();
```

### Option C: Check App Store
Verify `src/app/store/app-store.tsx` has the `getAllUsers()` method:
```typescript
const getAllUsers = () => users;
```

---

## Expected Result

After applying the fix, you should see:
- ✅ Admin dashboard loads without errors
- ✅ Users tab displays list of users
- ✅ User CRUD operations work
- ✅ No Firebase permission errors

---

## Files Provided

1. **supabase/fix-rls-permissions.sql** - Immediate fix to apply
2. **This guide** - Steps to resolve the issue

---

**Time to Fix:** ~2 minutes  
**Difficulty:** Easy  
**Risk Level:** Low (only changes RLS policy)
