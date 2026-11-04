-- ==============================================================================
-- FoodOps - Semillas de Datos Iniciales (seeds.sql - SQLite)
-- Adaptado para entorno de desarrollo local con SQLite
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Limpieza de datos previa para evitar duplicados en re-ejecuciones
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM users;

-- 2. Inserción de Categorías del Menú
INSERT INTO categories (id, name) VALUES
(1, 'Entradas'),
(2, 'Platos Fuertes'),
(3, 'Bebidas'),
(4, 'Postres');

-- 3. Inserción de Productos del Menú (Entradas, Platos Fuertes, Bebidas, Postres)
INSERT INTO products (id, name, description, price, category_id, image_url, is_active) VALUES
(1, 'Hamburguesa Clásica', 'Carne 100% res, queso cheddar fundido, lechuga fresca y salsa de la casa', 6.50, 2, 'https://images.unsplash.com/photo-1600688640154-9619e002df30?auto=format&fit=crop&w=800&q=85', 1),
(2, 'Tacos al Pastor', 'Tres tacos de cerdo marinado con achiote, piña asada, cilantro y cebolla', 5.00, 2, 'https://images.unsplash.com/photo-1651440204296-a79fa9988007?auto=format&fit=crop&w=800&q=85', 1),
(3, 'Pasta Cremosa', 'Pasta fettuccine artesanal con salsa de queso parmesano, ajo y finas hierbas', 7.50, 2, 'https://images.unsplash.com/photo-1576866206724-c696f4c9fa06?auto=format&fit=crop&w=800&q=85', 1),
(4, 'Alitas BBQ', 'Seis alitas crujientes glaseadas con salsa BBQ ahumada artesanal', 5.75, 1, 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=85', 1),
(5, 'Soda', 'Bebida carbonatada fría en lata (Coca-Cola, Sprite o Fanta) · 355 ml', 1.50, 3, NULL, 1),
(6, 'Brownie Tibio', 'Brownie de chocolate oscuro horneado con nueces y helado artesanal de vainilla', 3.50, 4, 'https://images.unsplash.com/photo-1768342068919-1ee67c1053ba?auto=format&fit=crop&w=800&q=85', 1),
(7, 'Tequeños Crujientes', 'Cinco palitos rellenos de queso blanco fundido servidos con salsa tártara', 4.50, 1, 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=800&q=85', 1),
(8, 'Limonada Natural', 'Limonada refrescante recién exprimida con toque de menta fresca y hielo · 450 ml', 2.00, 3, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=85', 1);

-- 4. Inserción de Usuarios y Personal del Restaurante
INSERT INTO users (id, name, role) VALUES
(1, 'Manuel Panameño', 'waiter'),
(2, 'Sofia Ramos', 'waiter'),
(3, 'Carlos Martínez', 'waiter'),
(4, 'Jefe de Cocina', 'kitchen'),
(5, 'Administrador General', 'admin');

-- 5. Inserción de 3 Pedidos Iniciales en Diferentes Estados:
--   * Pedido 101: estado 'pending' (Pendiente en cola de cocina)
--   * Pedido 102: estado 'progress' (En preparación actualmente)
--   * Pedido 103: estado 'done' (Completado / Terminado para servicio)
INSERT INTO orders (id, table_number, server_id, status, note, total_amount, created_at, updated_at) VALUES
(101, 'Mesa 08', 1, 'pending', 'Sin cebolla en una de las hamburguesas', 14.50, datetime('now', '-3 minutes'), datetime('now', '-3 minutes')),
(102, 'Mesa 03', 2, 'progress', 'Salsa BBQ y aderezo aparte', 14.75, datetime('now', '-8 minutes'), datetime('now', '-5 minutes')),
(103, 'Mesa 12', 3, 'done', 'Brownie tibio servido con helado aparte', 12.50, datetime('now', '-20 minutes'), datetime('now', '-2 minutes'));

-- 6. Inserción de Items de cada Pedido
-- Detalle Pedido 101 (Estado 'pending'): 2x Hamburguesa Clásica ($13.00) + 1x Soda ($1.50) = $14.50
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 101, 1, 2, 6.50, 13.00),
(2, 101, 5, 1, 1.50, 1.50);

-- Detalle Pedido 102 (Estado 'progress'): 1x Tacos al Pastor ($5.00) + 1x Alitas BBQ ($5.75) + 2x Limonada Natural ($4.00) = $14.75
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(3, 102, 2, 1, 5.00, 5.00),
(4, 102, 4, 1, 5.75, 5.75),
(5, 102, 8, 2, 2.00, 4.00);

-- Detalle Pedido 103 (Estado 'done'): 1x Pasta Cremosa ($7.50) + 1x Soda ($1.50) + 1x Brownie Tibio ($3.50) = $12.50
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(6, 103, 3, 1, 7.50, 7.50),
(7, 103, 5, 1, 1.50, 1.50),
(8, 103, 6, 1, 3.50, 3.50);
