-- Add resolved_at timestamp to tickets for SLA calculations
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Add password change tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Create index for resolved_at queries
CREATE INDEX IF NOT EXISTS idx_tickets_resolved_at ON tickets(resolved_at) WHERE resolved_at IS NOT NULL;

-- Update resolved_at when ticket is closed
CREATE OR REPLACE FUNCTION set_ticket_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.resolved_at = NOW();
  ELSIF NEW.status != 'closed' THEN
    NEW.resolved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_resolved_at_trigger
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_resolved_at();

