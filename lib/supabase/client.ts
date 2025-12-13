import { createBrowserClient } from "@supabase/ssr";

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

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getPublishableKey()
  );
}

