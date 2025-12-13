"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface UserListItemProps {
  user: {
    id: string;
    email: string;
    role: string;
    created_at: string;
  };
  index: number;
}

export function UserListItem({ user, index }: UserListItemProps) {
  return (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="flex items-center justify-between rounded-lg border border-border/30 p-4 transition-all duration-300 hover:border-primary/20 hover:bg-accent/30 shadow-inner-subtle hover:shadow-depth-sm group">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
              {user.email}
            </h3>
            <Badge
              variant={
                user.role === "tenant_admin"
                  ? "default"
                  : "secondary"
              }
            >
              {user.role === "tenant_admin" ? "Admin" : "User"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Joined {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

