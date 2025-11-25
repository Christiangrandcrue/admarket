-- ============================================
-- FIX: Remove infinite recursion in users table policy
-- ============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins have full access to users" ON users;

-- Create a simpler policy that doesn't cause recursion
-- This policy allows users to read their own record
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- This policy allows users to update their own record
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- For admin access, we'll use a function-based approach
-- First, create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create admin policy using the function
CREATE POLICY "Admins have full access to users" ON users
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Verify the fix
SELECT 
  id, 
  email, 
  role, 
  status 
FROM users 
WHERE email = 'inbe@ya.ru';
