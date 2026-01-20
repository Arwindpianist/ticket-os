"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Navigation() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const isAdmin = pathname?.startsWith("/admin");
  const isWorkspace = pathname?.startsWith("/workspace");

  return (
    <nav className="border-b border-border/20 bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-50 shadow-depth-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link 
            href={isAdmin ? "/admin" : "/workspace"} 
            className="font-serif font-bold text-xl transition-colors hover:text-primary"
          >
            Ticket OS
          </Link>
          {isWorkspace && (
            <>
              <Link
                href="/workspace"
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative px-2 py-1 rounded-md",
                  pathname === "/workspace" 
                    ? "text-foreground bg-accent" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Dashboard
                {pathname === "/workspace" && (
                  <motion.div
                    layoutId="workspace-indicator"
                    className="absolute inset-0 bg-accent rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              <Link
                href="/workspace/tickets"
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative px-2 py-1 rounded-md",
                  pathname?.startsWith("/workspace/tickets")
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Tickets
                {pathname?.startsWith("/workspace/tickets") && (
                  <motion.div
                    layoutId="workspace-indicator"
                    className="absolute inset-0 bg-accent rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              <Link
                href="/workspace/contracts"
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative px-2 py-1 rounded-md",
                  pathname?.startsWith("/workspace/contracts")
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Contracts
                {pathname?.startsWith("/workspace/contracts") && (
                  <motion.div
                    layoutId="workspace-indicator"
                    className="absolute inset-0 bg-accent rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              <Link
                href="/workspace/users"
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative px-2 py-1 rounded-md",
                  pathname?.startsWith("/workspace/users")
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Users
                {pathname?.startsWith("/workspace/users") && (
                  <motion.div
                    layoutId="workspace-indicator"
                    className="absolute inset-0 bg-accent rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              <Link
                href="/workspace/branding"
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative px-2 py-1 rounded-md",
                  pathname?.startsWith("/workspace/branding")
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Branding
                {pathname?.startsWith("/workspace/branding") && (
                  <motion.div
                    layoutId="workspace-indicator"
                    className="absolute inset-0 bg-accent rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative px-2 py-1 rounded-md",
                  pathname === "/admin" 
                    ? "text-foreground bg-accent" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Dashboard
                {pathname === "/admin" && (
                  <motion.div
                    layoutId="admin-indicator"
                    className="absolute inset-0 bg-accent rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              <Link
                href="/admin/tenants"
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative px-2 py-1 rounded-md",
                  pathname?.startsWith("/admin/tenants")
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Tenants
                {pathname?.startsWith("/admin/tenants") && (
                  <motion.div
                    layoutId="admin-indicator"
                    className="absolute inset-0 bg-accent rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              <Link
                href="/admin/tickets"
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative px-2 py-1 rounded-md",
                  pathname?.startsWith("/admin/tickets")
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Tickets
                {pathname?.startsWith("/admin/tickets") && (
                  <motion.div
                    layoutId="admin-indicator"
                    className="absolute inset-0 bg-accent rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              <Link
                href="/admin/contracts"
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative px-2 py-1 rounded-md",
                  pathname?.startsWith("/admin/contracts")
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Contracts
                {pathname?.startsWith("/admin/contracts") && (
                  <motion.div
                    layoutId="admin-indicator"
                    className="absolute inset-0 bg-accent rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              <Link
                href="/admin/users"
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative px-2 py-1 rounded-md",
                  pathname?.startsWith("/admin/users")
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Users
                {pathname?.startsWith("/admin/users") && (
                  <motion.div
                    layoutId="admin-indicator"
                    className="absolute inset-0 bg-accent rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </>
          )}
        </div>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="transition-all duration-200 hover:bg-accent"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}

