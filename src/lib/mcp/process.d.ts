// Ambient declaration for `process.env` used inside MCP tool handlers.
// At runtime the emitted Supabase Edge Function executes these files under
// Deno with a shimmed `process.env` populated from the function environment.
declare const process: { env: Record<string, string | undefined> };
