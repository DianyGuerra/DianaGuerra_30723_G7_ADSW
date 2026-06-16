# Casos de uso implementados

| RF | Caso | Implementación |
|---|---|---|
| RF1 | Autenticar Usuario | Login con usuario, clave, JWT, roles y bloqueo por intentos fallidos. |
| RF2 | Buscar Cliente | Filtro por nombre, cédula/RUC, correo, teléfono y estado. |
| RF3 | Crear Cliente | Registro con consentimiento LOPDP y campos obligatorios. |
| RF4 | Modificar Cliente | Actualización desde modal de edición. |
| RF5 | Buscar e Historial de Empleados | Tabla de empleados con roles asignados. |
| RF6 | Consulta de Empleados | Pantalla frontend para lectura de personal activo. |
| RF7 | Crear Empleado | Alta de trabajador con usuario opcional. |
| RF8 | Modificar Empleado | Edición de ficha de personal. |
| RF9 | Asignar Roles | Relación muchos a muchos empleado-rol. |
| RF10 | Desactivar Empleado | Eliminación lógica mediante estado INACTIVE. |
| RF11 | Buscar Cotizaciones | Filtros por cliente, estado y rango de fechas. |
| RF12 | Crear Cotización | Wizard de 4 pasos en frontend y cálculo en backend. |
| RF13 | Modificar Cotización | Edición permitida solo en estado borrador. |
| RF14 | Actualizar Estado | Modal de cambio de estado con estrategia de agenda. |
| RF15 | Exportar/Enviar | PDF y gateway de WhatsApp desacoplado. |


## Vista pública y roles actuales

La pantalla principal pública presenta la temática del negocio, un carrusel de imágenes, un resumen superior y los botones **Iniciar sesión** y **Registrarse**. El botón de registro queda conectado a una página de construcción porque el alcance actual solo contempla vistas internas para Administrador y Empleado.

- `Admin`: puede gestionar clientes, cotizaciones, calendario, empleados, usuarios y roles.
- `Empleado`: puede operar clientes, cotizaciones y calendario, pero no puede crear, editar, desactivar ni asignar roles a empleados.
