import { requireSuperAdmin } from "@/modules/auth/server";
import { getTenantById } from "@/modules/tenants/queries";
import { NotFoundError } from "@/lib/errors";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AnimatedPage } from "@/components/animated-page";
import { TenantActions } from "./tenant-actions";
import { ImpersonateButton } from "./impersonate-button";
import { formatDate } from "@/lib/utils";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;
  const tenant = await getTenantById(id);

  if (!tenant) {
    throw new NotFoundError("Tenant not found");
  }

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            {tenant.name}
          </h1>
          <p className="text-muted-foreground text-lg">Tenant details and management</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div></div>
          <Link href="/admin/tenants">
            <Button variant="outline" className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              Back to Tenants
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <AnimatedCard delay={0.1}>
              <AnimatedCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Tenant Information</CardTitle>
                    <CardDescription>Basic tenant details</CardDescription>
                  </div>
                  {tenant.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Suspended</Badge>
                  )}
                </div>
              </AnimatedCardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg">{tenant.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Slug</p>
                  <p className="text-lg font-mono">{tenant.slug}</p>
                </div>
                {tenant.domain && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Domain</p>
                    <p className="text-lg">{tenant.domain}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-lg">
                    {formatDate(tenant.created_at)}
                  </p>
                </div>
              </CardContent>
            </AnimatedCard>

            <TenantActions tenant={tenant} />
          </div>

          <AnimatedCard delay={0.2}>
            <AnimatedCardHeader>
              <CardTitle className="text-xl">Impersonation</CardTitle>
              <CardDescription>View tenant workspace</CardDescription>
            </AnimatedCardHeader>
            <CardContent>
              <ImpersonateButton tenantId={tenant.id} tenantName={tenant.name} />
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </AnimatedPage>
  );
}

