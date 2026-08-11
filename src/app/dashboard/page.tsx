import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/features/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-600">Sesión iniciada como {user.email}</p>
      <form action={signOut}>
        <button type="submit" className="rounded bg-black px-3 py-2 text-white">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
