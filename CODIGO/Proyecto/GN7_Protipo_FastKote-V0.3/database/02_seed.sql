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

UPDATE catalog_packages
SET description = 'Paquete económico para fiestas infantiles con base lista para personalizar.', margin_percent = 35
WHERE name = 'Paquete Infantil Básico';

UPDATE catalog_packages
SET description = 'Paquete flexible para personalizar colores, temática y extras del evento.', margin_percent = 40
WHERE name = 'Arma tu paquete a tu gusto';

UPDATE catalog_packages
SET description = 'Paquete premium con mayor cobertura de productos y servicios para celebraciones.', margin_percent = 42
WHERE name = 'Combo Oro';

INSERT INTO inventory_items (name, unit, brand, current_cost, stock)
VALUES
('Harina de trigo', 'kg', 'Diana', 1.80, 45),
('Azúcar granulada', 'kg', 'Cañaveral', 1.25, 60),
('Vasos biodegradables', 'unidad', 'EcoFiesta', 0.08, 500),
('Servilletas decoradas', 'paquete', NULL, 1.10, 120)
ON CONFLICT (name) DO NOTHING;

INSERT INTO inventory_movements (inventory_item_id, type, quantity, previous_cost, new_cost, notes)
SELECT id, 'COST_UPDATE', 0, 1.60, 1.80, 'Actualización inicial de costo'
FROM inventory_items WHERE name = 'Harina de trigo'
ON CONFLICT DO NOTHING;

INSERT INTO inventory_movements (inventory_item_id, type, quantity, previous_cost, new_cost, notes)
SELECT id, 'IN', 200, 0.07, 0.08, 'Ingreso de insumos para eventos'
FROM inventory_items WHERE name = 'Vasos biodegradables'
ON CONFLICT DO NOTHING;

INSERT INTO service_catalog (type, name, description, suggested_price)
VALUES
('SERVICE', 'Decoración temática', 'Decoración base para eventos infantiles con colores personalizados.', 45.00),
('SERVICE', 'Mesa dulce', 'Montaje de mesa dulce con elementos decorativos y montaje.', 55.00),
('PRODUCT', 'Combo snack infantil', 'Paquete de bocaditos y bebidas para grupos pequeños.', 32.00)
ON CONFLICT (name) DO NOTHING;

INSERT INTO service_recipe_components (service_id, inventory_item_id, name, unit, quantity, unit_cost)
SELECT s.id, i.id, 'Harina de trigo', 'kg', 2, 1.80
FROM service_catalog s, inventory_items i
WHERE s.name = 'Combo snack infantil' AND i.name = 'Harina de trigo'
ON CONFLICT DO NOTHING;

INSERT INTO service_recipe_components (service_id, inventory_item_id, name, unit, quantity, unit_cost)
SELECT s.id, i.id, 'Vasos biodegradables', 'unidad', 50, 0.08
FROM service_catalog s, inventory_items i
WHERE s.name = 'Combo snack infantil' AND i.name = 'Vasos biodegradables'
ON CONFLICT DO NOTHING;

INSERT INTO promotions (name, discount_percent, start_date, end_date, allowed_days, min_amount, active)
VALUES
('Promo Día del Niño', 15.00, '2026-01-01', '2026-12-31', ARRAY['FRIDAY', 'SATURDAY', 'SUNDAY'], 50.00, TRUE),
('Promo Fiesta Escolar', 10.00, '2026-01-01', '2026-12-31', ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'], 80.00, TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO promotion_packages (promotion_id, package_id)
SELECT pr.id, p.id
FROM promotions pr, catalog_packages p
WHERE pr.name = 'Promo Día del Niño' AND p.name IN ('Paquete Infantil Básico', 'Combo Día del Niño Premium')
ON CONFLICT DO NOTHING;

INSERT INTO promotion_services (promotion_id, service_id)
SELECT pr.id, s.id
FROM promotions pr, service_catalog s
WHERE pr.name = 'Promo Día del Niño' AND s.name = 'Combo snack infantil'
ON CONFLICT DO NOTHING;
