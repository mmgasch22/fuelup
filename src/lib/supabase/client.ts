import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // Flujo implícito: no requiere que la confirmación de email se
      // complete en el mismo navegador que el registro (PKCE sí lo exige).
      auth: {
        flowType: "implicit",
      },
    },
  );
}
