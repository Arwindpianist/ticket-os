-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can read profiles in their tenant
CREATE POLICY "Users can read tenant profiles"
  ON profiles FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR role = 'super_admin'
  );

-- Super admins can read all profiles
CREATE POLICY "Super admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Tenants policies
-- All authenticated users can read active tenants
CREATE POLICY "Users can read active tenants"
  ON tenants FOR SELECT
  USING (is_active = true);

-- Only service role can modify tenants (handled server-side)
-- No policies for INSERT/UPDATE/DELETE - use service role

-- Tenant branding policies
-- Users can read branding for their tenant
CREATE POLICY "Users can read tenant branding"
  ON tenant_branding FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Tenant features policies
-- Users can read features for their tenant
CREATE POLICY "Users can read tenant features"
  ON tenant_features FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Tickets policies
-- Users can read tickets in their tenant
CREATE POLICY "Users can read tenant tickets"
  ON tickets FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Users can create tickets in their tenant
CREATE POLICY "Users can create tenant tickets"
  ON tickets FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND created_by = auth.uid()
  );

-- Users can update tickets in their tenant (status, priority)
CREATE POLICY "Users can update tenant tickets"
  ON tickets FOR UPDATE
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Ticket messages policies
-- Users can read messages for tickets in their tenant
CREATE POLICY "Users can read tenant ticket messages"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_messages.ticket_id
      AND (
        tickets.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
    )
    AND (
      is_internal_note = false
      OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'tenant_admin')
    )
  );

-- Users can create messages for tickets in their tenant
CREATE POLICY "Users can create tenant ticket messages"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_messages.ticket_id
      AND tickets.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
    AND author_id = auth.uid()
  );

-- Ticket attachments policies
-- Users can read attachments for tickets in their tenant
CREATE POLICY "Users can read tenant ticket attachments"
  ON ticket_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_attachments.ticket_id
      AND (
        tickets.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
    )
  );

-- Users can create attachments for tickets in their tenant
CREATE POLICY "Users can create tenant ticket attachments"
  ON ticket_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_attachments.ticket_id
      AND tickets.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
    AND uploaded_by = auth.uid()
  );

-- Contracts policies
-- Users can read contracts for their tenant
CREATE POLICY "Users can read tenant contracts"
  ON contracts FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Only service role can modify contracts (handled server-side)
-- No policies for INSERT/UPDATE/DELETE - use service role

-- Activity logs policies
-- Users can read activity logs for their tenant
CREATE POLICY "Users can read tenant activity logs"
  ON activity_logs FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Only service role can create activity logs (handled server-side)
-- No policy for INSERT - use service role

