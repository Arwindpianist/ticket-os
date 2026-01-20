"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateContract } from "@/modules/contracts/server";
import { getAllTenants } from "@/modules/tenants/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { AnimatedPage } from "@/components/animated-page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContractBuilder, ContractItem } from "@/components/contract-builder";
import { Json } from "@/types/database";

interface Contract {
  id: string;
  tenant_id: string;
  title: string;
  summary: any;
  pdf_url: string | null;
  start_date: string;
  end_date: string;
}

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    tenant_id: "",
    title: "",
    pdf_url: "",
    start_date: "",
    end_date: "",
  });
  const [contractItems, setContractItems] = useState<ContractItem[]>([]);

  // Load contract and tenants
  useEffect(() => {
    async function loadData() {
      try {
        const [tenantsData, contractResponse] = await Promise.all([
          getAllTenants(),
          fetch(`/api/admin/contracts/${contractId}`).then(res => res.json()),
        ]);
        
        setTenants(tenantsData);
        
        if (!contractResponse || contractResponse.error) {
          setError(contractResponse?.error || "Failed to load contract");
          return;
        }
        
        setContract(contractResponse);
        setFormData({
          tenant_id: contractResponse.tenant_id,
          title: contractResponse.title,
          pdf_url: contractResponse.pdf_url || "",
          start_date: contractResponse.start_date,
          end_date: contractResponse.end_date,
        });
        
        // Parse contract items from summary
        const summary = contractResponse.summary;
        if (summary?.items && Array.isArray(summary.items)) {
          setContractItems(summary.items as ContractItem[]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load contract");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [contractId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (contractItems.length === 0) {
        throw new Error("Please add at least one contract item");
      }

      // Store contract items as structured JSON
      const summary: Json = {
        items: contractItems as unknown as Json[],
        version: "1.0",
      };

      await updateContract(contractId, {
        tenant_id: formData.tenant_id !== contract?.tenant_id ? formData.tenant_id : undefined,
        title: formData.title,
        summary,
        pdf_url: formData.pdf_url || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });
      
      router.push(`/admin/contracts/${contractId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update contract");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="container mx-auto py-8 px-4">
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-muted-foreground">Loading contract...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (!contract) {
    return (
      <AnimatedPage>
        <div className="container mx-auto py-8 px-4">
          <div className="flex min-h-screen items-center justify-center">
            <Alert variant="destructive">
              <AlertDescription>{error || "Contract not found"}</AlertDescription>
            </Alert>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Edit Contract
          </h1>
          <p className="text-muted-foreground text-lg">Update contract details and items</p>
        </div>

        <AnimatedCard delay={0.1} className="max-w-2xl mx-auto border border-border/30 bg-card shadow-depth-md">
          <AnimatedCardHeader>
            <CardTitle className="text-2xl font-serif font-bold">Contract Details</CardTitle>
            <CardDescription>Update the information for this contract</CardDescription>
          </AnimatedCardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant</Label>
              <Select
                value={formData.tenant_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, tenant_id: value })
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <ContractBuilder
                value={contractItems}
                onChange={setContractItems}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf_url">PDF URL (Optional)</Label>
              <Input
                id="pdf_url"
                type="url"
                value={formData.pdf_url}
                onChange={(e) =>
                  setFormData({ ...formData, pdf_url: e.target.value })
                }
                disabled={saving}
                placeholder="https://..."
              />
            </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={saving || contractItems.length === 0}
                  className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/contracts/${contractId}`)}
                  disabled={saving}
                  className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
}
