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
  CREATE TYPE reservation_status AS ENUM ('BLOCKED', 'RELEASED');
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
  event_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
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
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0
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
