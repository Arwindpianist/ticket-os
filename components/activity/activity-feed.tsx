"use client";

import { ActivityLog } from "@/modules/activity/queries";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { 
  Ticket, 
  FileText, 
  FileUp, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  AlertCircle,
  UserPlus,
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityFeedProps {
  activities: ActivityLog[];
  showEntityLinks?: boolean;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  ticket_created: <Ticket className="h-4 w-4" />,
  ticket_updated: <Ticket className="h-4 w-4" />,
  ticket_status_changed: <CheckCircle className="h-4 w-4" />,
  message_added: <MessageSquare className="h-4 w-4" />,
  file_uploaded: <FileUp className="h-4 w-4" />,
  file_deleted: <FileUp className="h-4 w-4" />,
  contract_created: <FileText className="h-4 w-4" />,
  contract_updated: <FileText className="h-4 w-4" />,
  user_invited: <UserPlus className="h-4 w-4" />,
  user_created: <UserPlus className="h-4 w-4" />,
};

const ACTION_LABELS: Record<string, string> = {
  ticket_created: "created ticket",
  ticket_updated: "updated ticket",
  ticket_status_changed: "changed ticket status",
  message_added: "added message",
  file_uploaded: "uploaded file",
  file_deleted: "deleted file",
  contract_created: "created contract",
  contract_updated: "updated contract",
  user_invited: "invited user",
  user_created: "created user",
};

function formatActivityMessage(activity: ActivityLog): string {
  const actionLabel = ACTION_LABELS[activity.action_type] || activity.action_type;
  const userName = activity.user?.email?.split("@")[0] || "Unknown user";
  
  let message = `${userName} ${actionLabel}`;
  
  // Add context from metadata
  if (activity.metadata) {
    if (activity.metadata.title) {
      message += `: "${activity.metadata.title}"`;
    }
    if (activity.metadata.status_change) {
      const { from, to } = activity.metadata.status_change;
      message += ` (${from} → ${to})`;
    }
    if (activity.metadata.priority_change) {
      const { from, to } = activity.metadata.priority_change;
      message += ` (priority: ${from} → ${to})`;
    }
    if (activity.metadata.file_name) {
      message += `: ${activity.metadata.file_name}`;
    }
  }
  
  return message;
}

function getActivityIcon(activity: ActivityLog): React.ReactNode {
  return ACTION_ICONS[activity.action_type] || <Clock className="h-4 w-4" />;
}

function getEntityLink(activity: ActivityLog): string | null {
  if (activity.entity_type === "ticket") {
    return `/workspace/tickets/${activity.entity_id}`;
  }
  if (activity.entity_type === "contract") {
    return `/workspace/contracts/${activity.entity_id}`;
  }
  return null;
}

export function ActivityFeed({ activities, showEntityLinks = true }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p className="text-sm">No activity to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const entityLink = showEntityLinks ? getEntityLink(activity) : null;
        const message = formatActivityMessage(activity);
        const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });
        
        const content = (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-card/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5 text-primary">
              {getActivityIcon(activity)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-foreground">
                  {message}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo}
                </span>
              </div>
              {activity.metadata && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {activity.metadata.priority && (
                    <Badge variant="outline" className="text-xs">
                      {activity.metadata.priority}
                    </Badge>
                  )}
                  {activity.metadata.status && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.metadata.status}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );

        if (entityLink) {
          return (
            <a
              key={activity.id}
              href={entityLink}
              className="block transition-all duration-200 hover:scale-[1.01]"
            >
              {content}
            </a>
          );
        }

        return <div key={activity.id}>{content}</div>;
      })}
    </div>
  );
}

