type EnvSource = Record<string, string | undefined>;

function readEnv(key: string): string | undefined {
  // Vite SSR exposes import.meta.env; Node exposes process.env
  const viteEnv = (import.meta as unknown as { env?: EnvSource }).env;
  return viteEnv?.[key] ?? process.env[key];
}

export function getSupabaseUrl() {
  return readEnv("VITE_SUPABASE_URL") ?? readEnv("SUPABASE_URL");
}

export function getSupabasePublishableKey() {
  return readEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ?? readEnv("SUPABASE_PUBLISHABLE_KEY");
}

export function getSupabaseServiceRoleKey() {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function assertSupabaseEnv(require: {
  url?: boolean;
  publishableKey?: boolean;
  serviceRoleKey?: boolean;
}) {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  const missing: string[] = [];
  if (require.url && !url) missing.push("SUPABASE_URL");
  if (require.publishableKey && !publishableKey) missing.push("SUPABASE_PUBLISHABLE_KEY");
  if (require.serviceRoleKey && !serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length) {
    const message = `Missing Supabase environment variable(s): ${missing.join(
      ", ",
    )}. Add them to your local .env (or connect Supabase in Lovable Cloud).`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return { url: url!, publishableKey: publishableKey!, serviceRoleKey };
}

