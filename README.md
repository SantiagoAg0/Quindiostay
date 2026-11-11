# QuindioStay -- Plataforma de Turismo del Quindio

> **Dominio 5: Tours y actividades locales**
> Proyecto Final -- Bases de Datos I, Universidad del Quindio, 2026-2

## Descripcion del Proyecto

QuindioStay es una plataforma integral para la gestion de tours turisticos, guianza certificada y experiencias turísticas en el departamento del Quindio, Colombia. Permite administrar prestadores de servicios turisticos, programar salidas de tour, gestionar reservas con poliza de participantes, procesar pagos parciales y generar reportes operativos.

## Stack Tecnologico

| Componente | Tecnologia |
|---|---|
| Backend | Spring Boot 3.3.5 (Java 21, Maven) |
| Base de Datos | MySQL 8.0 (puerto 3307) |
| Frontend | Angular 19 (TypeScript, SCSS, Standalone Components) |
| Autenticacion | JWT (HS256) |

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
└── database/            Scripts SQL
```

## Configuracion de Base de Datos (MySQL)

1. Crear la base de datos en MySQL (puerto 3307):
   ```sql
   CREATE DATABASE quindiostay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Ejecutar los scripts SQL de la carpeta `database/` en orden numerico.

3. Las credenciales por defecto de MySQL para desarrollo:
   - Host: `localhost`
   - Puerto: `3307`
   - Base de datos: `quindiostay`
   - Usuario: `root`
   - Contrasena: `santiago123`

## Arranque del Proyecto

### Backend (puerto 8080)

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

## Credenciales de Prueba

### Personal Interno (tipo de ingreso: PERSONAL)

| Usuario | Contrasena | Rol | Permisos |
|---|---|---|---|
| `admin` | `Admin123*` | ADMINISTRADOR_PLATAFORMA | Acceso total: tours, salidas, reservas, pagos, prestadores, planes, guias, clientes, usuarios, reportes |
| `operador` | `Operador123*` | OPERADOR | Operacion: tours, salidas, reservas, pagos, guias, clientes, reportes |
| `encargado` | `Encargado123*` | ENCARGADO_PRESTADOR | Gestion de prestador: tours, salidas, reservas, pagos, guias, prestadores, planes, reportes |

### Clientes / Viajeros (tipo de ingreso: CLIENTE)

| Correo | Contrasena | Rol | Permisos |
|---|---|---|---|
| `cliente@correo.com` | `Cliente123*` | CLIENTE | Consultar tours, salidas disponibles, mis reservas, mis pagos, mi perfil, notificaciones |
| `camila.torres@correo.com` | `Cliente123*` | CLIENTE | Mismos permisos de cliente |
| `carlos.ramirez@correo.com` | `Cliente123*` | CLIENTE | Mismos permisos de cliente |

## Funcionalidades Implementadas

### Modulos Completos

| Modulo | Descripcion |
|---|---|
| Autenticacion | Login de personal interno y clientes, registro de clientes, JWT, guardias de ruta por rol |
| Tours | CRUD de tours con categoria, dificultad, precio, prestador operador |
| Salidas de Tour | Programacion de salidas con guia, idioma, cupo, fecha/hora; cancelacion |
| Reservas | Creacion con participantes (RN06), calculo automatico (RN01), cancelacion con politica (RN05) |
| Pagos | Registro de pagos parciales, multiples metodos, historial de transacciones |
| Prestadores | CRUD de prestadores turisticos con RNT, municipio, tipo |
| Planes | CRUD de planes de servicio (basico, estandar, premium, todo incluido) |
| Guias | CRUD de guias turisticos con idiomas certificados |
| Clientes | Directorio de clientes (admin/operador), perfil de preferencias |
| Usuarios | Gestion de usuarios internos del sistema (solo admin) |
| Notificaciones | Sistema de notificaciones por canal preferido |
| Reportes | Reporte R5: guias con mas salidas; indice de reportes |
| Dashboard | Panel principal con metricas segun rol |

### Reglas de Negocio Implementadas

| Regla | Descripcion |
|---|---|
| RN01 | Calculo automatico: valorTotal = precioPersona x cantidadParticipantes |
| RN05 | Politica de cancelacion con reembolsos segun dias de anticipacion |
| RN06 | Si hay menores de 18, debe haber al menos un adulto responsable |
| RN13 | Encargado de prestador requiere prestador asignado |

### Control de Acceso por Rol

| Funcionalidad | Admin | Operador | Encargado | Cliente |
|---|---|---|---|---|
| Panel Principal | Si | Si | Si | Si |
| Catalogo de Tours | Si (CRUD) | Si (CRUD) | Si (CRUD) | Si (solo lectura) |
| Salidas de Tour | Si (CRUD) | Si (CRUD) | Si (CRUD) | Si (solo lectura) |
| Reservas | Si (todas) | Si (todas) | Si (todas) | Si (solo propias) |
| Pagos | Si (todos) | Si (todos) | Si (todos) | Si (solo propios) |
| Prestadores | Si (CRUD) | No | Si (CRUD) | No |
| Planes | Si (CRUD) | No | Si (CRUD) | No |
| Guias | Si (CRUD) | Si (CRUD) | Si (CRUD) | No |
| Directorio Clientes | Si | Si | No | No |
| Usuarios Internos | Si (CRUD) | No | No | No |
| Reportes | Si | Si | Si | No |
| Mi Perfil | No | No | No | Si |

## Variables de Entorno

| Variable | Descripcion | Valor por defecto |
|---|---|---|
| `SPRING_DATASOURCE_URL` | URL JDBC de MySQL | jdbc:mysql://localhost:3307/quindiostay... |
| `SPRING_DATASOURCE_USERNAME` | Usuario MySQL | root |
| `SPRING_DATASOURCE_PASSWORD` | Contrasena MySQL | santiago123 |
| `JWT_SECRET` | Secreto para firma JWT (>=32 caracteres) | Valor de desarrollo incluido |
| `JWT_EXPIRACION` | Minutos de vida del token | 120 |
| `CORS_ORIGENES` | Origenes CORS permitidos | http://localhost:4200 |

## Decisiones Tecnicas

1. **Base de datos MySQL**: Exclusivamente MySQL 8.0. No se usa H2 ni base de datos en memoria.
2. **Naming strategy**: `CamelCaseToUnderscoresNamingStrategy` de Hibernate para snake_case automatico.
3. **JWT**: Firma HS256. Token almacenado en `sessionStorage` del navegador.
4. **Mapper manual**: Se usa mapper estatico manual en vez de MapStruct.
5. **Paginacion**: `PaginaResponse<T>` como wrapper de `Page<T>` de Spring Data.
6. **Proxy**: El frontend usa `proxy.conf.json` para redirigir `/api` al backend en desarrollo.
7. **SCSS puro**: Sin bibliotecas de componentes externos (sin Bootstrap, sin Angular Material).
8. **Standalone Components**: Angular 19 con componentes standalone, sin NgModules.

## Pruebas

```bash
# Backend
cd backend
.\mvnw.cmd test

# Frontend
cd frontend
npm test
```

## Equipo

Universidad del Quindio -- Bases de Datos I, 2026-2
