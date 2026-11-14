# QuindíoStay — Plataforma Integral de Turismo y Operación de Salidas

> **Dominio 5: Tours y Actividades Locales**  
> Proyecto Final — Bases de Datos I, Universidad del Quindío, 2026-2  
> Arquitectura Empresarial: Backend Spring Boot 3.3.5 (Java 21) · Frontend Angular 19 · MySQL 8.0

---

## 1. Visión General del Proyecto

**QuindíoStay** es una solución integral diseñada para la gestión, comercialización y control operativo de experiencias ecoturísticas, senderismo y guianza profesional certificada en los 12 municipios del departamento del Quindío, Colombia.

La plataforma articula el ecosistema turístico regional integrando:
- **Prestadores Turísticos Certificados**: Operadores y agencias con Registro Nacional de Turismo (RNT).
- **Guías Profesionales Acreditados**: Asignación logística con validación estricta de idiomas certificados y disponibilidad horaria.
- **Salidas Programadas y Control de Aforo**: Monitoreo de cupos en tiempo real, prevención de solapamientos horarios y políticas de cancelación automatizadas.
- **Reservas y Pólizas de Asistencia**: Registro detallado de participantes con validación de minoría de edad y acompañamiento de adultos responsables (RN06/RN14).
- **Pasarela de Cartera y Pagos**: Gestión de abonos, pagos virtuales (Tarjetas, PSE), liquidación de saldos y reembolsos trazables.
- **Inteligencia de Negocios y Analítica SQL**: Módulo de 10 reportes analíticos de alta complejidad ejecutados directamente en el motor relacional mediante SQL nativo (`GROUP BY`, `HAVING`, tablas derivadas, subconsultas escalares).
- **Emisión de Documentos Oficiales en PDF**: Generación en servidor con autenticación JWT de vouchers de reserva, recibos de caja, facturas, consentimientos informados y tratamiento de datos personales.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión | Descripción / Propósito |
|---|---|---|---|
| **Backend** | Spring Boot | 3.3.5 | API RESTful modular, Spring Data JPA, Spring Security, Validation |
| **Lenguaje Backend** | Java (JDK) | 21 LTS | Código moderno con Records, Pattern Matching y Virtual Threads |
| **Base de Datos** | MySQL Server | 8.0 (Puerto 3307) | Motor relacional InnoDB con restricciones declarativas `CHECK`, `UNIQUE`, `FK RESTRICT` (0 Triggers) |
| **Frontend** | Angular | 19.0.0 | Arquitectura basada en Standalone Components, Signals, Reactive Forms y RxJS |
| **Diseño y Estilos** | SCSS Modular | BEM / Tokens | Paleta orgánica institucional (Verde Bosque, Esmeralda, Menta y Glassmorphism) sin emojis |
| **Seguridad** | JWT (JSON Web Tokens) | JJWT 0.12.6 | Firma criptográfica HMAC-SHA256, expiración de tokens, guards `auth.guard` y `rol.guard` |
| **Generación PDF** | OpenPDF / iText | 1.3.39 | Renderizado dinámico de plantillas vectoriales y comprobantes formales |
| **Documentación API** | OpenAPI 3.0 / Swagger | SpringDoc 2.6.0 | Catálogo interactivo de endpoints |

---

## 3. Requisitos del Sistema

Para el despliegue y ejecución local se requiere contar con:
- **Java Development Kit (JDK)**: Versión 21 o superior configurada en `JAVA_HOME`.
- **Node.js**: Versión 20.x LTS o superior con gestor de paquetes `npm` 10+.
- **MySQL Server**: Versión 8.0 (configurado en el puerto `3307` o según configuración local).
- **Maven**: 3.9+ (o el wrapper `./mvnw` provisto).

---

## 4. Estructura del Repositorio

```
Quindiostay/
├── backend/                      # API REST Spring Boot (Java 21)
│   ├── src/main/java/           # Código fuente organizado por capas (domain, dto, repository, service, controller)
│   ├── src/main/resources/      # application.yml y plantillas
│   └── src/test/java/           # Suite de pruebas unitarias y de integración
├── frontend/                     # Aplicación SPA Angular 19
│   ├── src/app/core/            # Servicios transversales, autenticación JWT, modelos e interceptores
│   ├── src/app/features/        # Módulos de negocio (tours, salidas, reservas, pagos, clientes, catálogos, reportes)
│   ├── src/app/layout/          # Shell institucional, topbar y navegación lateral
│   └── src/styles/              # Sistema de diseño, tokens, tipografía e iconografía SVG
└── database/                     # Scripts SQL declarativos oficiales
    ├── 01_esquema.sql           # DDL: Creación de tablas, claves primarias, foráneas y restricciones CHECK
    ├── 02_datos.sql             # DML: Datos base y transaccionales realistas de prueba
    ├── 03_verificacion.sql      # Scripts de verificación y auditoría de integridad
    └── 04_reportes.sql          # Consultas analíticas SQL para los 10 reportes de negocio
```

---

## 5. Puesta en Marcha de la Base de Datos

1. **Creación del Esquema en MySQL**:
   ```sql
   CREATE DATABASE quindiostay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Ejecución de Scripts en Orden Numérico Estricto**:
   - `01_esquema.sql`: Crea las 19 tablas relacionales con restricciones `CHECK`, `UNIQUE` e integridad referencial `FK`.
   - `02_datos.sql`: Carga el catálogo geográfico, operadores turísticos, guías acreditados, clientes y registros históricos.
   - `03_verificacion.sql`: Valida que no existan inconsistencias ni violaciones de restricciones.
   - `04_reportes.sql`: Contiene las consultas maestras que alimentan los reportes analíticos del sistema.

---

## 6. Configuración y Despliegue

### 6.1 Backend (Spring Boot — Puerto 8080)

Configure las variables de entorno de su motor de base de datos antes de iniciar:

**En Windows (PowerShell):**
```powershell
cd backend
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3307/quindiostay?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Bogota&characterEncoding=UTF-8"
$env:SPRING_DATASOURCE_USERNAME = "<SU_USUARIO_MYSQL>"
$env:SPRING_DATASOURCE_PASSWORD = "<SU_CONTRASENA_MYSQL>"
.\mvnw.cmd spring-boot:run
```

**En Linux / macOS (Bash):**
```bash
cd backend
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3307/quindiostay?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Bogota&characterEncoding=UTF-8"
export SPRING_DATASOURCE_USERNAME="<SU_USUARIO_MYSQL>"
export SPRING_DATASOURCE_PASSWORD="<SU_CONTRASENA_MYSQL>"
./mvnw spring-boot:run
```

**Ejecución de Pruebas Unitarias:**
```bash
cd backend
./mvnw clean test
```

### 6.2 Frontend (Angular 19 — Puerto 4200)

1. Instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Iniciar el servidor de desarrollo:
   ```bash
   npm start
   ```

3. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 7. Puntos de Entrada y Servicios

| Componente | Dirección | Descripción |
|---|---|---|
| **Portal Web de la Aplicación** | `http://localhost:4200` | Interfaz de usuario interactiva |
| **API RESTful** | `http://localhost:8080/api` | Endpoints del backend protegidos con JWT |
| **Documentación Swagger UI** | `http://localhost:8080/swagger-ui.html` | Especificación OpenAPI 3.0 interactiva |
| **Verificación de Salud** | `http://localhost:8080/api/health` | Estado del backend y conectividad |

---

## 8. Roles de Usuario y Modelo de Seguridad

El sistema implementa un control de acceso basado en roles (RBAC) con tokens JWT y autorización en dos niveles (Spring Security `@PreAuthorize` en endpoints y Angular `rolGuard` en rutas):

### 1. `ADMINISTRADOR_PLATAFORMA`
- Control total sobre el sistema y configuración global.
- CRUD completo de Catálogos Maestros: Municipios, Tipos de Prestador, Roles, Categorías de Tour e Idiomas.
- Gestión de Usuarios Internos, auditoría de operadores y acceso a todos los reportes estratégicos.

### 2. `OPERADOR`
- Coordinación logística general de la operación turística en el Quindío.
- Programación de salidas de tours, asignación de guías certificados e idiomas.
- Alta de clientes de mostrador (RN01 presencial), creación de reservas, recaudo de pagos y cancelación de salidas con reembolso integral.

### 3. `ENCARGADO_PRESTADOR`
- Ámbito restringido a la entidad prestadora de servicios turísticos a la que pertenece.
- Administración de los tours propios de su operador, planes comerciales asociados y consulta de ocupación de sus salidas.

### 4. `CLIENTE`
- Portal del viajero para consulta del catálogo de tours y salidas disponibles.
- Reserva asistida (el operador y planes disponibles se ligan de manera automática a la salida elegida).
- Consulta exclusiva de sus propias reservas, historial de pagos, comprobantes descargables en PDF y gestión de preferencias de notificación.

> **Nota para Evaluadores y Pruebas**:  
> Los usuarios y credenciales iniciales para pruebas en entornos de laboratorio provienen directamente del script `database/02_datos.sql`. Por políticas de seguridad y buenas prácticas de entrega, no se almacenan contraseñas en texto plano dentro del repositorio ni en este manual.

---

## 9. Resumen de Reglas de Negocio Implementadas

- **RN01 / Alta Presencial**: Creación de clientes en mostrador sin requerir credenciales de usuario; si el cliente posteriormente se registra en línea, su cuenta unifica el historial presencial existente.
- **RN02 / Vigencia de Planes**: Un plan turístico solo puede asociarse a una salida si está activo y la fecha de la salida se encuentra dentro de su ventana de vigencia.
- **RN04 / Disponibilidad y Cruce de Guías**: Validación en tiempo real del horario de los guías considerando la duración del tour (`inicioA < finB AND inicioB < finA`). Se prohíbe la doble asignación de un guía a salidas que se solapen.
- **RN06 / RN14 / Política de Menores**: Si una reserva incluye participantes menores de 18 años, el sistema valida la presencia obligatoria de al menos un adulto responsable y genera la plantilla oficial de autorización para menores.
- **RN07 / Confirmación por Pago**: Una reserva solo pasa al estado `CONFIRMADA` cuando la suma de sus transacciones exitosas cubre el 100% del valor liquidado.
- **RN08 / Política de Cancelación y Reembolsos**:
  - Cancelación con más de 5 días de antelación: 80% de reembolso del valor pagado.
  - Cancelación con 5 días o menos: 0% de reembolso.
- **D05 / Cancelación por Operador**: Si la administración cancela una salida programada, todas las reservas vinculadas se cancelan automáticamente y se genera un reembolso del 100% de lo pagado.
- **D06 / Transiciones Terminales**: Los estados `REALIZADA` y `CANCELADA` son finales. Una salida solo puede transicionar a `REALIZADA` desde `PROGRAMADA` y en fecha no futura.
- **D17 / Integridad de Cartera**: El valor total de la reserva se recalcula dinámicamente como `número de participantes × precio por persona`.

---

## 10. Reportes Analíticos Oficiales (R1 a R10)

Todos los reportes están implementados mediante consultas SQL nativas de alto rendimiento (`JdbcTemplate`) y permiten exportación en formato PDF aplicando los mismos filtros definidos en pantalla:

1. **R1**: Salidas por Tour y Rango de Fechas (Ocupación y Recaudo).
2. **R2**: Estado de Reservas y Recaudo por Período.
3. **R3**: Balance de Pagos por Método y Estado de Transacción.
4. **R4**: Consolidado de Reservas por Municipio del Quindío.
5. **R5**: Productividad y Horas de Guianza de Guías Acreditados.
6. **R6**: Top Tours con Mayor Tasa de Ocupación (Tabla Derivada).
7. **R7**: Historial de Notificaciones Enviadas por Canal.
8. **R8**: Guías Bilingües con Mayor Número de Salidas Programadas (`HAVING`).
9. **R9**: Tours que Nunca Han Tenido Cancelaciones de Salida (`NOT EXISTS`).
10. **R10**: Clientes con Gasto Superior al Promedio General de la Plataforma (Subconsulta Escalar en `HAVING`).

---

## 11. Cumplimiento de Rúbrica y Estándares

- **Sin Triggers**: Toda la lógica de negocio y validación de transiciones está centralizada en los servicios de Spring Boot, preservando la portabilidad del motor de base de datos.
- **Nombres Estándar de Restricciones**: Restricciones bautizadas con prefijos oficiales (`pk_`, `uq_`, `ck_`, `fk_`).
- **Respuesta de Conflictos (409)**: Cualquier intento de eliminar o alterar entidades maestras en uso por llaves foráneas retorna un código HTTP 409 con mensaje explicativo, impidiendo errores 500 no controlados.
- **Zero Emojis**: Interfaz gráfica corporativa y limpia basada en iconografía SVG vectorial.
- **Descargas Seguras**: Todos los botones de PDF realizan peticiones autenticadas vía interceptor JWT liberando los objetos URL tras la descarga.
