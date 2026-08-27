import { type SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

// Select con fondo/texto explícitos de Clarity — sin esto, un <select> sin
// estilo propio hereda color de texto del body pero no del desplegable
// nativo abierto (los <option> los pinta el navegador aparte, ignorando la
// mayoría del CSS heredado). Combinado con `color-scheme: light` en
// globals.css, evita el bug de opciones ilegibles en modo oscuro.
export function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={`rounded-button border border-border bg-surface px-3 py-2 text-sm text-foreground ${className}`}
      {...props}
    />
  );
}
