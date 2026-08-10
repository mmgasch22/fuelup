-- ============================================================
-- FuelUp — Migración inicial V1
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- Extiende auth.users en relación 1:1.
-- Se crea manualmente desde la aplicación tras el registro,
-- por eso todos los campos excepto id son nullable: el usuario
-- puede tener sesión activa antes de completar el onboarding.
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  birth_date date,
  sex text check (sex in ('male', 'female', 'other')),
  height_cm numeric(5,2) check (height_cm > 0),
  activity_level text check (
    activity_level in ('sedentary', 'light', 'moderate', 'very_active', 'extra_active')
  ),
  goal text check (goal in ('lose', 'maintain', 'gain')),
  daily_steps_goal integer check (daily_steps_goal > 0),
  daily_water_goal_ml integer check (daily_water_goal_ml > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- calorie_targets
-- Historial de objetivos calóricos/macros. Un usuario puede
-- tener varios a lo largo del tiempo; el "actual" es el de
-- effective_date más reciente.
-- ------------------------------------------------------------
create table public.calorie_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  effective_date date not null,
  kcal_target integer not null check (kcal_target > 0),
  protein_g integer not null check (protein_g >= 0),
  carbs_g integer not null check (carbs_g >= 0),
  fat_g integer not null check (fat_g >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, effective_date)
);

create index idx_calorie_targets_user_date
  on public.calorie_targets (user_id, effective_date desc);

-- ------------------------------------------------------------
-- foods
-- Caché local de alimentos consultados desde OpenFoodFacts.
-- barcode puede ser NULL (no todos los resultados lo traen).
-- extra_nutrients queda reservado para V2 (vitaminas/minerales).
-- ------------------------------------------------------------
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  barcode text unique,
  name text not null,
  kcal_100g numeric(6,2) not null check (kcal_100g >= 0),
  protein_100g numeric(6,2) check (protein_100g >= 0),
  carbs_100g numeric(6,2) check (carbs_100g >= 0),
  fat_100g numeric(6,2) check (fat_100g >= 0),
  fiber_100g numeric(6,2) check (fiber_100g >= 0),
  sugar_100g numeric(6,2) check (sugar_100g >= 0),
  salt_100g numeric(6,2) check (salt_100g >= 0),
  extra_nutrients jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- food_logs
-- Registro de comidas. meal_type restringido a 4 valores.
-- ------------------------------------------------------------
create table public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  food_id uuid not null references public.foods(id) on delete restrict,
  meal_type text not null check (
    meal_type in ('breakfast', 'lunch', 'dinner', 'snack')
  ),
  grams numeric(6,1) not null check (grams > 0),
  date date not null,
  created_at timestamptz not null default now()
);

create index idx_food_logs_user_date
  on public.food_logs (user_id, date);

create index idx_food_logs_food
  on public.food_logs (food_id);

-- ------------------------------------------------------------
-- weight_logs
-- Historial de peso. Múltiples entradas por día permitidas
-- (ej. mañana y noche). El "peso actual" es el registro más
-- reciente, no se duplica en profiles.
-- ------------------------------------------------------------
create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  created_at timestamptz not null default now()
);

create index idx_weight_logs_user_date
  on public.weight_logs (user_id, date desc);

-- ------------------------------------------------------------
-- steps_logs
-- Una fila por usuario y fecha. value = total acumulado del
-- día hasta la última actualización (no se suman entradas).
-- ------------------------------------------------------------
create table public.steps_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  value integer not null check (value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ------------------------------------------------------------
-- water_logs
-- Igual que steps_logs, pero en mililitros.
-- ------------------------------------------------------------
create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  value_ml integer not null check (value_ml >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.calorie_targets enable row level security;
alter table public.foods enable row level security;
alter table public.food_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.steps_logs enable row level security;
alter table public.water_logs enable row level security;

-- profiles: el usuario solo ve y edita su propia fila
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- calorie_targets: solo el propio usuario
create policy "calorie_targets_select_own"
  on public.calorie_targets for select
  using (auth.uid() = user_id);

create policy "calorie_targets_insert_own"
  on public.calorie_targets for insert
  with check (auth.uid() = user_id);

create policy "calorie_targets_update_own"
  on public.calorie_targets for update
  using (auth.uid() = user_id);

-- foods: caché compartido, cualquier usuario autenticado puede
-- leer y añadir alimentos nuevos, pero no editar/borrar los de otros
create policy "foods_select_authenticated"
  on public.foods for select
  to authenticated
  using (true);

create policy "foods_insert_authenticated"
  on public.foods for insert
  to authenticated
  with check (true);

-- food_logs: solo el propio usuario
create policy "food_logs_select_own"
  on public.food_logs for select
  using (auth.uid() = user_id);

create policy "food_logs_insert_own"
  on public.food_logs for insert
  with check (auth.uid() = user_id);

create policy "food_logs_update_own"
  on public.food_logs for update
  using (auth.uid() = user_id);

create policy "food_logs_delete_own"
  on public.food_logs for delete
  using (auth.uid() = user_id);

-- weight_logs: solo el propio usuario
create policy "weight_logs_select_own"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "weight_logs_insert_own"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create policy "weight_logs_update_own"
  on public.weight_logs for update
  using (auth.uid() = user_id);

create policy "weight_logs_delete_own"
  on public.weight_logs for delete
  using (auth.uid() = user_id);

-- steps_logs: solo el propio usuario
create policy "steps_logs_select_own"
  on public.steps_logs for select
  using (auth.uid() = user_id);

create policy "steps_logs_insert_own"
  on public.steps_logs for insert
  with check (auth.uid() = user_id);

create policy "steps_logs_update_own"
  on public.steps_logs for update
  using (auth.uid() = user_id);

-- water_logs: solo el propio usuario
create policy "water_logs_select_own"
  on public.water_logs for select
  using (auth.uid() = user_id);

create policy "water_logs_insert_own"
  on public.water_logs for insert
  with check (auth.uid() = user_id);

create policy "water_logs_update_own"
  on public.water_logs for update
  using (auth.uid() = user_id);