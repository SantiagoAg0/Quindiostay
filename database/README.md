# Base de datos — QuindíoStay

Scripts SQL oficiales para MySQL 8.0+ (InnoDB, utf8mb4):

1. **`01_esquema.sql`**: Creación de la base de datos `quindiostay` y las 19 tablas relacionales con sus llaves primarias, foráneas, restricciones únicas e índices.
2. **`02_datos.sql`**: Inserción de datos semilla iniciales (roles, 12 municipios del Quindío con código DANE, tipos de prestador, categorías de tour, idiomas, guías, tours, asociaciones guía-idioma y 8 salidas de tour). Incluye usuarios con contraseñas encriptadas con BCrypt:
   - `admin` / `Admin123*`
   - `operador` / `Operador123*`
   - `cliente@correo.com` / `Cliente123*`

---

## 🛠️ Ejecución de los scripts en MySQL

### Desde MySQL Workbench o DBeaver
1. Abre tu cliente SQL conectado a tu servidor MySQL local.
2. Abre y ejecuta primero: **`01_esquema.sql`**.
3. Abre y ejecuta después: **`02_datos.sql`**.

### Desde línea de comandos (Terminal / PowerShell)
```bash
# Crear usuario de base de datos si aún no existe
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'quindiostay_app'@'localhost' IDENTIFIED BY 'tu_password'; GRANT ALL PRIVILEGES ON quindiostay.* TO 'quindiostay_app'@'localhost'; FLUSH PRIVILEGES;"

# Ejecutar los scripts
mysql -u quindiostay_app -p quindiostay < 01_esquema.sql
mysql -u quindiostay_app -p quindiostay < 02_datos.sql
```

---

## ⚙️ Conexión desde el Backend Spring Boot

Con la base de datos creada, el backend se conecta con `spring.jpa.hibernate.ddl-auto=none`, lo que garantiza que **Hibernate NUNCA crea, modifica ni elimina tablas**.

Para iniciar el backend apuntando a MySQL:

### En IntelliJ IDEA
1. **Run > Edit Configurations...** > `QuindioStayApplication`.
2. **Active profiles**: `mysql`.
3. **Environment variables**: `DB_PASSWORD=tu_password` (la clave de tu usuario MySQL).
4. Dale a **Run**.

### Por consola (PowerShell)
```powershell
$env:DB_PASSWORD="tu_password"
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
```
