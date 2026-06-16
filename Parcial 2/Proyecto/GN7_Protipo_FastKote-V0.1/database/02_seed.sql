INSERT INTO roles (name, description) VALUES
('Admin', 'Administrador del sistema con acceso completo'),
('Empleado', 'Empleado operativo con acceso a clientes, cotizaciones y calendario')
ON CONFLICT (name) DO NOTHING;

INSERT INTO employees (identification, first_name, last_name, email, phone, address, position)
VALUES
('1720000001', 'Diana', 'Guerra', 'diana@fastkote.local', '0990000001', 'Quito', 'Administradora'),
('1720000002', 'Leonel', 'Tipan', 'leonel@fastkote.local', '0990000002', 'Sangolquí', 'Empleado de cotizaciones')
ON CONFLICT (identification) DO NOTHING;

INSERT INTO employee_roles (employee_id, role_id)
SELECT e.id, r.id FROM employees e, roles r
WHERE e.identification = '1720000001' AND r.name = 'Admin'
ON CONFLICT DO NOTHING;

INSERT INTO employee_roles (employee_id, role_id)
SELECT e.id, r.id FROM employees e, roles r
WHERE e.identification = '1720000002' AND r.name = 'Empleado'
ON CONFLICT DO NOTHING;

-- En entorno académico se permite prefijo plain:. El backend lo acepta solo como semilla local.
INSERT INTO users (username, password_hash, employee_id)
SELECT 'admin', 'plain:Admin123*', e.id
FROM employees e
WHERE e.identification = '1720000001'
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, employee_id)
SELECT 'empleado', 'plain:Empleado123*', e.id
FROM employees e
WHERE e.identification = '1720000002'
ON CONFLICT (username) DO NOTHING;

INSERT INTO clients (full_name, identification, email, phone, address, privacy_consent)
VALUES
('Unidad Educativa Los Pinos', '1790011111001', 'eventos@lospinos.edu.ec', '0981111111', 'Quito, Ecuador', TRUE),
('María Fernanda López', '1722222222', 'maria.lopez@email.com', '0982222222', 'Sangolquí, Ecuador', TRUE),
('Empresa Dulce Promo S.A.', '1790033333001', 'marketing@dulcepromo.ec', '0983333333', 'Valle de los Chillos', TRUE)
ON CONFLICT (identification) DO NOTHING;

INSERT INTO catalog_packages (name, event_types, base_price, price_per_child, min_children, capacity_max)
VALUES
('Paquete Infantil Básico', ARRAY['Cumpleaños infantil'], 90.00, NULL, NULL, 30),
('Arma tu paquete a tu gusto', ARRAY['Cumpleaños infantil', 'Evento familiar'], 99.00, NULL, NULL, 50),
('Combo Súper Fiesta', ARRAY['Cumpleaños infantil'], 99.99, NULL, NULL, 50),
('Combo Día del Niño Básico', ARRAY['Dia del Niño', 'Evento escolar'], NULL, 5.00, 20, NULL),
('Combo Día del Niño Premium', ARRAY['Dia del Niño', 'Evento escolar'], NULL, 6.00, 20, NULL),
('Combo Navideño Básico', ARRAY['Navidad'], 60.00, NULL, NULL, NULL),
('Combo Navideño Intermedio', ARRAY['Navidad'], 70.00, NULL, NULL, NULL),
('Combo Navideño Premium', ARRAY['Navidad'], 80.00, NULL, NULL, NULL),
('Combo Bronce', ARRAY['Cumpleaños infantil', 'Evento familiar'], 75.00, NULL, NULL, NULL),
('Combo Plata', ARRAY['Cumpleaños infantil', 'Evento familiar'], 100.00, NULL, NULL, NULL),
('Combo Oro', ARRAY['Cumpleaños infantil', 'Evento familiar'], 120.00, NULL, NULL, NULL)
ON CONFLICT (name) DO NOTHING;

INSERT INTO catalog_items (package_id, name, category, unit, base_price)
SELECT p.id, 'Granizado', 'Bebida', 'vaso', 0 FROM catalog_packages p WHERE p.name = 'Paquete Infantil Básico'
ON CONFLICT DO NOTHING;

INSERT INTO catalog_items (package_id, name, category, unit, base_price)
SELECT p.id, 'Canguil', 'Snack', 'porción', 0 FROM catalog_packages p WHERE p.name = 'Paquete Infantil Básico'
ON CONFLICT DO NOTHING;
