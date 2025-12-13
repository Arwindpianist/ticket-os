"use server";

import { isImpersonating } from "./impersonation";
import { ForbiddenError } from "@/lib/errors";

/**
 * Check if the current session is in read-only mode (impersonation)
 * and throw an error if mutations are attempted during impersonation
 */
export async function requireNotImpersonating(): Promise<void> {
  const impersonating = await isImpersonating();
  if (impersonating) {
    throw new ForbiddenError(
      "This action is not allowed in read-only impersonation mode"
    );
  }
}

