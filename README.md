# 🏔️ QuindíoStay — Plataforma de Turismo del Quindío

> **Dominio 5: Tours y actividades locales**  
> Proyecto académico — Bases de Datos I, Universidad del Quindío

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| JDK | 21 |
| Node.js | 20+ |
| npm | 9+ |
| MySQL (solo perfil `mysql`) | 8.0 |

## Estructura del proyecto

```
quindiostay/
├── README.md            ← este archivo
├── .gitignore
├── backend/             Spring Boot 3.3 (Java 21, Maven)
├── frontend/            Angular 19+ (TypeScript, SCSS)
└── database/            Scripts SQL (Entrega 3)
```

## 🚀 Arranque rápido (desarrollo con H2)

### Backend (puerto 8080)

```bash
cd backend
./mvnw spring-boot:run
```

> En Windows usar `mvnw.cmd spring-boot:run`

### Frontend (puerto 4200)

```bash
cd frontend
npm install
npm start
```

## 🔗 URLs útiles

| Recurso | URL |
|---|---|
| Aplicación web | http://localhost:4200 |
| API Health | http://localhost:8080/api/health |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Consola H2 | http://localhost:8080/h2-console |

### Consola H2

- JDBC URL: `jdbc:h2:mem:quindiostay;MODE=MySQL`
- Usuario: `sa`
- Contraseña: _(vacía)_

## 🔑 Credenciales de desarrollo

| Usuario | Contraseña | Tipo de ingreso | Rol |
|---|---|---|---|
| `admin` | `Admin123*` | PERSONAL | ADMINISTRADOR_PLATAFORMA |
| `operador` | `Operador123*` | PERSONAL | OPERADOR |
| `cliente@correo.com` | `Cliente123*` | CLIENTE | CLIENTE |

## 🔄 Cómo pasar a MySQL

1. Crear la base de datos en MySQL:
   ```sql
   CREATE DATABASE quindiostay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Ejecutar los scripts de la carpeta `database/` en orden:
   ```bash
   mysql -u root -p quindiostay < database/01_esquema.sql
   mysql -u root -p quindiostay < database/02_datos.sql
   ```

3. Arrancar el backend con el perfil `mysql`:
   ```bash
   SPRING_PROFILES_ACTIVE=mysql DB_USUARIO=root DB_CLAVE=tuClave ./mvnw spring-boot:run
   ```

   En Windows (PowerShell):
   ```powershell
   $env:SPRING_PROFILES_ACTIVE="mysql"
   $env:DB_USUARIO="root"
   $env:DB_CLAVE="tuClave"
   .\mvnw.cmd spring-boot:run
   ```

> **No se requieren cambios de código.** El perfil `mysql` usa `ddl-auto=validate`, por lo que Hibernate solo valida que las entidades coincidan con el esquema existente.

## 📋 Estado de implementación

### ✅ Funcionando

| Funcionalidad | Endpoint / Pantalla |
|---|---|
| Health check | `GET /api/health` |
| Login (Personal y Cliente) | `POST /api/auth/login` |
| Usuario actual | `GET /api/auth/me` |
| CRUD de salidas de tour | `GET/POST/PUT/DELETE /api/salidas` |
| Cancelar salida | `POST /api/salidas/{id}/cancelar` |
| Catálogos (tours, guías, idiomas) | `GET /api/tours, /api/guias, /api/idiomas` |
| Idiomas de un guía | `GET /api/guias/{id}/idiomas` |
| Reporte R5: Guías más salidas | `GET /api/reportes/guias-mas-salidas` |
| Pantalla de login | `/login` |
| CRUD de salidas (frontend) | `/salidas` |
| Reporte R5 (frontend) | `/reportes/guias-mas-salidas` |

### 🔲 Esqueleto (pendiente para Entrega 3)

| Funcionalidad | Estado |
|---|---|
| Reportes R1, R2, R3, R4, R6, R7, R8, R9, R10 | Endpoint devuelve 501 |
| Exportación a PDF | Clase esqueleto con OpenPDF |
| Reservas, Pagos, Participantes | Controlador/servicio TODO |
| Notificaciones | Controlador/servicio TODO |
| Planes, Prestadores, Clientes, Usuarios | Controlador/servicio TODO |
| Reglas de negocio RN01–RN17 | Métodos con comentario TODO |

## 🔧 Variables de entorno

| Variable | Descripción | Valor por defecto (solo desarrollo) |
|---|---|---|
| `JWT_SECRET` | Secreto para firma JWT (≥32 caracteres) | Valor de desarrollo incluido |
| `JWT_EXPIRACION` | Minutos de vida del token | 120 |
| `CORS_ORIGENES` | Orígenes CORS permitidos | http://localhost:4200 |
| `DB_URL` | URL JDBC de MySQL | jdbc:mysql://localhost:3306/quindiostay... |
| `DB_USUARIO` | Usuario de MySQL | root |
| `DB_CLAVE` | Contraseña de MySQL | _(vacía)_ |
| `SPRING_PROFILES_ACTIVE` | Perfil activo | h2 |

## 📝 Decisiones tomadas

1. **Perfiles de Spring**: `h2` como perfil por defecto (desarrollo sin MySQL), `mysql` para producción/integración.
2. **Naming strategy**: Se usa `CamelCaseToUnderscoresNamingStrategy` de Hibernate para convertir nombres de entidades a `snake_case` automáticamente.
3. **JWT**: Firma HS256 con secreto configurable. Token en `sessionStorage` del navegador.
4. **Mapper manual**: Se usa un mapper estático manual (`SalidaTourMapper`) en vez de MapStruct, como se especificó.
5. **Paginación**: Se usa `PaginaResponse<T>` como wrapper de `Page<T>` de Spring Data.
6. **Proxy**: El frontend usa un proxy (`proxy.conf.json`) para redirigir llamadas `/api` al backend en desarrollo.
7. **Tipografía**: Inter se carga localmente via `@fontsource/inter`, sin CDN.
8. **H2 en modo MySQL**: Para compatibilidad de tipos y funciones SQL.
9. **Seeder**: Datos de desarrollo solo activos con perfil `h2`; se eliminan al usar MySQL.
10. **SCSS puro**: Sin bibliotecas de componentes (Angular Material, Bootstrap, etc.).

## 🧪 Pruebas

```bash
# Backend
cd backend
./mvnw test

# Frontend
cd frontend
npm test
```

## 👥 Equipo

Universidad del Quindío — Bases de Datos I
