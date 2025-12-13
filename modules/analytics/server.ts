"use server";

import { requireSuperAdmin } from "@/modules/auth/server";
import * as queries from "./queries";

export async function getTicketStats() {
  await requireSuperAdmin();
  return queries.getAllTicketStats();
}

export async function getSLAMetrics() {
  await requireSuperAdmin();
  return queries.getSLAMetrics();
}

export async function getTicketTrends(days: number = 30) {
  await requireSuperAdmin();
  return queries.getTicketTrends(days);
}

