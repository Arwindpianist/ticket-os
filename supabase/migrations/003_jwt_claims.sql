-- Function to set JWT claims with tenant_id and role
CREATE OR REPLACE FUNCTION set_jwt_claims()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
  user_tenant_id UUID;
BEGIN
  SELECT role, tenant_id INTO user_role_val, user_tenant_id
  FROM profiles
  WHERE id = NEW.id;

  -- Set custom claims in JWT
  PERFORM set_config('request.jwt.claims', json_build_object(
    'tenant_id', user_tenant_id,
    'role', user_role_val
  )::text, true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tenant_id from JWT
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'tenant_id')::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role from JWT
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role')::user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

