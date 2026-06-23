# Solución: error `type "public.ReservationStatus" does not exist`

## Causa

La base PostgreSQL crea los tipos ENUM con nombres en snake_case, por ejemplo `reservation_status`, `client_type` y `employee_status`.

Prisma, si no recibe un mapeo explícito, intenta consultar enums con el nombre del modelo Prisma, por ejemplo `ReservationStatus`, `ClientType` o `EmployeeStatus`. Por eso PostgreSQL responde que el tipo `public.ReservationStatus` no existe.

## Corrección aplicada

En `backend/prisma/schema.prisma` se agregó `@@map(...)` en cada enum:

```prisma
enum ReservationStatus {
  BLOCKED
  RELEASED

  @@map("reservation_status")
}
```

La misma corrección se aplicó para:

- `EmployeeStatus` → `employee_status`
- `ClientStatus` → `client_status`
- `ClientType` → `client_type`
- `QuoteStatus` → `quote_status`
- `ReservationStatus` → `reservation_status`

## Qué hacer si ya ejecutaste el proyecto

No necesitas borrar la base. Solo regenera Prisma y reinicia el backend:

```bash
cd backend
npx prisma generate
npm run dev
```

Si quieres limpiar todo desde cero:

```bash
docker compose down -v
docker compose up -d
docker exec -i fastkote-postgres psql -U fastkote_user -d fastkote_db < database/01_schema.sql
docker exec -i fastkote-postgres psql -U fastkote_user -d fastkote_db < database/02_seed.sql
cd backend
npx prisma generate
npm run dev
```
