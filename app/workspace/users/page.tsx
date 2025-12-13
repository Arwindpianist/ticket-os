import { requireAuth, getAuthContext } from "@/modules/auth/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatedPage } from "@/components/animated-page";
import { AnimatedCard, AnimatedCardHeader } from "@/components/animated-card";
import { UserListItem } from "@/components/workspace/user-list-item";

export default async function UsersPage() {
  const authContext = await getAuthContext();
  
  if (!authContext?.tenantId) {
    return (
      <AnimatedPage>
        <div className="container mx-auto py-8 px-4">
          <AnimatedCard delay={0.1}>
            <CardContent className="py-8 text-center text-muted-foreground">
              You are not associated with a tenant. Please contact your administrator.
            </CardContent>
          </AnimatedCard>
        </div>
      </AnimatedPage>
    );
  }

  const supabase = createClient();
  
  // Get all users in the tenant
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .eq("tenant_id", authContext.tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch users:", error);
  }

  const canInvite = authContext.role === "tenant_admin" || authContext.role === "super_admin";

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
              Users
            </h1>
            <p className="text-muted-foreground text-lg">Manage users in your tenant</p>
          </div>
          {canInvite && (
            <Link href="/workspace/users/invite">
              <Button className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                Invite User
              </Button>
            </Link>
          )}
        </div>

        <AnimatedCard delay={0.1} className="border border-border/30 bg-card shadow-depth-md">
          <AnimatedCardHeader>
            <CardTitle className="text-xl">All Users</CardTitle>
            <CardDescription>List of all users in your tenant</CardDescription>
          </AnimatedCardHeader>
          <CardContent>
            {!users || users.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg mb-2">No users found.</p>
                {canInvite && (
                  <p className="text-sm">Invite your first user to get started.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user, index) => (
                  <UserListItem key={user.id} user={user} index={index} />
                ))}
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
}


