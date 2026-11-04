-- ==============================================================================
-- FoodOps - Semillas de Datos Iniciales (SQLite)
-- ==============================================================================

-- Limpieza controlada
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM users;

-- 1. Inserción de Categorías
INSERT INTO categories (id, name) VALUES
(1, 'Entradas'),
(2, 'Platos Fuertes'),
(3, 'Bebidas'),
(4, 'Postres');

-- 2. Inserción de Productos
INSERT INTO products (id, name, description, price, category_id, image_url, is_active) VALUES
(1, 'Hamburguesa Clásica', 'Carne, queso, lechuga y salsa de la casa', 6.50, 2, 'https://images.unsplash.com/photo-1600688640154-9619e002df30?auto=format&fit=crop&w=800&q=85', 1),
(2, 'Tacos al Pastor', 'Tres tacos, piña, cilantro y cebolla', 5.00, 2, 'https://images.unsplash.com/photo-1651440204296-a79fa9988007?auto=format&fit=crop&w=800&q=85', 1),
(3, 'Pasta Cremosa', 'Pasta fresca, parmesano y hierbas', 7.50, 2, 'https://images.unsplash.com/photo-1576866206724-c696f4c9fa06?auto=format&fit=crop&w=800&q=85', 1),
(4, 'Alitas BBQ', 'Seis alitas con salsa BBQ ahumada', 5.75, 1, 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=85', 1),
(5, 'Soda', 'Coca-Cola, Sprite o Fanta · 355 ml', 1.50, 3, NULL, 1),
(6, 'Brownie Tibio', 'Chocolate oscuro y helado de vainilla', 3.50, 4, 'https://images.unsplash.com/photo-1768342068919-1ee67c1053ba?auto=format&fit=crop&w=800&q=85', 1);

-- 3. Inserción de Usuarios / Personal
INSERT INTO users (id, name, role) VALUES
(1, 'Manuel Panameño', 'waiter'),
(2, 'Sofia Ramos', 'waiter'),
(3, 'Carlos Martínez', 'waiter'),
(4, 'Jefe de Cocina', 'kitchen'),
(5, 'Administrador General', 'admin');

-- 4. Inserción de Pedidos en Cola (Tickets de Cocina)
INSERT INTO orders (id, table_number, server_id, status, note, total_amount, created_at) VALUES
(102, 'Mesa 1', 1, 'pending', '', 16.25, datetime('now', '-2 minutes')),
(103, 'Mesa 7', 3, 'progress', 'Brownie con helado aparte', 8.50, datetime('now', '-5 minutes')),
(104, 'Mesa 3', 2, 'pending', 'Sin cebolla en una de las hamburguesas', 14.50, datetime('now', '-8 minutes'));

-- 5. Inserción de Items de cada Pedido
-- Pedido 102: 1x Pasta Cremosa ($7.50) + 1x Alitas BBQ ($5.75) + 2x Soda ($3.00) = $16.25
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(102, 3, 1, 7.50, 7.50),
(102, 4, 1, 5.75, 5.75),
(102, 5, 2, 1.50, 3.00);

-- Pedido 103: 1x Tacos al Pastor ($5.00) + 1x Brownie Tibio ($3.50) = $8.50
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(103, 2, 1, 5.00, 5.00),
(103, 6, 1, 3.50, 3.50);

-- Pedido 104: 2x Hamburguesa Clásica ($13.00) + 1x Soda ($1.50) = $14.50
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(104, 1, 2, 6.50, 13.00),
(104, 5, 1, 1.50, 1.50);

