import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { registered, error, reset } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      {registered && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Cuenta creada. Revisa tu email para confirmar tu cuenta antes de
          iniciar sesión.
        </p>
      )}
      {reset === "sent" && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Si ese email tiene una cuenta, te hemos enviado un enlace para
          restablecer la contraseña.
        </p>
      )}
      {error === "confirmation_failed" && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          El enlace de confirmación no es válido o ha caducado. Regístrate de
          nuevo para recibir uno nuevo.
        </p>
      )}
      <LoginForm />
    </main>
  );
}
