import { UserRole } from "./database";

export interface Session {
  user: {
    id: string;
    email: string;
    role: UserRole;
    tenant_id: string | null;
  };
}

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  isImpersonating?: boolean;
}

