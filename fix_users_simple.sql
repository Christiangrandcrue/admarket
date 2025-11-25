-- ============================================
-- SIMPLE FIX: Remove recursion, allow own record access
-- ============================================

-- Drop ALL policies on users table
DROP POLICY IF EXISTS "Admins have full access to users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role bypass for users" ON users;

-- Allow users to read their own record
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow users to update their own record
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Test: Can we read the admin user now?
SELECT id, email, role, status FROM users WHERE id = auth.uid();
