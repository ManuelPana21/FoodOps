-- ==============================================================================
-- FoodOps - Esquema de Base de Datos SQLite (Migrado desde MySQL)
-- ==============================================================================
-- Adaptaciones de MySQL a SQLite:
-- 1. INT AUTO_INCREMENT -> INTEGER PRIMARY KEY AUTOINCREMENT
-- 2. VARCHAR(N), TEXT, ENUM -> TEXT con restricciones CHECK
-- 3. DECIMAL(10,2) -> REAL o NUMERIC
-- 4. TIMESTAMP / DATETIME DEFAULT CURRENT_TIMESTAMP -> DATETIME DEFAULT CURRENT_TIMESTAMP
-- 5. Eliminado ENGINE=InnoDB y charset utf8mb4 (nativo en SQLite)
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Categorías de Productos
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Catálogo de Productos
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category_id INTEGER NOT NULL,
    image_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
);

-- 3. Usuarios y Personal (Meseros, Cocineros, Admin)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('waiter', 'kitchen', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Pedidos / Órdenes (Cola KDS)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number TEXT NOT NULL,
    server_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'progress', 'done', 'cancelled')),
    note TEXT,
    total_amount REAL NOT NULL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- 5. Detalle de Pedido (Items por Orden)
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
);

-- Índices para optimizar consultas de cola KDS y catálogo
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
