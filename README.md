# DroneXperience

Panel de operaciones para el arriendo de drones. Proyecto independiente en JavaScript, con PostgreSQL real, API Express y frontend React/MUI. No usa datos simulados en el flujo de la aplicación.

## Requisitos y versiones verificadas

- Node.js 20.18.0 y npm 10.8.2. Se puede usar una versión LTS posterior compatible.
- PostgreSQL 17.0, disponible en localhost:5432.
- Git 2.47.0.
- React 19.2.8, Vite 6.4.3, Material UI 7.3.11, React Router 7.18.3.
- Express 5.2.1, pg 8.23.0, Axios 1.20.0, React Hook Form 7.87.0, Zod 3.25.76.

El lockfile fija las versiones instaladas. Se eligió Vite 6 para conservar compatibilidad con el Node 20.18 existente: [requisitos oficiales](https://v6.vite.dev/guide/). MUI utiliza Emotion y React como dependencias pares: [instalación oficial](https://mui.com/material-ui/getting-started/installation/).

## Instalación y ejecución

Desde la raíz del repositorio:

```powershell
cd C:\Repos\DroneXperience
npm ci
npm run dev
```

Para instalar inicialmente o actualizar intencionalmente el lockfile se puede usar `npm install`.

- Web: http://127.0.0.1:5173
- API: http://127.0.0.1:3001/api
- Salud y conexión real: http://127.0.0.1:3001/api/health

Los procesos también se pueden iniciar individualmente:

```powershell
npm run dev:server
npm run dev:client
```

Vite redirige `/api` al puerto 3001. La aplicación no necesita una URL de API en sus componentes ni variables de entorno de frontend.

## Variables de entorno

El backend lee `server/.env` desde una ruta absoluta resuelta a partir de su propio módulo, independientemente del directorio desde el que se ejecute.

```dotenv
PGHOST=localhost
PGPORT=5432
PGDATABASE=dronexperience_01_normalizada
PGUSER=postgres
PGPASSWORD=
PORT=3001
HOST=127.0.0.1
CLIENT_ORIGIN=http://localhost:5173
```

`server/.env.example` es la plantilla sin contraseña. En este equipo `server/.env` ya está configurado; no lo sobrescribas. Ambos patrones de archivos de secretos están excluidos de Git, con excepción explícita de la plantilla.

## PostgreSQL y source of truth

- Database: `dronexperience_01_normalizada`.
- Schema: `dronexperience_01_normalizada`.
- Source of truth original: `C:\Users\nicol\Downloads\DroneXperience.sql`.
- Copia inalterada de referencia: `database/DroneXperience.sql`.
- SHA-256: `FBC5FF1C6FA46CA2E4D1F01762EB776293A5FF60FBBED53DE335570992541254`.

La base y las 20 tablas ya existían. No se creó, eliminó, migró ni restauró ninguna estructura de PostgreSQL. No se ejecuta el dump al iniciar ni al instalar. No hay seed automático.

```powershell
npm run db:audit
```

Esta auditoría lee tipos de columnas, nulabilidad, PK/FK/UNIQUE y conteos exactos, y los contrasta con el dump. Guarda el resultado en `artifacts/database-audit.json`. Ante diferencias, informa los elementos discrepantes y devuelve un código de error; no modifica la base.

[Mapa del modelo](docs/data-model.md).

## Arquitectura

```text
client/
  src/
    api/                 Instancia Axios y normalización de errores
    app/                 Router y proveedor del tema
    components/common/   Tablas, formularios, estados, confirmaciones
    components/layout/   Sidebar, topbar y navegación
    features/            Dashboard, drones, clientes, arriendos y catálogos
    hooks/               Cargas, prevención de respuestas obsoletas y debounce
    services/            Acceso de las features a la API
    theme/               Paleta, tipografía y overrides MUI
    utils/               CLP, fechas y etiquetas
server/
  src/
    config/              Pool pg y transacciones
    routes/              Contrato REST
    repositories/        Consultas separadas por dominio
    services/            Validaciones Zod
    middleware/          Errores centralizados
  scripts/               Auditoría y QA
  test/                  Validación, integración y fixtures temporales
database/                Dump original de referencia
docs/                    Modelo y evidencia de QA
```

Monorepo con npm workspaces, sin framework de monorepo adicional. React mantiene estado local y cargas remotas mediante un hook común. Los formularios usan React Hook Form y reglas de campo; la API vuelve a validar toda entrada con Zod. Las rutas de frontend se cargan de manera diferida.

Los catálogos comparten una pantalla configurable; drones y arriendos tienen interfaces específicas. Las consultas están cualificadas por schema. Valores externos se pasan como parámetros SQL y la ordenación usa una lista de columnas permitidas. Los IDs bigint permanecen como cadenas para no perder precisión en JavaScript.

## Funciones y reglas de operación

- Dashboard calculado desde PostgreSQL: ocho KPIs, distribución de flota, actividad reciente, uso y alertas.
- Drones: búsqueda, filtros, ordenación, paginación, alta, edición, detalle e historial. Característica dinámica por tipo.
- Clientes: personas/empresas, teléfonos y operadores asociados, edición y arriendos relacionados.
- Personal: empleados, inscripción de pilotos, certificaciones con vigencia calculada y operadores.
- Partners: altas, edición, eliminación protegida y listados de aseguradoras, seguros, proveedores y accesorios.
- Arriendos: wizard de siete pasos, edición de borradores, inspecciones de entrega/devolución y timeline.
- Tema claro/oscuro persistente; navegación colapsable y Drawer; formatos es-CL y CLP.

Para operar con una base vacía, registra cliente, dron, empleado, piloto, certificación, aseguradora/seguro y proveedor/accesorio desde sus pantallas. Después crea el arriendo.

El estado del arriendo se obtiene del historial con mayor `secuencia`; no se inventó una columna de estado. El flujo permitido es:

```text
En creación → Confirmado → En vuelo → Finalizado
      └──────────┴──────→ Cancelado
```

- Al crear o editar se exige al menos un seguro y un accesorio.
- Se bloquean cruces de horario del mismo dron o piloto; locks de fila serializan las reservas concurrentes.
- La certificación y el operador seleccionado deben cubrir todo el intervalo.
- Un operador debe pertenecer a la empresa seleccionada.
- Se exige inspección inicial antes del vuelo y final antes del cierre.
- Iniciar vuelo cambia el dron a Arrendado e incrementa una vez `veces_arrendado`; finalizar lo devuelve a Disponible.
- Solo los arriendos En creación se pueden editar.
- Las operaciones compuestas se ejecutan con BEGIN/COMMIT/ROLLBACK.
- El costo total se ingresa como monto acordado o se deja por definir: el SQL no contiene una tarifa de dron para calcularlo automáticamente.
- Las fechas sin zona horaria se conservan como hora civil; las consultas de vigencia usan America/Santiago.

## API

Todas las respuestas exitosas usan `{ success: true, data: ... }`; las listas devuelven `items, total, page, limit`.

| Recurso | Métodos |
|---|---|
| `/api/health`, `/api/dashboard/summary` | GET |
| `/api/drones` | GET, POST |
| `/api/drones/:id` | GET, PUT, DELETE |
| `/api/clientes` | GET, POST |
| `/api/clientes/:id` | GET, PUT |
| `/api/empresas` | GET; sus fichas se consultan como clientes |
| `/api/arriendos` | GET, POST |
| `/api/arriendos/:id` | GET, PUT |
| `/api/arriendos/:id/estados` | POST |
| `/api/arriendos/:id/inspecciones` | PUT |
| `/api/empleados`, `operadores`, `certificaciones`, `aseguradoras`, `seguros`, `proveedores`, `accesorios` | GET, POST; GET, PUT, DELETE en `/:id` |
| `/api/pilotos` | GET, POST; GET, DELETE en `/:id` |

Paginación: `page=0&limit=20`, máximo 100. Búsqueda: `q`. Orden: `sort&direction=asc|desc`. Drones: `tipo&estado`. Clientes: `tipo`. Operadores: `empresa_id`. Arriendos: `estado&dron_id&cliente_id&piloto_id`.

Errores: `{ success: false, message, details? }`. Códigos 404 (no existe), 409 (conflicto), 422 (validación), 503 (conexión/datos no disponibles). No se exponen contraseñas ni stack traces.

## Build y ejecución del resultado compilado

```powershell
npm run build
$env:NODE_ENV = 'production'
npm start
```

En modo producción Express sirve `client/dist`, las rutas del SPA y la API desde http://127.0.0.1:3001. La configuración predeterminada escucha solo en la interfaz local.

## QA

```powershell
npm run lint
npm test
npm run test:integration
npm run dev
# En otra terminal, con la app iniciada:
npm run test:browser
```

`npm test` ejecuta validaciones y marca la integración como omitida si no se habilita explícitamente. `npm run test:integration` ejecuta también las pruebas reales contra la base configurada.

Las pruebas de integración y navegador insertan registros identificados como QA, registran sus IDs y los eliminan en `finally`. No truncan tablas, no reinician secuencias y no borran registros ajenos. Las secuencias pueden avanzar durante las pruebas. Las capturas contienen esos datos temporales, que no permanecen en la aplicación.

El QA de navegador usa Playwright con Microsoft Edge instalado. Los reportes y capturas se guardan localmente en `artifacts/`, excluido de Git.

[Resultados y alcance de QA](docs/qa.md).

## Límites del alcance

No incluye autenticación, roles, facturación ni despliegue público. El avatar identifica un workspace local, sin simular una sesión autenticada. Antes de exponer el servicio en una red compartida se necesita incorporar autenticación y autorización. La aplicación usa las relaciones y el modelo existentes, sin introducir inventario de stock ni snapshots de precios que el SQL no define.

