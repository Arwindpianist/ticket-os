import { requireSuperAdmin, getAuthContext } from "@/modules/auth/server";
import { getAllUsers } from "@/modules/users/server";
import { getAllTenants } from "@/modules/tenants/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AnimatedPage } from "@/components/animated-page";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { UserList } from "@/components/admin/user-list";
import { generateMetadataForPath } from "@/lib/metadata";

export function generateMetadata() {
  return generateMetadataForPath("/admin/users");
}

export default async function AdminUsersPage() {
  const session = await requireSuperAdmin();
  const users = await getAllUsers();
  const tenants = await getAllTenants();
  const currentUserId = session.user.id;

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Users
          </h1>
          <p className="text-muted-foreground text-lg">Manage all system users</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div></div>
          <Link href="/admin/users/new">
            <Button className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              Create User
            </Button>
          </Link>
        </div>

        <AnimatedCard delay={0.1}>
          <AnimatedCardHeader>
            <CardTitle className="text-xl">All Users</CardTitle>
            <CardDescription>List of all registered users across all tenants</CardDescription>
          </AnimatedCardHeader>
          <CardContent>
            <UserList users={users} tenants={tenants} currentUserId={currentUserId} />
          </CardContent>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
}

