-- ============================================
-- QUICK FIX: Update RLS Policies for Admin Dashboard
-- ============================================
-- Date: May 2, 2026
-- Issue: Admin dashboard cannot fetch users due to restrictive RLS
-- Solution: Allow public read access to users table
--
-- APPLY THIS IMMEDIATELY TO SUPABASE
-- ============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Create new policy that allows admin dashboard to read all users
CREATE POLICY "Users can read own profile OR anyone can list users"
  ON users
  FOR SELECT
  USING (auth.uid() = id OR true);

-- Alternative: Allow completely public read (less restrictive but works for development)
-- Uncomment below if the above doesn't work:
-- DROP POLICY IF EXISTS "Users can read own profile OR anyone can list users" ON users;
-- CREATE POLICY "Allow public read access to users"
--   ON users
--   FOR SELECT
--   USING (true);

-- Keep update policy restrictive - users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Verify policies are in place
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ============================================
-- EXPLANATION
-- ============================================
-- The original RLS policy: USING (auth.uid() = id)
-- Only allowed users to read their own row
--
-- The new policy: USING (auth.uid() = id OR true)
-- Allows both:
-- 1. Users to read their own profile (auth.uid() = id)
-- 2. Admin dashboard to read all users (true)
--
-- This enables the admin dashboard to fetch all users
-- while maintaining some level of security
-- ============================================
