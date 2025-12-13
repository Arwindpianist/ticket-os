import { requireAuth } from "@/modules/auth/server";
import { getTenantBranding } from "@/modules/branding/queries";
import { BrandingForm } from "@/components/branding/branding-form";
import { AnimatedPage } from "@/components/animated-page";
import { requireTenantAdmin } from "@/modules/auth/server";

export default async function BrandingPage() {
  await requireTenantAdmin();
  const session = await requireAuth();
  
  if (!session.user.tenant_id) {
    return (
      <AnimatedPage>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center text-muted-foreground">
            You must be associated with a tenant to configure branding.
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const branding = await getTenantBranding(session.user.tenant_id);

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Branding Configuration
          </h1>
          <p className="text-muted-foreground text-lg">Customize your tenant&apos;s appearance and branding</p>
        </div>

        <BrandingForm 
          initialData={branding || {
            logo_url: null,
            primary_color: "#1e293b",
            accent_color: "#1e293b",
            dashboard_title: "Dashboard",
            welcome_message: null,
          }}
          tenantId={session.user.tenant_id}
        />
      </div>
    </AnimatedPage>
  );
}
