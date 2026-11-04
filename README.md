# FoodOps 🍽️⚡
> Sistema ligero de toma de pedidos y cola de preparación de cocina (Kitchen Display System - KDS).

FoodOps es una plataforma ágil diseñada para optimizar el flujo operativo en restaurantes, bares y cafeterías. Permite a los meseros registrar comandas rápidamente desde dispositivos móviles o terminales de mesa y sincronizarlas en tiempo real con una pantalla de preparación en cocina (KDS).

---

## 📑 Tabla de Contenidos

1. [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnol%C3%B3gico)
2. [Prerrequisitos de Software](#-prerrequisitos-de-software)
3. [Estrategia de Ramas Git](#-estrategia-de-ramas-git)
4. [Estructura del Proyecto Frontend](#-estructura-del-proyecto-frontend)
5. [Variables de Entorno (.env.example)](#-variables-de-entorno-envexample)
6. [Guía de Instalación y Despliegue Local](#-gu%C3%ADa-de-instalaci%C3%B3n-y-despliegue-local)
7. [Base de Datos: Adaptación de MySQL a SQLite](#-base-de-datos-adaptaci%C3%B3n-de-mysql-a-sqlite)
8. [Scripts Disponibles](#-scripts-disponibles)
9. [Estándar de Commits](#-est%C3%A1ndar-de-commits)

---

## 🛠 Arquitectura y Stack Tecnológico

- **Frontend:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Estilos:** CSS3 nativo moderno con variables de diseño (Design Tokens), arquitectura modular y soporte responsivo.
- **Base de Datos:** [SQLite 3](https://www.sqlite.org/) (almacenamiento embebido, ACID, cero latencia de red, ideal para terminales locales).
- **Herramientas de Soporte:** Python 3 (motor de inicialización DDL y ejecución de semillas de datos).

---

## 📋 Prerrequisitos de Software

Antes de iniciar, asegúrate de contar con el siguiente software instalado y verificado en tu sistema operativo:

| Software | Versión Mínima Requerida | Comando de Verificación |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.x` (LTS recomendada, ej. v20.x o v24.x) | `node -v` |
| **npm** | `>= 9.x` | `npm -v` |
| **Python** | `>= 3.10` (con módulo estándar `sqlite3`) | `python --version` |
| **Git** | `>= 2.30` | `git --version` |

---

## 🌿 Estrategia de Ramas Git

El proyecto sigue una estrategia basada en **GitFlow** adaptado para equipos ágiles:

```
[main] ───────────────────────────────────────────● (v1.0.0 Release)
         \                                       /
[develop] ──●─────────●──────────────●──────────●
             \       /              /
[feature/*]   ●─────● (feature/kds) ● (feature/order-taking)
```

### Ramas Principales:
- `main`: Código en producción. Totalmente estable, protegido y etiquetado con tags semánticos (`v1.0.0`).
- `develop`: Rama base de desarrollo e integración continua. Todo cambio probado se consolida aquí.

### Estructura de Ramas de Trabajo (`feature/*`):
- `feature/order-taking`: Desarrollo y mejoras en la interfaz de meseros y captura de pedidos.
- `feature/kds-queue`: Pantalla de cocina, gestión de tickets y temporizadores de preparación.
- `feature/sqlite-adapter`: Capa de persistencia, DDL y semillas para SQLite.

### Comandos Git para inicialización y ciclo de vida:

```bash
# 1. Inicializar el repositorio en la rama principal
git init -b main

# 2. Agregar archivos y realizar el commit inicial
git add .
git commit -m "feat(core): initial scaffold for FoodOps with React and SQLite seeds"

# 3. Crear y posicionarse en la rama de integración 'develop'
git checkout -b develop

# 4. Crear una rama de característica específica (ejemplo: feature/kds-queue)
git checkout -b feature/kds-queue

# 5. Publicar cambios y abrir Pull Request hacia develop
git push -u origin feature/kds-queue
```

---

## 📂 Estructura del Proyecto Frontend

La estructura está diseñada siguiendo buenas prácticas de separación por capas funcionales (Feature-Based Architecture):

```text
FoodOps/
├── .env.example                   # Plantilla de variables de entorno
├── .gitignore                      # Exclusiones de Git (node_modules, .env, *.db)
├── index.html                      # Entrypoint HTML de Vite
├── package.json                    # Dependencias y scripts de ejecución
├── README.md                       # Documentación técnica del proyecto
├── tsconfig.json                   # Configuración del compilador TypeScript
├── tsconfig.node.json              # Configuración de TypeScript para Vite
├── vite.config.ts                  # Configuración de plugins, puertos y alias Vite
├── database/                       # Capa de datos y persistencia SQLite
│   ├── foodops.db                  # Base de datos SQLite (generada al ejecutar seed)
│   ├── init_db.py                  # Script automatizado de creación y poblado
│   ├── schema.sql                  # DDL de tablas e índices para SQLite
│   └── seed.sql                    # Semillas con catálogo y comandas iniciales
└── src/                            # Código fuente del Frontend React
    ├── assets/                     # Recursos multimedia, logotipos e iconos
    ├── components/                 # Componentes reutilizables transversales
    │   ├── common/                 # Botones, marcas, iconos, badges
    │   ├── feedback/               # Modales de confirmación, alerts, toasts
    │   └── layout/                 # Cabeceras, barras de estado y contenedores
    ├── features/                   # Módulos por dominio de negocio
    │   ├── kitchen/                # Pantalla KDS (Kitchen Display System)
    │   │   ├── components/         # TicketCard, TicketGrid, TimeBadge
    │   │   ├── hooks/              # useKitchenTickets
    │   │   └── KitchenView.tsx     # Vista principal de Cocina
    │   └── orders/                 # Vista de Pedidos / Comandas (Meseros)
    │       ├── components/         # ProductGrid, CartDrawer, CategoryTabs
    │       ├── hooks/              # useCart, useProducts
    │       └── OrderView.tsx       # Vista principal de Toma de Pedidos
    ├── services/                   # Clientes HTTP y conectores API
    │   └── api.ts                  # Conexión con endpoints REST / Base de datos
    ├── types/                      # Definiciones de tipos TypeScript
    │   ├── index.ts                # Barril de exportación de tipos
    │   ├── order.ts                # Modelos de Ticket, Comanda y Estado
    │   └── product.ts              # Modelos de Producto y Categoría
    ├── utils/                      # Funciones de utilidad y formateadores
    │   └── formatters.ts           # Formateo de moneda, tiempo transcurrido
    ├── App.tsx                     # Orquestador de vistas (Mesero / Cocina)
    ├── index.css                   # Sistema de estilos y variables de diseño
    ├── main.tsx                    # Montaje de la aplicación React en DOM
    └── vite-env.d.ts               # Declaraciones de tipos para variables Vite
```

---

## 🔐 Variables de Entorno (`.env.example`)

Copia el archivo `.env.example` a `.env` antes de ejecutar la aplicación:

```bash
cp .env.example .env
```

Contenido documentado del archivo `.env.example`:

```ini
# ==============================================================================
# FoodOps - Environment Variables Configuration
# ==============================================================================

# Entorno de la aplicación (development | test | production)
NODE_ENV=development
PORT=3000

# Configuración del Frontend (Vite)
VITE_APP_NAME="FoodOps"
VITE_API_BASE_URL="http://localhost:4000/api"
VITE_ENABLE_MOCK_DATA=true

# Persistencia de Base de Datos (SQLite)
# Adaptado de MySQL a SQLite para simplificar despliegue local y soporte offline
DB_DIALECT=sqlite3
DB_STORAGE=./database/foodops.db

# Configuración Legacy de MySQL (Referencia si se requiere conectar a MySQL en la nube)
# DB_DIALECT=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_NAME=foodops_db
# DB_USER=root
# DB_PASSWORD=secret

# Parámetros del Kitchen Display System (KDS)
KDS_REFRESH_INTERVAL_MS=5000
VITE_KDS_AUTO_REFRESH=true
```

---

## 🚀 Guía de Instalación y Despliegue Local

Sigue estos 5 pasos para ejecutar el proyecto en tu máquina local:

### 1. Clonar el repositorio y posicionarse en la carpeta
```bash
git clone <URL_DEL_REPOSITORIO>
cd FoodOps
git checkout develop
```

### 2. Configurar el archivo de entorno
```bash
# En Windows (PowerShell):
Copy-Item .env.example .env

# En Linux/macOS o Git Bash:
cp .env.example .env
```

### 3. Instalar las dependencias de Node.js
```bash
npm install
```

### 4. Inicializar y ejecutar las semillas de SQLite
Ejecuta el aprovisionamiento de la base de datos para crear las tablas y sembrar el catálogo de productos y tickets de prueba:
```bash
npm run db:seed
# o directamente mediante Python:
python database/init_db.py
```
*Salida esperada:*
```text
[FoodOps Database] Iniciando aprovisionamiento en SQLite...
Ruta destino: .../FoodOps/database/foodops.db
Aplicando esquema DDL (schema.sql)...
Tablas creadas: categories, products, users, orders, order_items
Ejecutando semillas de datos iniciales (seed.sql)...
Semillas cargadas correctamente:
   * categories: 4 registros
   * products: 6 registros
   * users: 5 registros
   * orders: 3 registros
   * order_items: 7 registros
[OK] Base de datos SQLite lista para operar con FoodOps.
```

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible inmediatamente en tu navegador en:  
👉 **`http://localhost:3000/`**

---

## 🗄 Base de Datos: Adaptación de MySQL a SQLite

Para garantizar que el sistema opere de manera ultra-ligera en cualquier ordenador local o Raspberry Pi sin requerir levantar servicios pesados de MySQL/MariaDB, se realizó una refactorización de la capa SQL:

| Aspecto | Implementación MySQL (Legacy) | Adaptación SQLite (FoodOps) |
| :--- | :--- | :--- |
| **Claves primarias autonuméricas** | `INT AUTO_INCREMENT PRIMARY KEY` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| **Cadenas y Tipos ENUM** | `VARCHAR(100)`, `ENUM('pending', ...)` | `TEXT` con restricciones `CHECK(status IN (...))` |
| **Valores monetarios** | `DECIMAL(10,2)` | `REAL` / `NUMERIC` |
| **Marcas temporales** | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | `DATETIME DEFAULT CURRENT_TIMESTAMP` |
| **Motor de almacenamiento** | `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4` | Embebido en archivo local (`foodops.db`) |
| **Integridad Referencial** | Nativa en servidor | Habilitada explícitamente vía `PRAGMA foreign_keys = ON;` |
| **Cálculo de fechas relativas** | `NOW() - INTERVAL 5 MINUTE` | `datetime('now', '-5 minutes')` |

### Tablas y Semillas Disponibles:
1. `categories`: Entradas, Platos Fuertes, Bebidas, Postres.
2. `products`: Hamburguesa Clásica ($6.50), Tacos al Pastor ($5.00), Pasta Cremosa ($7.50), Alitas BBQ ($5.75), Soda ($1.50), Brownie Tibio ($3.50).
3. `users`: Meseros (Manuel Panameño, Sofia Ramos, Carlos Martínez), Jefe de Cocina, Administrador.
4. `orders` & `order_items`: Pedidos en cola activa vinculados a mesas y meseros listos para la pantalla KDS.

---

## 📦 Scripts Disponibles

En el archivo `package.json` dispones de los siguientes comandos:

```bash
npm run dev        # Inicia el entorno local de desarrollo con recarga rápida (HMR)
npm run build      # Compila y optimiza el frontend para producción
npm run preview    # Previsualiza la compilación de producción localmente
npm run db:seed    # Re-crea la base de datos SQLite y carga las semillas iniciales
```

---

## 📐 Estándar de Commits

Seguimos la convención de [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(...)`: Nueva característica o funcionalidad.
- `fix(...)`: Corrección de errores.
- `docs(...)`: Actualizaciones en documentación o README.
- `refactor(...)`: Reestructuración de código sin alterar comportamiento.
- `chore(...)`: Tareas de mantenimiento o configuración.

