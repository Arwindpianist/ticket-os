import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Get the publishable key for middleware operations.
 * Uses the new Supabase API key format (sb_publishable_...).
 * 
 * Falls back to legacy anon key for backward compatibility during migration.
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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getPublishableKey(),
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow password change page
  if (request.nextUrl.pathname === "/auth/change-password") {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return response;
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Check if user must change password
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, must_change_password")
      .eq("id", user.id)
      .single();

    if (profile?.must_change_password) {
      return NextResponse.redirect(new URL("/auth/change-password", request.url));
    }

    if (profile?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/workspace", request.url));
    }
  }

  // Protect workspace routes
  if (request.nextUrl.pathname.startsWith("/workspace")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Check if user must change password
    const { data: profile } = await supabase
      .from("profiles")
      .select("must_change_password, role")
      .eq("id", user.id)
      .single();

    if (profile?.must_change_password) {
      return NextResponse.redirect(new URL("/auth/change-password", request.url));
    }

    // Allow super_admin to access workspace when impersonating
    // (checked via cookies in the impersonation module)
    if (profile?.role !== "super_admin") {
      // Regular tenant users must have a tenant_id
      if (!profile?.tenant_id) {
        // This check is handled by requireTenantContext in server actions
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith("/auth/login") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "super_admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/workspace", request.url));
  }


  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

