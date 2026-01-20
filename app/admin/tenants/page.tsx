import { requireSuperAdmin } from "@/modules/auth/server";
import { getAllTenants } from "@/modules/tenants/queries";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AnimatedPage } from "@/components/animated-page";
import { TenantListItem } from "@/components/admin/tenant-list-item";
import { generateMetadataForPath } from "@/lib/metadata";

export function generateMetadata() {
  return generateMetadataForPath("/admin/tenants");
}

export default async function TenantsPage() {
  await requireSuperAdmin();
  const tenants = await getAllTenants();

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Tenants
          </h1>
          <p className="text-muted-foreground text-lg">Manage client tenants</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div></div>
          <Link href="/admin/tenants/new">
            <Button className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              Create Tenant
            </Button>
          </Link>
        </div>

        <AnimatedCard delay={0.1}>
          <AnimatedCardHeader>
            <CardTitle className="text-xl">All Tenants</CardTitle>
            <CardDescription>List of all registered tenants</CardDescription>
          </AnimatedCardHeader>
          <CardContent>
            {tenants.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No tenants found. Create your first tenant to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {tenants.map((tenant, index) => (
                  <TenantListItem key={tenant.id} tenant={tenant} index={index} />
                ))}
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
}

