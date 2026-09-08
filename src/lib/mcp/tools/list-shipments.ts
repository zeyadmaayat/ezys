import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_shipments",
  title: "List shipments",
  description:
    "List the signed-in user's company shipments (from shipments_v2), most recent first. Optionally filter by status.",
  inputSchema: {
    status: z.string().optional().describe("Optional shipment status filter (e.g. 'created', 'in_transit', 'delivered')."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return. Default 20."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("shipments_v2")
      .select("id,tracking_number,status,origin,destination,created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { shipments: data ?? [] },
    };
  },
});
