-- ============================================================
-- FuelUp — Sprint 4 (cierre): comidas configurables ("meal slots")
-- ============================================================

-- ------------------------------------------------------------
-- meal_slots
-- Estructura HABITUAL de comidas de un usuario (Desayuno, Comida,
-- "Post-entreno"...). No depende de la fecha y no se duplica por
-- día — el día vive en food_logs.date, esta tabla solo dice "qué
-- comidas existen", para siempre, hasta que se editen/borren.
-- ------------------------------------------------------------
create table public.meal_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_meal_slots_user_order
  on public.meal_slots (user_id, sort_order);

alter table public.meal_slots enable row level security;

create policy "meal_slots_select_own"
  on public.meal_slots for select
  using (auth.uid() = user_id);

create policy "meal_slots_insert_own"
  on public.meal_slots for insert
  with check (auth.uid() = user_id);

create policy "meal_slots_update_own"
  on public.meal_slots for update
  using (auth.uid() = user_id);

create policy "meal_slots_delete_own"
  on public.meal_slots for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Sembrar comidas por defecto para perfiles que ya existían antes
-- de este concepto (evita que su dashboard aparezca vacío).
-- ------------------------------------------------------------
insert into public.meal_slots (user_id, name, sort_order)
select p.id, d.name, d.ord
from public.profiles p
cross join (
  values ('Desayuno', 0), ('Comida', 1), ('Snack', 2), ('Cena', 3)
) as d(name, ord)
where not exists (
  select 1 from public.meal_slots where user_id = p.id
);

-- ------------------------------------------------------------
-- food_logs: sustituir el enum fijo meal_type por una referencia
-- a la comida habitual del usuario. ON DELETE SET NULL: borrar
-- una comida nunca borra ni descuadra el historial nutricional
-- ya registrado, solo pierde su agrupación (queda "sin comida
-- asignada").
-- ------------------------------------------------------------
alter table public.food_logs
  add column meal_slot_id uuid references public.meal_slots(id) on delete set null;

-- Backfill: relacionar los food_logs existentes (con meal_type)
-- con la comida por defecto equivalente recién creada para su
-- usuario, antes de eliminar la columna vieja.
update public.food_logs fl
set meal_slot_id = ms.id
from public.meal_slots ms
where ms.user_id = fl.user_id
  and ms.name = (
    case fl.meal_type
      when 'breakfast' then 'Desayuno'
      when 'lunch' then 'Comida'
      when 'snack' then 'Snack'
      when 'dinner' then 'Cena'
    end
  )
  and fl.meal_slot_id is null;

alter table public.food_logs
  drop column meal_type;

create index idx_food_logs_meal_slot
  on public.food_logs (meal_slot_id);
