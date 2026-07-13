CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE employee_status AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE client_status AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE client_type AS ENUM ('NATURAL', 'JURIDICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reservation_status AS ENUM ('BLOCKED', 'RELEASED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE inventory_movement_type AS ENUM ('IN', 'OUT', 'COST_UPDATE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE service_catalog_type AS ENUM ('SERVICE', 'PRODUCT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE promotion_status AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identification VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(180),
  position VARCHAR(80),
  status employee_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(60) NOT NULL UNIQUE,
  description VARCHAR(180)
);

CREATE TABLE IF NOT EXISTS employee_roles (
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (employee_id, role_id)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  employee_id UUID UNIQUE REFERENCES employees(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type client_type NOT NULL DEFAULT 'NATURAL',
  full_name VARCHAR(140) NOT NULL,
  identification VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(180) NOT NULL,
  status client_status NOT NULL DEFAULT 'ACTIVE',
  privacy_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_id UUID REFERENCES employees(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  event_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  margin_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  base_price NUMERIC(10,2),
  price_per_child NUMERIC(10,2),
  min_children INTEGER,
  capacity_max INTEGER,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID REFERENCES catalog_packages(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80),
  unit VARCHAR(40),
  quantity INTEGER NOT NULL DEFAULT 1,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL UNIQUE,
  unit VARCHAR(40) NOT NULL,
  brand VARCHAR(80),
  current_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type inventory_movement_type NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  previous_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  new_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes VARCHAR(180),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type service_catalog_type NOT NULL,
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  suggested_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_recipe_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  name VARCHAR(120) NOT NULL,
  unit VARCHAR(40),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL UNIQUE,
  discount_percent NUMERIC(5,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  allowed_days TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  min_amount NUMERIC(10,2),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotion_packages (
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES catalog_packages(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, package_id)
);

CREATE TABLE IF NOT EXISTS promotion_services (
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, service_id)
);

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(30) NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES clients(id),
  event_date DATE NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  status quote_status NOT NULL DEFAULT 'DRAFT',
  version INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  valid_until DATE NOT NULL,
  notes TEXT,
  created_by_id UUID REFERENCES employees(id),
  package_id UUID NULL,
  children_count INTEGER NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description VARCHAR(150) NOT NULL,
  category VARCHAR(80),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS event_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL UNIQUE REFERENCES quotes(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  status reservation_status NOT NULL DEFAULT 'BLOCKED',
  reason VARCHAR(180),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_search ON clients(full_name, identification, email);
CREATE INDEX IF NOT EXISTS idx_quotes_filters ON quotes(client_id, status, event_date);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON event_reservations(event_date, status);
CREATE INDEX IF NOT EXISTS idx_inventory_search ON inventory_items(name, brand);
CREATE INDEX IF NOT EXISTS idx_inventory_movements ON inventory_movements(inventory_item_id, created_at);
CREATE INDEX IF NOT EXISTS idx_services_search ON service_catalog(name, type);
CREATE INDEX IF NOT EXISTS idx_promotions_validity ON promotions(active, start_date, end_date);

ALTER TABLE IF EXISTS catalog_packages
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS margin_percent NUMERIC(5,2) NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS catalog_items
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

ALTER TABLE IF EXISTS catalog_packages
  ADD COLUMN IF NOT EXISTS min_price NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS catalog_items
  ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service_catalog(id) ON DELETE SET NULL;

