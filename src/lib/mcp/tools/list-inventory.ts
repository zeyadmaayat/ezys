import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_inventory",
  title: "List inventory",
  description:
    "List the signed-in user's company inventory items with quantities. Optionally only items at or below their reorder point.",
  inputSchema: {
    low_stock_only: z.boolean().optional().describe("If true, only return items at or below the reorder point."),
    limit: z.number().int().min(1).max(200).optional().describe("Max rows to return. Default 50."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ low_stock_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("inventory")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = (data ?? []) as Array<Record<string, unknown>>;
    const filtered = low_stock_only
      ? rows.filter((r) => {
          const qty = Number(r.quantity ?? r.quantity_on_hand ?? 0);
          const reorder = Number(r.reorder_point ?? r.reorder_level ?? 0);
          return reorder > 0 && qty <= reorder;
        })
      : rows;

    return {
      content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
      structuredContent: { items: filtered, count: filtered.length },
    };
  },
});
