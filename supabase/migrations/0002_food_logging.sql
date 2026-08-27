-- ============================================================
-- FuelUp — Sprint 4: Food logging
-- ============================================================

-- ------------------------------------------------------------
-- foods.created_by
-- Distingue alimentos creados manualmente por un usuario (sin
-- código de barras) de los cacheados desde OpenFoodFacts.
-- La política RLS de lectura sigue siendo compartida (foods_
-- select_authenticated); el filtrado por autor de alimentos
-- manuales se hace en la query de búsqueda de la aplicación,
-- no aquí.
-- ------------------------------------------------------------
alter table public.foods
  add column created_by uuid references auth.users(id);
