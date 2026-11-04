"""
FoodOps - Seeder con SQLAlchemy (SQLite)
Script de inicialización y poblado de base de datos adaptada a SQLite local.
Inserta categorías del menú (Entradas, Platos Fuertes, Bebidas), productos,
usuarios y 3 pedidos iniciales en diferentes estados ('pending', 'progress', 'done').
"""
import os
import sys
from datetime import datetime, timedelta, timezone

# Asegurar codificación UTF-8 en consola de Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    create_engine,
    event,
    func,
    select,
)
from sqlalchemy.engine import Engine
from sqlalchemy.orm import (
    DeclarativeBase,
    relationship,
    sessionmaker,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "foodops.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"


# ==============================================================================
# Habilitar soporte de Claves Foráneas en SQLite
# ==============================================================================
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


# ==============================================================================
# Definición de Modelos ORM (Mapeo DDL SQLite)
# ==============================================================================
class Base(DeclarativeBase):
    pass


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}')>"


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    image_url = Column(Text, nullable=True)
    is_active = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")

    __table_args__ = (
        Index("idx_products_category", "category_id"),
    )

    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', price={self.price})>"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    orders = relationship("Order", back_populates="server")

    __table_args__ = (
        CheckConstraint("role IN ('waiter', 'kitchen', 'admin')", name="check_user_role"),
    )

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', role='{self.role}')>"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    table_number = Column(String, nullable=False)
    server_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    status = Column(String, nullable=False, default="pending")
    note = Column(Text, nullable=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    server = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'progress', 'done', 'cancelled')", name="check_order_status"),
        Index("idx_orders_status", "status"),
    )

    def __repr__(self):
        return f"<Order(id={self.id}, table='{self.table_number}', status='{self.status}', total={self.total_amount})>"


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_order_item_quantity"),
        Index("idx_order_items_order", "order_id"),
    )

    def __repr__(self):
        return f"<OrderItem(order_id={self.order_id}, product_id={self.product_id}, qty={self.quantity})>"


# ==============================================================================
# Función de Poblado / Semillas
# ==============================================================================
def seed_database(engine=None):
    """
    Crea las tablas si no existen y puebla la base de datos con los datos iniciales
    del menú y 3 pedidos en diferentes estados.
    """
    if engine is None:
        engine = create_engine(DATABASE_URL, echo=False)

    print("==================================================================")
    print(" [FoodOps] Poblado de Base de Datos SQLite vía SQLAlchemy")
    print("==================================================================")
    print(f"Ruta base de datos: {DB_PATH}")

    # Asegurar creación de tablas e índices
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # 1. Limpieza de datos previa (orden inverso de dependencias FK)
        print("\n[1/5] Limpiando registros anteriores...")
        session.query(OrderItem).delete()
        session.query(Order).delete()
        session.query(Product).delete()
        session.query(Category).delete()
        session.query(User).delete()
        session.commit()

        # 2. Inserción de Categorías
        print("[2/5] Insertando categorías del menú...")
        cat_entradas = Category(id=1, name="Entradas")
        cat_fuertes = Category(id=2, name="Platos Fuertes")
        cat_bebidas = Category(id=3, name="Bebidas")
        cat_postres = Category(id=4, name="Postres")

        session.add_all([cat_entradas, cat_fuertes, cat_bebidas, cat_postres])
        session.flush()

        # 3. Inserción de Productos del Menú
        print("[3/5] Insertando productos del catálogo (Entradas, Platos Fuertes, Bebidas, Postres)...")
        products = [
            # Platos Fuertes
            Product(
                id=1,
                name="Hamburguesa Clásica",
                description="Carne 100% res, queso cheddar fundido, lechuga fresca y salsa de la casa",
                price=6.50,
                category_id=cat_fuertes.id,
                image_url="https://images.unsplash.com/photo-1600688640154-9619e002df30?auto=format&fit=crop&w=800&q=85",
                is_active=1,
            ),
            Product(
                id=2,
                name="Tacos al Pastor",
                description="Tres tacos de cerdo marinado con achiote, piña asada, cilantro y cebolla",
                price=5.00,
                category_id=cat_fuertes.id,
                image_url="https://images.unsplash.com/photo-1651440204296-a79fa9988007?auto=format&fit=crop&w=800&q=85",
                is_active=1,
            ),
            Product(
                id=3,
                name="Pasta Cremosa",
                description="Pasta fettuccine artesanal con salsa de queso parmesano, ajo y finas hierbas",
                price=7.50,
                category_id=cat_fuertes.id,
                image_url="https://images.unsplash.com/photo-1576866206724-c696f4c9fa06?auto=format&fit=crop&w=800&q=85",
                is_active=1,
            ),
            # Entradas
            Product(
                id=4,
                name="Alitas BBQ",
                description="Seis alitas crujientes glaseadas con salsa BBQ ahumada artesanal",
                price=5.75,
                category_id=cat_entradas.id,
                image_url="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=85",
                is_active=1,
            ),
            Product(
                id=7,
                name="Tequeños Crujientes",
                description="Cinco palitos rellenos de queso blanco fundido servidos con salsa tártara",
                price=4.50,
                category_id=cat_entradas.id,
                image_url="https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=800&q=85",
                is_active=1,
            ),
            # Bebidas
            Product(
                id=5,
                name="Soda",
                description="Bebida carbonatada fría en lata (Coca-Cola, Sprite o Fanta) · 355 ml",
                price=1.50,
                category_id=cat_bebidas.id,
                image_url=None,
                is_active=1,
            ),
            Product(
                id=8,
                name="Limonada Natural",
                description="Limonada refrescante recién exprimida con toque de menta fresca y hielo · 450 ml",
                price=2.00,
                category_id=cat_bebidas.id,
                image_url="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=85",
                is_active=1,
            ),
            # Postres
            Product(
                id=6,
                name="Brownie Tibio",
                description="Brownie de chocolate oscuro horneado con nueces y helado artesanal de vainilla",
                price=3.50,
                category_id=cat_postres.id,
                image_url="https://images.unsplash.com/photo-1768342068919-1ee67c1053ba?auto=format&fit=crop&w=800&q=85",
                is_active=1,
            ),
        ]
        session.add_all(products)
        session.flush()

        # 4. Inserción de Usuarios del Restaurante
        print("[4/5] Insertando personal y usuarios...")
        waiter1 = User(id=1, name="Manuel Panameño", role="waiter")
        waiter2 = User(id=2, name="Sofia Ramos", role="waiter")
        waiter3 = User(id=3, name="Carlos Martínez", role="waiter")
        chef = User(id=4, name="Jefe de Cocina", role="kitchen")
        admin = User(id=5, name="Administrador General", role="admin")

        session.add_all([waiter1, waiter2, waiter3, chef, admin])
        session.flush()

        # 5. Inserción de 3 Pedidos Iniciales en Diferentes Estados ('pending', 'progress', 'done')
        print("[5/5] Insertando 3 pedidos de prueba en diferentes estados de cocina...")
        now = datetime.now(timezone.utc)

        # Pedido 1: 'pending' (En espera de preparación)
        order_pending = Order(
            id=101,
            table_number="Mesa 08",
            server_id=waiter1.id,
            status="pending",
            note="Sin cebolla en una de las hamburguesas",
            total_amount=14.50,
            created_at=now - timedelta(minutes=3),
            updated_at=now - timedelta(minutes=3),
        )
        order_pending.items.extend([
            OrderItem(order_id=101, product_id=1, quantity=2, unit_price=6.50, subtotal=13.00),
            OrderItem(order_id=101, product_id=5, quantity=1, unit_price=1.50, subtotal=1.50),
        ])

        # Pedido 2: 'progress' (En preparación actualmente en cocina)
        order_progress = Order(
            id=102,
            table_number="Mesa 03",
            server_id=waiter2.id,
            status="progress",
            note="Salsa BBQ y aderezo aparte",
            total_amount=14.75,
            created_at=now - timedelta(minutes=8),
            updated_at=now - timedelta(minutes=5),
        )
        order_progress.items.extend([
            OrderItem(order_id=102, product_id=2, quantity=1, unit_price=5.00, subtotal=5.00),
            OrderItem(order_id=102, product_id=4, quantity=1, unit_price=5.75, subtotal=5.75),
            OrderItem(order_id=102, product_id=8, quantity=2, unit_price=2.00, subtotal=4.00),
        ])

        # Pedido 3: 'done' (Listo / Completado para entrega al cliente)
        order_done = Order(
            id=103,
            table_number="Mesa 12",
            server_id=waiter3.id,
            status="done",
            note="Brownie tibio servido con helado aparte",
            total_amount=12.50,
            created_at=now - timedelta(minutes=20),
            updated_at=now - timedelta(minutes=2),
        )
        order_done.items.extend([
            OrderItem(order_id=103, product_id=3, quantity=1, unit_price=7.50, subtotal=7.50),
            OrderItem(order_id=103, product_id=5, quantity=1, unit_price=1.50, subtotal=1.50),
            OrderItem(order_id=103, product_id=6, quantity=1, unit_price=3.50, subtotal=3.50),
        ])

        session.add_all([order_pending, order_progress, order_done])
        session.commit()

        # Resumen de verificación
        print("\n==================================================================")
        print(" [OK] Base de Datos SQLite poblada exitosamente con SQLAlchemy")
        print("==================================================================")
        for model in [Category, Product, User, Order, OrderItem]:
            count = session.query(func.count(model.id)).scalar()
            print(f"   * {model.__tablename__:<15}: {count} registros")

        print("\nDetalle de los 3 pedidos iniciales en diferentes estados:")
        orders = session.query(Order).order_by(Order.id).all()
        for ord_obj in orders:
            print(f"   * [Pedido #{ord_obj.id}] {ord_obj.table_number} | Mesero: {ord_obj.server.name} | Estado: '{ord_obj.status.upper()}' | Total: ${ord_obj.total_amount:.2f}")
            for item in ord_obj.items:
                print(f"       -> {item.quantity}x {item.product.name} (${item.unit_price:.2f} c/u) = ${item.subtotal:.2f}")

    except Exception as e:
        session.rollback()
        print(f"\n[ERROR] Falló la inserción con SQLAlchemy: {e}", file=sys.stderr)
        raise e
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
