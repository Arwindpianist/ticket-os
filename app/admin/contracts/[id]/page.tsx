import { requireSuperAdmin } from "@/modules/auth/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { NotFoundError } from "@/lib/errors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContractDisplay } from "@/components/contract-display";
import { AnimatedPage } from "@/components/animated-page";
import { getAllTenants } from "@/modules/tenants/queries";
import { formatDate } from "@/lib/utils";
import { generateMetadataForContract } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<import("next").Metadata> {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const { data: contract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .single();
  
  if (!contract) {
    return {
      title: "Contract Not Found - Ticket OS",
    };
  }
  
  const tenants = await getAllTenants();
  const tenant = tenants.find(t => t.id === contract.tenant_id);
  const tenantName = tenant?.name;
  
  return generateMetadataForContract(id, contract.title, tenantName);
}

export default async function AdminContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireSuperAdmin();
  
  const supabase = createServiceRoleClient();
  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !contract) {
    throw new NotFoundError("Contract not found");
  }

  const tenants = await getAllTenants();
  const tenant = tenants.find(t => t.id === contract.tenant_id);
  const tenantName = tenant?.name || "Unknown Tenant";

  const startDate = new Date(contract.start_date);
  const endDate = new Date(contract.end_date);
  const today = new Date();
  const isActive = today >= startDate && today <= endDate;
  const isExpired = today > endDate;

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
                {contract.title}
              </h1>
              {isActive && <Badge variant="default">Active</Badge>}
              {isExpired && <Badge variant="secondary">Expired</Badge>}
              {today < startDate && <Badge variant="outline">Upcoming</Badge>}
            </div>
            <p className="text-muted-foreground text-lg">Tenant: {tenantName}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/contracts/${params.id}/edit`}>
              <Button className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                Edit Contract
              </Button>
            </Link>
            <Link href="/admin/contracts">
              <Button variant="outline" className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                Back to Contracts
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="border border-border/30 bg-card shadow-depth-md">
            <CardHeader>
              <CardTitle className="text-xl">Contract Details</CardTitle>
              <CardDescription>Contract information and summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tenant</p>
                <p className="text-lg">{tenantName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Period</p>
                <p className="text-lg">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Summary</p>
                <ContractDisplay summary={contract.summary} />
              </div>
              {contract.pdf_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">PDF Document</p>
                  <a
                    href={contract.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline transition-colors"
                  >
                    View PDF Document
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  );
}


