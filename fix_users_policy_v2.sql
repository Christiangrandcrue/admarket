-- ============================================
-- FIX: Remove ALL policies causing recursion
-- Then create simple, non-recursive policies
-- ============================================

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Admins have full access to users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Simple policy: Users can read their OWN record only
-- Uses auth.uid() directly - NO recursion
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Simple policy: Users can update their OWN record only
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- For ADMIN access: Use app_metadata from JWT token
-- Admins should have their role stored in auth.users metadata
-- This avoids querying the users table entirely!
CREATE POLICY "Service role bypass for users" ON users
  FOR ALL
  TO authenticated
  USING (
    -- Allow if current_setting shows service_role
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR
    -- Or allow if user's raw_user_meta_data contains admin role
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Verify we can now read the user
SELECT id, email, role, status FROM users WHERE email = 'inbe@ya.ru';
