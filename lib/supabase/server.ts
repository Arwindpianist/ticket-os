import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Get the publishable key for client-side operations.
 * Uses the new Supabase API key format (sb_publishable_...).
 * 
 * Falls back to legacy anon key for backward compatibility during migration.
 * See: https://github.com/orgs/supabase/discussions/29260
 */
function getPublishableKey(): string {
  // Use new publishable key (sb_publishable_...)
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (publishableKey) {
    return publishableKey;
  }
  
  // Fall back to legacy anon key only if new key is not set
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    console.warn(
      "Using legacy anon key. Please migrate to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
    return anonKey;
  }
  
  throw new Error(
    "Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );
}

/**
 * Get the secret key for server-side admin operations.
 * Uses the new Supabase API key format (sb_secret_...).
 * 
 * Falls back to legacy service_role key for backward compatibility during migration.
 * See: https://github.com/orgs/supabase/discussions/29260
 */
function getSecretKey(): string {
  // Use new secret key (sb_secret_...)
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (secretKey) {
    return secretKey;
  }
  
  // Fall back to legacy service_role key only if new key is not set
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    console.warn(
      "Using legacy service_role key. Please migrate to SUPABASE_SECRET_KEY"
    );
    return serviceRoleKey;
  }
  
  throw new Error(
    "Missing Supabase secret key. Set SUPABASE_SECRET_KEY"
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getPublishableKey(),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSecretKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

