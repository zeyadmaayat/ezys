import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_purchase_orders",
  title: "List purchase orders",
  description: "List the signed-in user's company purchase orders, most recent first. Optionally filter by status.",
  inputSchema: {
    status: z.string().optional().describe("Optional purchase order status filter (e.g. 'draft', 'approved')."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return. Default 20."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("purchase_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { purchase_orders: data ?? [] },
    };
  },
});
