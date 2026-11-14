# QuindioStay -- Plataforma de Turismo del Quindio

> **Dominio 5: Tours y actividades locales**
> Proyecto Final -- Bases de Datos I, Universidad del Quindio, 2026-2

## Descripcion del Proyecto

QuindioStay es una plataforma integral para la gestion de tours turisticos, guianza certificada y experiencias de ecoturismo en el departamento del Quindio, Colombia. Permite administrar prestadores de servicios turisticos, programar salidas de tour, gestionar reservas con poliza de participantes, procesar pagos parciales y en linea, generar reportes operativos y analiticos avanzados con consultas SQL nativas (`GROUP BY`, `HAVING`, subconsultas) y expedir comprobantes oficiales en PDF.

## Stack Tecnologico

| Componente | Tecnologia |
|---|---|
| Backend | Spring Boot 3.3.5 (Java 21, Maven) |
| Base de Datos | MySQL 8.0 (puerto 3307) |
| Frontend | Angular 19 (TypeScript, SCSS, Standalone Components) |
| Autenticacion | JWT (HS256) |
| Generacion PDF | OpenPDF / iText |

## Requisitos Previos

| Herramienta | Version minima |
|---|---|
| JDK | 21 |
| Node.js | 20+ |
| npm | 9+ |
| MySQL | 8.0 |

## Estructura del Proyecto

```
quindiostay/
├── README.md
├── backend/             Spring Boot 3.3.5 (Java 21, Maven)
├── frontend/            Angular 19 (TypeScript, SCSS)
└── database/            Scripts SQL (01_esquema.sql, 02_datos.sql, 03_verificacion.sql, 04_reportes.sql)
```

## Configuracion de Base de Datos (MySQL)

1. Crear la base de datos en MySQL (puerto 3307):
   ```sql
   CREATE DATABASE quindiostay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Ejecutar los scripts SQL de la carpeta `database/` en orden numerico:
   - `01_esquema.sql`: Crea las 19 tablas relacionales con restricciones `CHECK`, llaves foraneas y valores por defecto.
   - `02_datos.sql`: Inserta los datos realistas de prueba anclados en noviembre de 2026.
   - `03_verificacion.sql`: Valida el conteo de registros y verifica 0 violaciones de reglas de negocio.
   - `04_reportes.sql`: Consultas maestras para los 10 reportes analiticos.

3. Credenciales de conexion de MySQL para desarrollo:
   - Host: `localhost`
   - Puerto: `3307`
   - Base de datos: `quindiostay`
   - Usuario: `root`
   - Contrasena: `santiago123`

## Arranque del Proyecto

### Backend (puerto 8080)

En PowerShell (Windows):
```powershell
cd backend
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3307/quindiostay?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Bogota&characterEncoding=UTF-8"
$env:SPRING_DATASOURCE_USERNAME = "root"
$env:SPRING_DATASOURCE_PASSWORD = "santiago123"
$env:SPRING_DATASOURCE_DRIVER_CLASS_NAME = "com.mysql.cj.jdbc.Driver"
.\mvnw.cmd spring-boot:run
```

En Linux/macOS:
```bash
cd backend
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3307/quindiostay?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Bogota&characterEncoding=UTF-8"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="santiago123"
./mvnw spring-boot:run
```

### Frontend (puerto 4200)

```bash
cd frontend
npm install
npm start
```

## URLs del Proyecto

| Recurso | URL |
|---|---|
| Aplicacion web | http://localhost:4200 |
| API Base | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |

## Credenciales de Prueba Oficiales

### Personal Interno (tipo de ingreso: PERSONAL)

| Usuario | Contrasena | Rol | Permisos y Alcance |
|---|---|---|---|
| `admin` | `Admin123*` | ADMINISTRADOR_PLATAFORMA | Acceso total: configuracion de plataforma, usuarios internos, catalogo de prestadores, tours, salidas, reservas, cartera, todos los reportes |
| `operador` | `Operador123*` | OPERADOR | Operacion logistica: programacion de salidas, cancelaciones, reservas, recaudo de pagos, guias, clientes y reportes operativos |
| `enc_cocora` | `Encargado123*` | ENCARGADO_PRESTADOR | Gestion exclusiva de su prestador (Valle de Cocora Expeditions, ID 14): salidas, planes y reservas de sus tours |

### Clientes / Viajeros (tipo de ingreso: CLIENTE)

Todos los clientes registrados con perfil activo utilizan la contrasena: `Cliente123*`

| Correo | Rol | Datos de Perfil |
|---|---|---|
| `alejandro.gomez@gmail.com` | CLIENTE | C.C. 1094928172, Español, WhatsApp preferido |
| `camila.torres@hotmail.com` | CLIENTE | C.C. 1094883921, Español, Correo preferido |
| `emily.johnson@hotmail.com` | CLIENTE | Pasaporte PA-9821734, Inglés, Correo preferido |
| `carlos.ramirez@yahoo.com` | CLIENTE | C.C. 1094112233, Español, SMS preferido |

## Modulos y Funcionalidades Implementadas

| Modulo | Descripcion |
|---|---|
| Autenticacion | Login diferenciado por rol, emision de JWT, almacenamiento en sessionStorage, guards `auth.guard` y `rol.guard` en todas las rutas |
| Tours | CRUD de tours con categoria, dificultad (`BAJA`, `MEDIA`, `ALTA`), duracion, edad minima y prestador de guianza |
| Salidas de Tour | Programacion de salidas con control de cupos, asignacion de guia e idioma, validacion de solapamiento de horarios (RN04) y cancelacion con reembolso (D05/RF25) |
| Reservas | Registro de reservas con participantes y edades (RN06/RN14), calculo automatico de total (D17), politica de cancelacion (RN08) y cambio de estados |
| Pagos | Abonos y pagos totales con validacion de saldo, soporte de metodos en linea (tarjetas, PSE) con referencia y reembolsos controlados (D10) |
| Prestadores | Registro y actualizacion de prestadores turisticos, validacion de RNT, municipio y tipo de prestador |
| Planes | CRUD de planes turisticos con validacion de fechas de vigencia y prestador activo |
| Guias | Registro de guias acreditados con vinculacion de idiomas certificados (`guia_idioma`) |
| Clientes | Directorio para administracion y gestion de perfil y canal preferido para clientes |
| Notificaciones | Bandeja de notificaciones y recordatorios automaticos segun canal preferido |
| Reportes (R1 a R10) | Los 10 reportes analiticos requeridos con consultas SQL nativas (`JdbcTemplate`), filtros por fecha y exportacion en PDF |
| Plantillas PDF | 5 plantillas oficiales: Comprobante de Reserva (Voucher), Recibo de Pago, Factura Oficial, Autorizacion para Menores de Edad y Tratamiento de Datos Personales |

## Reglas de Negocio Clave

- **RN01 / D17**: Calculo automatico: `valor_total = numParticipantes * precio_persona`.
- **RN02**: El plan seleccionado debe estar activo y la salida debe estar dentro de la vigencia del plan.
- **RN04**: Validacion real de horario: un guia no puede tener dos salidas que se solapen segun la duracion del tour (`inicioA < finB AND inicioB < finA`).
- **RN06 / RN14**: Si viajan menores de 18 anos, es obligatorio al menos un adulto acompanante en la misma reserva.
- **RN07**: Una reserva pasa a `CONFIRMADA` unicamente cuando la suma de pagos exitosos cubre el 100% del valor total.
- **RN08**: Cancelacion de reserva con mas de 5 dias de anticipacion reembolsa el 80%; con 5 dias o menos reembolsa el 0%.
- **RN09**: Una reserva solo pasa a `COMPLETADA` si previamente estuvo `CONFIRMADA` y su salida esta `REALIZADA`.
- **RN12**: Solo prestadores de tipo `GUIANZA` y en estado `ACTIVO` pueden publicar tours turisticos.
- **D05 / RF25**: Si el operador cancela una salida, todas sus reservas activas pasan a `CANCELADA` y se les reembolsa el 100% de lo pagado.
- **D06**: Estados `REALIZADA` y `CANCELADA` son terminales y no pueden modificarse. Solo se marca `REALIZADA` si la fecha no es futura.
- **D10**: Un pago solo se reembolsa si la reserva esta cancelada, y el monto reembolsado no puede exceder lo pagado disponible.
- **D16**: Reservas por canales virtuales (`WEB`, `APP_MOVIL`) exigen que el cliente cuente con perfil registrado.

## Decisiones Tecnicas

1. **Cero H2**: Dependencias y archivos en memoria completamente eliminados. La aplicacion valida el esquema directamente contra MySQL 8.0 (`ddl-auto: validate`).
2. **Consultas Nativas**: Todos los 10 reportes de `ReporteService` ejecutan sentencias SQL puras con parametros enlazados en lugar de filtrado en memoria.
3. **Control de Acceso Riguroso**: Roles delimitados en backend (`@PreAuthorize`, `SecurityConfig`) y frontend (`rol.guard.ts`, sidebar reactivo).
4. **Diseño Visual Taste Standard**: Paleta forest green cálida, sin emojis en la interfaz, modales autoajustables a pantalla y estilos consistentes.

---
Universidad del Quindio -- Bases de Datos I, 2026-2
