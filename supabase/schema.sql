-- ============================================================
-- HAVANNA STOCK MANAGEMENT SYSTEM
-- Correr en Supabase SQL Editor (orden importa)
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- TABLAS BASE
-- ============================================================

create table locations (
  id      uuid primary key default gen_random_uuid(),
  name    text not null unique,
  address text,
  created_at timestamptz not null default now()
);

create table suppliers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  contact_name  text,
  contact_phone text,
  notes         text,
  created_at    timestamptz not null default now()
);

create table product_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,  -- 'havanna' | 'external_food'
  label      text not null,
  created_at timestamptz not null default now()
);

create table products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null unique,
  category_id      uuid not null references product_categories(id),
  unit_label       text not null default 'unidad',  -- 'unidad' | 'caja' | 'porción'
  units_per_box    int,   -- unidades por caja cuando aplica; null si no se vende por caja
  min_stock_alert  int not null default 5,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- Stock por local — fuente de verdad, actualizada solo por funciones
create table stock (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references locations(id),
  product_id   uuid not null references products(id),
  quantity     numeric not null default 0 check (quantity >= 0),
  last_updated timestamptz not null default now(),
  unique (location_id, product_id)
);

-- Historial inmutable de movimientos
create table movements (
  id            uuid primary key default gen_random_uuid(),
  location_id   uuid not null references locations(id),
  product_id    uuid not null references products(id),
  movement_type text not null check (movement_type in ('sale', 'restock', 'adjustment')),
  quantity      numeric not null check (quantity > 0),
  supplier_id   uuid references suppliers(id),  -- solo para reposiciones
  notes         text,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

insert into locations (name, address) values
  ('Acuña',       'Av. Acuña de Figueroa'),
  ('Triunvirato', 'Av. Triunvirato');

insert into product_categories (name, label) values
  ('havanna',       'Productos Havanna'),
  ('external_food', 'Comidas de Proveedores');

-- Ajustar con los nombres reales de los 4 proveedores
insert into suppliers (name) values
  ('Proveedor 1'),
  ('Proveedor 2'),
  ('Proveedor 3'),
  ('Proveedor 4');

-- Catálogo Havanna
-- units_per_box: cuántas unidades contiene una caja (para conversión en el agente)
insert into products (name, category_id, unit_label, units_per_box, min_stock_alert)
select p.name, pc.id, p.unit_label, p.units_per_box, p.min_stock_alert
from product_categories pc,
(values
  ('Alfajor de Chocolate',  'unidad', 12, 10),
  ('Alfajor Blanco',        'unidad', 12, 10),
  ('Alfajor Mousse',        'unidad', 12,  8),
  ('Alfajor Marroc',        'unidad', 12,  8),
  ('Caja Surtida x6',       'caja',  null,  4),
  ('Caja Surtida x12',      'caja',  null,  3),
  ('Tableta de Chocolate',  'unidad', 20,  6),
  ('Turrones',              'unidad', 24,  8),
  ('Budín de Naranja',      'unidad', null, 4),
  ('Torta Rogel',           'unidad', null, 2)
) as p(name, unit_label, units_per_box, min_stock_alert)
where pc.name = 'havanna';

-- Catálogo comidas de proveedores externos
insert into products (name, category_id, unit_label, min_stock_alert)
select p.name, pc.id, 'porción', p.min_stock_alert
from product_categories pc,
(values
  ('Empanadas (x2)',               4),
  ('Tarta de Verdura',             4),
  ('Tarta de Jamón y Queso',       4),
  ('Croissant de Jamón y Queso',   6),
  ('Sandwich de Miga',             6),
  ('Pizza por Porción',            4),
  ('Medialunas de Manteca (x4)',   6)
) as p(name, min_stock_alert)
where pc.name = 'external_food';

-- Stock inicial en 0 para todos los productos en ambos locales
insert into stock (location_id, product_id, quantity)
select l.id, p.id, 0
from locations l cross join products p;

-- ============================================================
-- FUNCIONES
-- ============================================================

-- Registrar venta: descuenta stock y crea movimiento
create or replace function record_sale(
  p_location_id uuid,
  p_product_id  uuid,
  p_quantity    numeric,
  p_notes       text default null
)
returns movements
language plpgsql as $$
declare
  v_movement      movements;
  v_current_stock numeric;
begin
  select quantity into v_current_stock
  from stock
  where location_id = p_location_id and product_id = p_product_id
  for update;

  if v_current_stock is null then
    raise exception 'Producto no encontrado en el local especificado';
  end if;

  if v_current_stock < p_quantity then
    raise exception 'Stock insuficiente. Actual: %, solicitado: %', v_current_stock, p_quantity;
  end if;

  update stock
  set quantity     = quantity - p_quantity,
      last_updated = now()
  where location_id = p_location_id and product_id = p_product_id;

  insert into movements (location_id, product_id, movement_type, quantity, notes)
  values (p_location_id, p_product_id, 'sale', p_quantity, p_notes)
  returning * into v_movement;

  return v_movement;
end;
$$;

-- Registrar reposición: suma stock, asocia proveedor
create or replace function record_restock(
  p_location_id  uuid,
  p_product_id   uuid,
  p_quantity     numeric,
  p_supplier_id  uuid default null,
  p_notes        text default null
)
returns movements
language plpgsql as $$
declare
  v_movement movements;
begin
  insert into stock (location_id, product_id, quantity, last_updated)
  values (p_location_id, p_product_id, p_quantity, now())
  on conflict (location_id, product_id)
  do update set
    quantity     = stock.quantity + p_quantity,
    last_updated = now();

  insert into movements (location_id, product_id, movement_type, quantity, supplier_id, notes)
  values (p_location_id, p_product_id, 'restock', p_quantity, p_supplier_id, p_notes)
  returning * into v_movement;

  return v_movement;
end;
$$;

-- Ajuste manual: corrige stock a valor exacto (para inventarios físicos)
create or replace function adjust_stock(
  p_location_id   uuid,
  p_product_id    uuid,
  p_new_quantity  numeric,
  p_notes         text default null
)
returns movements
language plpgsql as $$
declare
  v_movement   movements;
  v_current    numeric;
  v_diff       numeric;
begin
  select quantity into v_current
  from stock
  where location_id = p_location_id and product_id = p_product_id;

  v_diff := p_new_quantity - coalesce(v_current, 0);

  insert into stock (location_id, product_id, quantity, last_updated)
  values (p_location_id, p_product_id, p_new_quantity, now())
  on conflict (location_id, product_id)
  do update set quantity = p_new_quantity, last_updated = now();

  if v_diff != 0 then
    insert into movements (location_id, product_id, movement_type, quantity, notes)
    values (
      p_location_id,
      p_product_id,
      'adjustment',
      abs(v_diff),
      coalesce(p_notes,
        'Ajuste manual: ' || case when v_diff > 0 then '+' else '-' end || abs(v_diff)::text
      )
    )
    returning * into v_movement;
  end if;

  return v_movement;
end;
$$;

-- ============================================================
-- VISTAS
-- ============================================================

-- Stock actual con metadatos completos
create or replace view stock_current as
select
  s.id,
  l.id              as location_id,
  l.name            as location_name,
  p.id              as product_id,
  p.name            as product_name,
  pc.name           as category_name,
  pc.label          as category_label,
  s.quantity,
  p.unit_label,
  p.min_stock_alert,
  s.quantity <= p.min_stock_alert as is_low_stock,
  s.last_updated
from stock s
join locations          l  on l.id  = s.location_id
join products           p  on p.id  = s.product_id
join product_categories pc on pc.id = p.category_id
where p.is_active = true
order by l.name, pc.label, p.name;

-- Comparación de stock entre Acuña y Triunvirato
create or replace view stock_comparison as
select
  p.id              as product_id,
  p.name            as product_name,
  pc.label          as category_label,
  p.unit_label,
  p.min_stock_alert,
  max(case when l.name = 'Acuña'       then s.quantity else 0 end) as acuna_qty,
  max(case when l.name = 'Triunvirato' then s.quantity else 0 end) as triunvirato_qty,
  max(case when l.name = 'Acuña'       then s.quantity else 0 end)
    + max(case when l.name = 'Triunvirato' then s.quantity else 0 end) as total_qty,
  (max(case when l.name = 'Acuña'       then s.quantity else 0 end) <= p.min_stock_alert) as acuna_low,
  (max(case when l.name = 'Triunvirato' then s.quantity else 0 end) <= p.min_stock_alert) as triunvirato_low
from products p
join product_categories pc on pc.id = p.category_id
left join stock     s on s.product_id  = p.id
left join locations l on l.id          = s.location_id
where p.is_active = true
group by p.id, p.name, pc.label, p.unit_label, p.min_stock_alert
order by pc.label, p.name;

-- Alertas de stock bajo
create or replace view low_stock_alerts as
select
  l.name            as location_name,
  p.name            as product_name,
  pc.label          as category_label,
  s.quantity        as current_stock,
  p.min_stock_alert as alert_threshold,
  p.unit_label,
  s.last_updated
from stock s
join locations          l  on l.id  = s.location_id
join products           p  on p.id  = s.product_id
join product_categories pc on pc.id = p.category_id
where s.quantity <= p.min_stock_alert
  and p.is_active = true
order by s.quantity asc, l.name, p.name;

-- Historial de movimientos enriquecido
create or replace view movement_history as
select
  m.id,
  m.created_at,
  l.name  as location_name,
  p.name  as product_name,
  pc.label as category_label,
  m.movement_type,
  case m.movement_type
    when 'sale'       then 'Venta'
    when 'restock'    then 'Reposición'
    when 'adjustment' then 'Ajuste'
  end     as movement_label,
  m.quantity,
  p.unit_label,
  sup.name as supplier_name,
  m.notes
from movements m
join locations          l   on l.id   = m.location_id
join products           p   on p.id   = m.product_id
join product_categories pc  on pc.id  = p.category_id
left join suppliers     sup on sup.id = m.supplier_id
order by m.created_at desc;

-- ============================================================
-- ÍNDICES
-- ============================================================

create index idx_movements_location   on movements(location_id);
create index idx_movements_product    on movements(product_id);
create index idx_movements_created_at on movements(created_at desc);
create index idx_movements_type       on movements(movement_type);
create index idx_stock_loc_prod       on stock(location_id, product_id);
create index idx_products_category    on products(category_id);
create index idx_products_active      on products(is_active) where is_active = true;

-- ============================================================
-- ROW LEVEL SECURITY
-- Políticas permisivas para desarrollo.
-- Reemplazar con políticas de Supabase Auth en producción.
-- ============================================================

alter table locations         enable row level security;
alter table suppliers         enable row level security;
alter table product_categories enable row level security;
alter table products          enable row level security;
alter table stock             enable row level security;
alter table movements         enable row level security;

create policy "dev_allow_all" on locations          for all using (true) with check (true);
create policy "dev_allow_all" on suppliers          for all using (true) with check (true);
create policy "dev_allow_all" on product_categories for all using (true) with check (true);
create policy "dev_allow_all" on products           for all using (true) with check (true);
create policy "dev_allow_all" on stock              for all using (true) with check (true);
create policy "dev_allow_all" on movements          for all using (true) with check (true);
