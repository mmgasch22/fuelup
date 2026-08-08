\# Modelo de datos — V1



\## Estado

Aceptado (Sprint 0)



\## Resumen



FuelUp V1 gestiona 7 entidades de dominio, todas relacionadas con el usuario

(`profiles`) mediante `user\_id`. `profiles` extiende `auth.users` de Supabase

en una relación 1:1, usando el mismo `id` como clave primaria y foránea.



\## Entidades



\### profiles

Extiende `auth.users` (Supabase Auth). Relación 1:1 mediante `id` compartido.



| Campo | Tipo | Notas |

|---|---|---|

| id | uuid (PK, FK → auth.users.id) | |

| name | text | |

| age | int | |

| sex | text | |

| height\_cm | float | Unidad fija: centímetros |

| activity\_level | text | |

| workouts\_per\_week | int | |

| goal | text | perder grasa / mantener / ganar masa |

| daily\_steps\_goal | int | Objetivo diario de pasos |

| daily\_water\_goal\_ml | int | Objetivo diario de agua, en mililitros |



\### calorie\_targets

Historial de objetivos calóricos y macros. Un usuario puede tener múltiples

registros a lo largo del tiempo.



| Campo | Tipo | Notas |

|---|---|---|

| id | uuid (PK) | |

| user\_id | uuid (FK → profiles.id) | |

| effective\_date | date | |

| kcal\_target | int | |

| protein\_g | int | |

| carbs\_g | int | |

| fat\_g | int | |



El valor "actual" se obtiene como el registro con `effective\_date` más reciente.



\### foods

Caché local de alimentos consultados desde OpenFoodFacts.



| Campo | Tipo | Notas |

|---|---|---|

| id | uuid (PK) | |

| barcode | text (unique) | Identificador de OpenFoodFacts |

| name | text | |

| kcal\_100g | float | |

| protein\_100g | float | |

| carbs\_100g | float | |

| fat\_100g | float | |

| fiber\_100g | float | |

| sugar\_100g | float | |

| salt\_100g | float | |

| extra\_nutrients | jsonb | Reservado para V2 (vitaminas, minerales) |



\### food\_logs

Registro de comidas del usuario.



| Campo | Tipo | Notas |

|---|---|---|

| id | uuid (PK) | |

| user\_id | uuid (FK → profiles.id) | |

| food\_id | uuid (FK → foods.id) | |

| meal\_type | text (check constraint) | breakfast / lunch / dinner / snack |

| grams | float | |

| date | date | |



\### weight\_logs

Historial de peso.



| Campo | Tipo | Notas |

|---|---|---|

| id | uuid (PK) | |

| user\_id | uuid (FK → profiles.id) | |

| date | date | |

| weight\_kg | float | Unidad fija: kilogramos |



El "peso actual" se obtiene como el registro con `date` más reciente. No se

duplica en `profiles`.



\### steps\_logs

Pasos por día. Una fila por usuario y fecha.



| Campo | Tipo | Notas |

|---|---|---|

| id | uuid (PK) | |

| user\_id | uuid (FK → profiles.id) | |

| date | date | |

| value | int | Total acumulado del día, se actualiza (upsert) |



Constraint: `UNIQUE(user\_id, date)`



\### water\_logs

Agua por día, en mililitros. Una fila por usuario y fecha.



| Campo | Tipo | Notas |

|---|---|---|

| id | uuid (PK) | |

| user\_id | uuid (FK → profiles.id) | |

| date | date | |

| value\_ml | int | Total acumulado del día en ml, se actualiza (upsert) |



Constraint: `UNIQUE(user\_id, date)`



\## Decisiones de diseño y su razonamiento



\- \*\*Objetivo calórico/macros como historial, no como valor único\*\*: el

&#x20; objetivo cambia con el tiempo y queremos poder mostrar su evolución en el

&#x20; futuro sin necesitar una migración posterior.



\- \*\*Peso actual derivado de `weight\_logs`, sin duplicar en `profiles`\*\*:

&#x20; evita inconsistencias entre dos fuentes de verdad para el mismo dato. El

&#x20; coste de consultar el último registro es insignificante a esta escala.



\- \*\*`foods` como caché híbrido de OpenFoodFacts\*\*: se consulta la API externa

&#x20; y se guarda localmente solo lo que el usuario ha usado. Evita importar una

&#x20; base de datos completa (millones de productos) y garantiza que el

&#x20; historial de comidas registradas siga siendo consultable aunque

&#x20; OpenFoodFacts cambie o el producto deje de existir allí. Contrapartida

&#x20; aceptada: los datos cacheados pueden quedar desactualizados con el tiempo;

&#x20; no es crítico para una app de uso personal.



\- \*\*`extra\_nutrients` como campo jsonb reservado\*\*: vitaminas y minerales se

&#x20; reportan de forma muy irregular en OpenFoodFacts. Un campo jsonb permite

&#x20; añadir esos datos en V2 sin migración de esquema, a cambio de menor

&#x20; capacidad de consulta directa sobre esos valores — aceptable porque V1 no

&#x20; los usa en ningún cálculo.



\- \*\*`food\_logs` como tabla única con `meal\_type`\*\*, en vez de una tabla por

&#x20; tipo de comida: evita duplicar estructura 4 veces y simplifica las

&#x20; consultas que agregan el día completo (ej. el dashboard).



\- \*\*`steps\_logs` y `water\_logs` como una fila por día (upsert)\*\*, en vez de

&#x20; un log de eventos: a diferencia del peso, no interesa conservar cada

&#x20; actualización individual del día, solo el total acumulado hasta el

&#x20; momento más reciente.



\- \*\*Agua almacenada en mililitros, no en "vasos"\*\*: mantiene una unidad de

&#x20; medida exacta y sin ambigüedad a nivel de datos. La conversión a "vasos"

&#x20; (u otra representación visual) se resuelve en la capa de interfaz, no en

&#x20; el modelo de datos.



\- \*\*Objetivos diarios de pasos y agua como campos de `profiles`\*\*, sin

&#x20; historial en V1: a diferencia del objetivo calórico, no hay necesidad

&#x20; identificada de ver su evolución en V1. Si en el futuro se necesita,

&#x20; se puede extraer a su propia tabla siguiendo el mismo patrón que

&#x20; `calorie\_targets`.



\- \*\*Sin tabla de estadísticas\*\*: peso, calorías, macros y adherencia se

&#x20; calculan a partir de las tablas anteriores mediante consultas, no se

&#x20; almacenan de forma redundante.



\- \*\*`profiles` como extensión 1:1 de `auth.users`\*\*: separa la

&#x20; responsabilidad de autenticación (gestionada por Supabase) de los datos

&#x20; de dominio propios de FuelUp.

