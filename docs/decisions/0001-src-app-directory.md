\# ADR 0001: Usar src/app/ en lugar de app/ en la raíz



\## Estado

Aceptado



\## Contexto

create-next-app generó la carpeta `app/` en la raíz del proyecto.

Sin embargo, ya existía una estructura `src/` con subcarpetas

(components, features, hooks, lib, services, styles, types, utils)

pensada para separar el código de aplicación de los archivos de

configuración de la raíz.



\## Decisión

Mover todo el contenido de `app/` a `src/app/`, consolidando

toda la aplicación bajo `src/`.



\## Alternativas consideradas

\- Mantener `app/` en la raíz y eliminar las carpetas vacías de `src/`.

&#x20; Descartada porque perdíamos la separación entre código y configuración.



\## Consecuencias

\- La raíz del repo queda limpia (solo configuración: package.json,

&#x20; next.config.ts, tsconfig.json, etc.).

\- Next.js detecta automáticamente `src/app/`, no requiere configuración

&#x20; adicional.

