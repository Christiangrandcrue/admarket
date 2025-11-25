-- ============================================
-- ADMIN RLS POLICIES
-- Grant full access to admin users
-- ============================================

-- Drop existing admin policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Admins have full access to users" ON users;
DROP POLICY IF EXISTS "Admins have full access to channels" ON channels;
DROP POLICY IF EXISTS "Admins have full access to campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins have full access to placements" ON placements;
DROP POLICY IF EXISTS "Admins have full access to flags" ON flags;
DROP POLICY IF EXISTS "Admins have full access to platform_settings" ON platform_settings;
DROP POLICY IF EXISTS "Admins have full access to audit_logs" ON audit_logs;

-- ============================================
-- USERS TABLE - Admin Access
-- ============================================
CREATE POLICY "Admins have full access to users" ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  );

-- ============================================
-- CHANNELS TABLE - Admin Access
-- ============================================
CREATE POLICY "Admins have full access to channels" ON channels
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  );

-- ============================================
-- CAMPAIGNS TABLE - Admin Access
-- ============================================
CREATE POLICY "Admins have full access to campaigns" ON campaigns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  );

-- ============================================
-- PLACEMENTS TABLE - Admin Access
-- ============================================
CREATE POLICY "Admins have full access to placements" ON placements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  );

-- ============================================
-- FLAGS TABLE - Admin Access
-- ============================================
CREATE POLICY "Admins have full access to flags" ON flags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  );

-- ============================================
-- PLATFORM_SETTINGS TABLE - Admin Access
-- ============================================
CREATE POLICY "Admins have full access to platform_settings" ON platform_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  );

-- ============================================
-- AUDIT_LOGS TABLE - Admin Access (Read-only)
-- ============================================
CREATE POLICY "Admins have full access to audit_logs" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND admin.status = 'active'
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================
-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE policyname LIKE '%Admins%'
ORDER BY tablename, policyname;
