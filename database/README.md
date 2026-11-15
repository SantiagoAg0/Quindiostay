# Base de datos — QuindíoStay (Entrega 3)

Scripts SQL oficiales para MySQL 8.0.16+ (InnoDB, utf8mb4):

1. **`01_esquema.sql`**: Creación de la base de datos `quindiostay` y las 19 tablas relacionales con PK, FK, UNIQUE, CHECK y NOT NULL sin triggers.
2. **`02_datos.sql`**: Inserción de los datos completos del dominio con usuarios de prueba con contraseñas cifradas en BCrypt.
3. **`03_verificacion.sql`**: Verificación de conteos mínimos y reglas de negocio de aplicación (todas deben dar 0 violaciones).
4. **`04_reportes.sql`**: Las 10 consultas SQL oficiales de los reportes R1–R10 (simples, intermedias y avanzadas con subconsultas).

---

## Ejecución de los scripts en MySQL

### Desde MySQL Workbench
1. Abre tu conexión MySQL 8.0 local.
2. Ejecuta en orden secuencial estricto:
   - `01_esquema.sql` (crea y limpia la base `quindiostay` y sus 19 tablas)
   - `02_datos.sql` (carga de datos del sistema)
   - `03_verificacion.sql` (comprobación: todos los conteos OK y 0 violaciones)
   - `04_reportes.sql` (pruebas de los 10 reportes analíticos)

### Desde línea de comandos (PowerShell / Bash)
```powershell
& "mysql" -u root -p -P 3307 -h 127.0.0.1 --default-character-set=utf8mb4 < 01_esquema.sql
& "mysql" -u root -p -P 3307 -h 127.0.0.1 --default-character-set=utf8mb4 < 02_datos.sql
& "mysql" -u root -p -P 3307 -h 127.0.0.1 --default-character-set=utf8mb4 < 03_verificacion.sql
```

---

## Conexión desde el Backend Spring Boot

El backend utiliza exclusivamente el perfil `mysql` con `spring.jpa.hibernate.ddl-auto=validate`, lo que garantiza que **Hibernate valida estrictamente la consistencia entre las entidades JPA y el esquema SQL existente sin alterar la estructura**.

---

## Cuentas y Credenciales de Prueba (Entorno Académico / Local)

Las contraseñas de las cuentas preconfiguradas en `02_datos.sql` se encuentran cifradas con BCrypt. Para el inicio de sesión en entorno local de pruebas:

| Rol | Usuario de Prueba | Contraseña de Prueba |
|---|---|---|
| `ADMINISTRADOR_PLATAFORMA` | `admin` | `Admin123*` |
| `OPERADOR` | `operador`, `operador2` | `Operador123*` |
| `ENCARGADO_PRESTADOR` | `enc_cocora`, `enc_viajescafe`, `enc_rutas`, `enc_quindioexp` | `Prestador123*` |
| `CLIENTE` | `carlos.fernandez@yahoo.com`, `emily.johnson@hotmail.com`, `lucas.muller@gmail.com` | `Cliente123*` |

