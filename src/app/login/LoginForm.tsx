"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/features/auth/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded border px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded border px-3 py-2"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Entrando..." : "Iniciar sesión"}
      </button>
      <p className="text-sm text-gray-500">
        <Link href="/forgot-password" className="underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
      <p className="text-sm text-gray-500">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
