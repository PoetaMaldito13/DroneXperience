# QA verificado

Fecha: 8 de septiembre de 2026, hora de Chile.

| Gate | Resultado |
|---|---|
| PostgreSQL 17 local y /api/health | PASS |
| Database/schema y 20 tablas | PASS |
| Tipos, nulabilidad, PK/FK/UNIQUE contra dump | PASS, cero discrepancias |
| Original SQL y copia del proyecto | SHA-256 idéntico |
| npm install / lockfile | PASS, cero vulnerabilidades reportadas |
| npm run lint | PASS, sin errores ni warnings |
| npm run test:integration | PASS, 13 pruebas |
| npm run test:browser | PASS, 10 recorridos agrupados |
| Consola de navegador | Cero errores y cero warnings |
| npm run build | PASS |

## Integración PostgreSQL

Se probaron listados reales, alta de ambos subtipos de drones, edición, duplicados, relaciones de clientes/empresas/pilotos, reservas concurrentes, rollback ante FK inválida, seguros/accesorios obligatorios, inspecciones, transiciones, contador de uso, cierre y eliminación protegida. Se verificó el rechazo de IDs malformados y consultas de búsqueda/ordenación maliciosas.

## Navegador

Microsoft Edge headless mediante Playwright, conectado a la API y PostgreSQL reales:

1. Dashboard y navegación de todos los módulos.
2. Alta y edición de drones recreativos y profesionales; campos de subtipo exclusivos.
3. Alta de cliente individual y empresa con teléfonos.
4. Empresa con operadores; piloto con certificaciones; renta en CLP.
5. Wizard completo, bloqueo sin seguro o accesorio y guardado real.
6. Inspección inicial, confirmación, vuelo, inspección final, devolución e historial.
7. Responsive 1366×768, 1440×900, 1920×1080, 820×1180 y 390×844; Drawer, menú colapsado y modo oscuro.
8. Edición de arriendo de empresa conservando operador y relaciones; cancelación confirmada.
9. Edición de empleado y seguro desde los formularios; tabla de drones.
10. Error API legible y recuperación con Reintentar.

Se revisaron visualmente capturas de dashboard claro/oscuro, móvil, wizard y detalle. Se corrigió un separador de breadcrumb aislado en móvil. No hubo desbordamiento horizontal del documento en las resoluciones comprobadas; las tablas usan su contenedor de scroll.

## Evidencia local y datos de prueba

Los reportes están en `artifacts/database-audit.json` y `artifacts/browser-qa.json`. Las capturas PNG de `artifacts/` incluyen registros temporales identificados con QA; esos registros se eliminaron después del recorrido. El frontend no usa mocks.

Al completar las pruebas las 20 tablas quedaron sin registros, igual que antes de la implementación. Se conservaron estructura, relaciones y secuencias; las secuencias avanzaron normalmente durante el QA.

## Alcance

La validación cubre operación local en el navegador y base indicados. No constituye despliegue público ni validación de autenticación: usuarios, roles y hosting no forman parte de esta versión.
