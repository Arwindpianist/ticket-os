"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateUserTenant, deleteUser } from "@/modules/users/server";
import { User } from "@/modules/users/server";
import { Tenant } from "@/modules/tenants/types";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface UserListProps {
  users: User[];
  tenants: Tenant[];
  currentUserId: string;
}

export function UserList({ users, tenants, currentUserId }: UserListProps) {
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const handleTenantChange = async (userId: string, tenantId: string | null) => {
    setUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      await updateUserTenant(userId, tenantId);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Failed to update user tenant");
      setUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    setDeleting((prev) => ({ ...prev, [userId]: true }));
    try {
      await deleteUser(userId);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Failed to delete user");
      setDeleting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (users.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No users found. Create your first user to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between rounded-lg border p-4 shadow-inner-subtle hover:shadow-depth-sm transition-all duration-300"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{user.email}</span>
              <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                {user.role === "super_admin" ? "Super Admin" : 
                 user.role === "tenant_admin" ? "Tenant Admin" : "Tenant User"}
              </Badge>
              {user.must_change_password && (
                <Badge variant="destructive">Must Change Password</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Created: {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user.role !== "super_admin" && (
              <Select
                value={user.tenant_id || ""}
                onValueChange={(value) => 
                  handleTenantChange(user.id, value === "none" ? null : value)
                }
                disabled={updating[user.id]}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Tenant</SelectItem>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {user.role === "super_admin" && (
              <span className="text-sm text-muted-foreground">No tenant assignment</span>
            )}
            {user.id !== currentUserId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleting[user.id]}
                    className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <strong>{user.email}</strong>? This action cannot be undone and will permanently remove the user from the system.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {user.id === currentUserId && (
              <span className="text-xs text-muted-foreground italic">Cannot delete yourself</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

