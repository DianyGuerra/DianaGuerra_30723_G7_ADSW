# FastKote Fullstack por capas

Versión modular del prototipo **FastKote** para el negocio **Chichi Está de Fiesta**. El proyecto queda separado en:

- `backend/`: API REST con Node.js, Express, TypeScript, Prisma y PostgreSQL.
- `frontend/`: React + Vite + TypeScript, con landing pública, carrusel, login y panel interno por rol.
- `database/`: scripts SQL para crear y poblar PostgreSQL sin depender de Prisma.
- `docs/`: explicación de arquitectura, patrones y casos de uso.

## Tecnologías usadas

### Backend
- Node.js + Express + TypeScript.
- Prisma ORM conectado a PostgreSQL.
- JWT para autenticación.
- bcryptjs para contraseñas.
- PDFKit para generar cotizaciones PDF.
- Arquitectura por capas.
- Patrón Mediator para centralizar casos de uso.
- Patrón Strategy para cálculo de cotizaciones y cambio de estado de agenda.

### Frontend
- React + Vite + TypeScript.
- Fetch API nativa para consumir el backend.
- Componentes separados por páginas, layout, UI y servicios.

### Base de datos
- PostgreSQL.
- Modelo normalizado para usuarios, empleados, roles, clientes, paquetes, cotizaciones, ítems y reservas de agenda.
- Roles principales: `Admin` y `Empleado`. El rol `Admin` administra personal; el rol `Empleado` opera clientes, cotizaciones y calendario.

## Cómo levantar todo

### 1. Levantar PostgreSQL

```bash
docker compose up -d
```

Esto crea un contenedor PostgreSQL con:

- Base: `fastkote_db`
- Usuario: `fastkote_user`
- Clave: `fastkote_pass`
- Puerto: `5432`

### 2. Crear tablas y datos base por SQL

```bash
docker exec -i fastkote-postgres psql -U fastkote_user -d fastkote_db < database/01_schema.sql
docker exec -i fastkote-postgres psql -U fastkote_user -d fastkote_db < database/02_seed.sql
```

### 3. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npm run dev
```

API disponible en:

```txt
http://localhost:4000/api
```

Usuarios iniciales:

```txt
Administrador
usuario: admin
clave: Admin123*

Empleado
usuario: empleado
clave: Empleado123*
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend disponible normalmente en:

```txt
http://localhost:5173
```

## Alcance cubierto

Se cubren los RF principales del enunciado:

- RF1: login con bloqueo por intentos fallidos.
- RF2-RF4: buscar, crear, ver y modificar clientes.
- RF5-RF10: empleados, roles, asignación y desactivación lógica solo para Administrador.
- RF11-RF14: historial, filtros, creación, edición y cambio de estado de cotizaciones.
- RF15: generación PDF y simulación/integración desacoplada para WhatsApp.

## Estructura principal

```txt
fastkote-fullstack-layered/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── application/
│       ├── domain/
│       ├── infrastructure/
│       ├── interfaces/
│       └── shared/
├── frontend/
│   └── src/
│       ├── api/
│       ├── auth/
│       ├── components/
│       ├── pages/
│       └── styles/
├── database/
└── docs/
```

## Nota importante

El envío por WhatsApp queda implementado como servicio desacoplado. Si se configura `WHATSAPP_API_URL` y `WHATSAPP_API_TOKEN`, el backend intenta llamar al proveedor externo. Si no existen esas variables, devuelve una simulación controlada para no romper el flujo académico.


## Cambios visuales de esta versión

- La primera pantalla ya no entra directo al panel interno. Ahora existe una vista pública profesional con navbar, carrusel de imágenes, tarjetas superiores tipo dashboard y botones de acceso.
- El botón **Iniciar sesión** abre el login interno.
- El botón **Registrarse** muestra una página de construcción porque todavía no existe vista pública de clientes.
- Al iniciar sesión, el menú interno se adapta al rol: `Admin` ve empleados y roles; `Empleado` no puede acceder a ese módulo.


## Solución rápida si aparece error de ENUM en Prisma

Si PostgreSQL muestra errores como `type "public.ReservationStatus" does not exist`, revisa `docs/solucion-error-enums-prisma.md`. En resumen, ejecuta:

```bash
cd backend
npx prisma generate
npm run dev
```
