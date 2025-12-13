import { TicketStatus, TicketPriority } from "@/types/database";
import { ValidationError } from "@/lib/errors";

const VALID_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_progress", "waiting", "closed"],
  in_progress: ["waiting", "closed"],
  waiting: ["in_progress", "closed"],
  closed: [], // Closed tickets cannot transition
};

export function validateStatusTransition(
  currentStatus: TicketStatus,
  newStatus: TicketStatus
): void {
  if (currentStatus === newStatus) {
    return; // No change is valid
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(newStatus)) {
    throw new ValidationError(
      `Cannot transition from ${currentStatus} to ${newStatus}`
    );
  }
}

export function validateTicketTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError("Ticket title is required");
  }
  if (title.length > 200) {
    throw new ValidationError("Ticket title must be 200 characters or less");
  }
}

export function validateMessageContent(content: string): void {
  if (!content || content.trim().length === 0) {
    throw new ValidationError("Message content is required");
  }
  if (content.length > 10000) {
    throw new ValidationError("Message content must be 10,000 characters or less");
  }
}

