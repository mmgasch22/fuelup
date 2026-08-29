import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Restablecer contraseña</h1>
      <p className="max-w-sm text-center text-sm text-gray-500">
        Escribe el email de tu cuenta y te enviaremos un enlace para elegir
        una contraseña nueva.
      </p>
      <ForgotPasswordForm />
    </main>
  );
}
