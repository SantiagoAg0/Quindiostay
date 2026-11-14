-- =============================================================================
-- QUINDÍOSTAY · Bases de Datos I 2026-2 · Universidad del Quindío · Grupo 02D
-- Script 01 · Esquema (DDL): creación de las 19 tablas con todas sus restricciones
-- Dominio 5: Tours y actividades locales
-- Motor: MySQL 8.0.16 o superior (InnoDB, utf8mb4). Se necesita 8.0.16+ porque
--        antes MySQL leía los CHECK pero no los hacía cumplir.
--
-- CÓMO EJECUTARLO (base limpia, de arriba abajo, sin errores):
--   1. En MySQL Workbench abrir este archivo y ejecutarlo completo (rayo).
--   2. Después ejecutar 02_datos.sql y por último 03_verificacion.sql.
--   Se puede volver a ejecutar las veces que se quiera: borra las tablas
--   (de hijas a padres) y las crea de nuevo.
--
-- DECISIONES DE ESTE SCRIPT
--   * Nombres de tablas y columnas en minúscula y con guion bajo
--     (salida_tour, id_salida): así coinciden con las entidades de Spring Boot
--     y funcionan igual en Windows y en Linux.
--   * Cada regla lleva nombre, como se vio en clase:
--       pk_tabla · uq_tabla_columna · ck_tabla_regla · fk_hija_padre
--   * Acciones al borrar (RESTRICT, CASCADE, SET NULL) según la Entrega 2.
--   * NO se usan triggers (indicación de la docente). Las reglas que necesitan
--     mirar otras tablas u otras filas (marcadas "APLICACIÓN" más abajo) se
--     validan en la capa de servicio de Spring Boot, y 03_verificacion.sql
--     comprueba que los datos las cumplen.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS quindiostay
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE quindiostay;
SET NAMES utf8mb4;

-- -----------------------------------------------------------------------------
-- 0. LIMPIEZA: borrar las tablas si existen, de hijas a padres
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS participante;
DROP TABLE IF EXISTS reserva_tour;
DROP TABLE IF EXISTS salida_tour;
DROP TABLE IF EXISTS guia_idioma;
DROP TABLE IF EXISTS notificacion;
DROP TABLE IF EXISTS pago;
DROP TABLE IF EXISTS reserva;
DROP TABLE IF EXISTS plan;
DROP TABLE IF EXISTS perfil_cliente;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS usuario_sistema;
DROP TABLE IF EXISTS tour;
DROP TABLE IF EXISTS categoria_tour;
DROP TABLE IF EXISTS guia;
DROP TABLE IF EXISTS idioma;
DROP TABLE IF EXISTS prestador;
DROP TABLE IF EXISTS rol;
DROP TABLE IF EXISTS tipo_prestador;
DROP TABLE IF EXISTS municipio;


-- =============================================================================
-- 1. NÚCLEO COMÚN
-- =============================================================================

-- Nivel 1 · tablas que no apuntan a nadie ------------------------------------

-- Municipio: los 12 municipios del Quindío. Ni el nombre ni el código DANE se repiten.
CREATE TABLE municipio (
  id_municipio  BIGINT       NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(40)  NOT NULL,
  codigo_dane   VARCHAR(5)   NOT NULL,
  CONSTRAINT pk_municipio        PRIMARY KEY (id_municipio),
  CONSTRAINT uq_municipio_nombre UNIQUE (nombre),
  CONSTRAINT uq_municipio_dane   UNIQUE (codigo_dane),
  CONSTRAINT ck_municipio_dane   CHECK (codigo_dane REGEXP '^63[0-9]{3}$')   -- 5 dígitos que empiezan por 63
) ENGINE=InnoDB COMMENT='Municipios del Quindío';

-- Tipo de prestador: catálogo cerrado de tipos de servicio turístico.
CREATE TABLE tipo_prestador (
  id_tipo_prestador  BIGINT       NOT NULL AUTO_INCREMENT,
  nombre             VARCHAR(30)  NOT NULL,
  CONSTRAINT pk_tipo_prestador        PRIMARY KEY (id_tipo_prestador),
  CONSTRAINT uq_tipo_prestador_nombre UNIQUE (nombre),
  CONSTRAINT ck_tipo_prestador_nombre CHECK (nombre IN ('ALOJAMIENTO','AGENCIA_VIAJES','TRANSPORTE','GASTRONOMIA',
                                                        'GUIANZA','ALQUILER_VEHICULOS','ATRACCION','OTROS'))
) ENGINE=InnoDB COMMENT='Catálogo de tipos de prestador';

-- Rol: roles de los usuarios internos (el cliente entra por su perfil, no por un rol).
CREATE TABLE rol (
  id_rol  BIGINT       NOT NULL AUTO_INCREMENT,
  nombre  VARCHAR(30)  NOT NULL,
  CONSTRAINT pk_rol        PRIMARY KEY (id_rol),
  CONSTRAINT uq_rol_nombre UNIQUE (nombre),
  CONSTRAINT ck_rol_nombre CHECK (nombre IN ('ADMINISTRADOR_PLATAFORMA','ENCARGADO_PRESTADOR','OPERADOR'))
) ENGINE=InnoDB COMMENT='Roles de usuarios internos';

-- Categoría de tour (módulo Tours): cultural, aventura, naturaleza, cafetero.
CREATE TABLE categoria_tour (
  id_categoria  BIGINT        NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(20)   NOT NULL,
  descripcion   VARCHAR(200)  NULL,
  CONSTRAINT pk_categoria_tour        PRIMARY KEY (id_categoria),
  CONSTRAINT uq_categoria_tour_nombre UNIQUE (nombre),
  CONSTRAINT ck_categoria_tour_nombre CHECK (nombre IN ('CULTURAL','AVENTURA','NATURALEZA','CAFETERO'))
) ENGINE=InnoDB COMMENT='Catálogo de categorías de tour';

-- Idioma (módulo Tours): catálogo de los cinco idiomas del enunciado.
CREATE TABLE idioma (
  id_idioma  BIGINT       NOT NULL AUTO_INCREMENT,
  nombre     VARCHAR(15)  NOT NULL,
  CONSTRAINT pk_idioma        PRIMARY KEY (id_idioma),
  CONSTRAINT uq_idioma_nombre UNIQUE (nombre),
  CONSTRAINT ck_idioma_nombre CHECK (nombre IN ('ESPAÑOL','INGLES','FRANCES','ALEMAN','PORTUGUES'))
) ENGINE=InnoDB COMMENT='Catálogo de idiomas';

-- Guía (módulo Tours): documento y tarjeta profesional no se repiten.
CREATE TABLE guia (
  id_guia              BIGINT        NOT NULL AUTO_INCREMENT,
  nombre               VARCHAR(100)  NOT NULL,
  documento            VARCHAR(20)   NOT NULL,
  tarjeta_profesional  VARCHAR(20)   NOT NULL,
  CONSTRAINT pk_guia                     PRIMARY KEY (id_guia),
  CONSTRAINT uq_guia_documento           UNIQUE (documento),
  CONSTRAINT uq_guia_tarjeta_profesional UNIQUE (tarjeta_profesional)
) ENGINE=InnoDB COMMENT='Guías de turismo';

-- Nivel 2 --------------------------------------------------------------------

-- Prestador: empresa o persona que ofrece servicios turísticos.
-- Un prestador RETIRADO no se borra: su historial de reservas se conserva.
CREATE TABLE prestador (
  id_prestador       BIGINT        NOT NULL AUTO_INCREMENT,
  nombre_comercial   VARCHAR(100)  NOT NULL,
  nit_documento      VARCHAR(20)   NOT NULL,
  rnt                VARCHAR(20)   NOT NULL,               -- Registro Nacional de Turismo
  direccion          VARCHAR(120)  NOT NULL,
  telefono           VARCHAR(10)   NOT NULL,
  correo             VARCHAR(100)  NOT NULL,
  estado             VARCHAR(12)   NOT NULL DEFAULT 'ACTIVO',
  id_municipio       BIGINT        NOT NULL,
  id_tipo_prestador  BIGINT        NOT NULL,
  CONSTRAINT pk_prestador          PRIMARY KEY (id_prestador),
  CONSTRAINT uq_prestador_nit      UNIQUE (nit_documento),
  CONSTRAINT ck_prestador_telefono CHECK (telefono REGEXP '^3[0-9]{9}$'),            -- 10 dígitos, empieza por 3
  CONSTRAINT ck_prestador_correo   CHECK (correo LIKE '_%@_%._%'),
  CONSTRAINT ck_prestador_estado   CHECK (estado IN ('ACTIVO','SUSPENDIDO','RETIRADO')),
  CONSTRAINT fk_prestador_municipio FOREIGN KEY (id_municipio)      REFERENCES municipio (id_municipio)           ON DELETE RESTRICT,
  CONSTRAINT fk_prestador_tipo      FOREIGN KEY (id_tipo_prestador) REFERENCES tipo_prestador (id_tipo_prestador) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Prestadores de servicios turísticos';

-- Cliente: el par (tipo_documento, numero_documento) identifica a la persona y el correo tampoco se repite.
CREATE TABLE cliente (
  id_cliente        BIGINT        NOT NULL AUTO_INCREMENT,
  nombres           VARCHAR(60)   NOT NULL,
  apellidos         VARCHAR(60)   NOT NULL,
  tipo_documento    VARCHAR(10)   NOT NULL,
  numero_documento  VARCHAR(20)   NOT NULL,
  correo            VARCHAR(100)  NOT NULL,
  telefono          VARCHAR(10)   NOT NULL,
  fecha_nacimiento  DATE          NOT NULL,
  ciudad_origen     VARCHAR(60)   NOT NULL,
  CONSTRAINT pk_cliente           PRIMARY KEY (id_cliente),
  CONSTRAINT uq_cliente_correo    UNIQUE (correo),
  CONSTRAINT uq_cliente_documento UNIQUE (tipo_documento, numero_documento),
  CONSTRAINT ck_cliente_tipo_doc  CHECK (tipo_documento IN ('CC','CE','PASAPORTE','TI')),
  CONSTRAINT ck_cliente_telefono  CHECK (telefono REGEXP '^3[0-9]{9}$'),
  CONSTRAINT ck_cliente_correo    CHECK (correo LIKE '_%@_%._%'),
  -- "Anterior a la fecha actual" no se puede escribir en un CHECK (CURRENT_DATE no es
  -- determinista); la comparación con hoy la hace la aplicación. Aquí se exige una fecha razonable.
  CONSTRAINT ck_cliente_nacimiento CHECK (fecha_nacimiento >= '1900-01-01')
) ENGINE=InnoDB COMMENT='Clientes registrados';

-- Nivel 3 --------------------------------------------------------------------

-- Usuario del sistema: personal interno. La contraseña se guarda cifrada con BCrypt.
-- APLICACIÓN (RN13): si el rol es ENCARGADO_PRESTADOR, id_prestador es obligatorio.
CREATE TABLE usuario_sistema (
  id_usuario          BIGINT       NOT NULL AUTO_INCREMENT,
  nombre_usuario      VARCHAR(30)  NOT NULL,
  contrasena_cifrada  VARCHAR(100) NOT NULL,
  estado              VARCHAR(10)  NOT NULL DEFAULT 'ACTIVO',
  id_rol              BIGINT       NOT NULL,
  id_prestador        BIGINT       NULL,
  CONSTRAINT pk_usuario_sistema        PRIMARY KEY (id_usuario),
  CONSTRAINT uq_usuario_nombre         UNIQUE (nombre_usuario),
  CONSTRAINT ck_usuario_estado         CHECK (estado IN ('ACTIVO','BLOQUEADO')),
  CONSTRAINT fk_usuario_rol            FOREIGN KEY (id_rol)       REFERENCES rol (id_rol)             ON DELETE RESTRICT,
  CONSTRAINT fk_usuario_prestador      FOREIGN KEY (id_prestador) REFERENCES prestador (id_prestador) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Usuarios internos del sistema';

-- Perfil del cliente: entidad débil. Su clave es la misma del cliente (PK y FK a la vez);
-- sin cliente no tiene sentido, por eso se borra con él (CASCADE).
CREATE TABLE perfil_cliente (
  id_cliente          BIGINT        NOT NULL,
  contrasena_cifrada  VARCHAR(100)  NOT NULL,
  idioma_preferido    VARCHAR(10)   NOT NULL,
  canal_preferido     VARCHAR(10)   NOT NULL,
  anticipacion_dias   SMALLINT      NOT NULL,
  acepta_promociones  VARCHAR(2)    NOT NULL,
  CONSTRAINT pk_perfil_cliente       PRIMARY KEY (id_cliente),
  CONSTRAINT ck_perfil_idioma        CHECK (idioma_preferido IN ('ESPAÑOL','INGLES')),
  CONSTRAINT ck_perfil_canal         CHECK (canal_preferido IN ('CORREO','SMS','WHATSAPP')),
  CONSTRAINT ck_perfil_anticipacion  CHECK (anticipacion_dias IN (1,3,7)),
  CONSTRAINT ck_perfil_promociones   CHECK (acepta_promociones IN ('SI','NO')),
  CONSTRAINT fk_perfil_cliente       FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Perfil y preferencias del cliente con cuenta';

-- Plan: cada prestador ofrece varios planes; dos planes del mismo prestador no se llaman igual.
-- Un plan que ya se vendió no se borra: se inactiva.
CREATE TABLE plan (
  id_plan       BIGINT         NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(80)    NOT NULL,
  descripcion   VARCHAR(300)   NOT NULL,
  tipo          VARCHAR(15)    NOT NULL,
  precio        DECIMAL(12,2)  NOT NULL,
  fecha_inicio  DATE           NOT NULL,
  fecha_fin     DATE           NOT NULL,
  estado        VARCHAR(10)    NOT NULL DEFAULT 'ACTIVO',
  id_prestador  BIGINT         NOT NULL,
  CONSTRAINT pk_plan                 PRIMARY KEY (id_plan),
  CONSTRAINT uq_plan_nombre_prestador UNIQUE (nombre, id_prestador),
  CONSTRAINT ck_plan_tipo            CHECK (tipo IN ('BASICO','ESTANDAR','PREMIUM','TODO_INCLUIDO')),
  CONSTRAINT ck_plan_precio          CHECK (precio > 0),
  CONSTRAINT ck_plan_fechas          CHECK (fecha_fin > fecha_inicio),
  CONSTRAINT ck_plan_estado          CHECK (estado IN ('ACTIVO','INACTIVO')),
  CONSTRAINT fk_plan_prestador       FOREIGN KEY (id_prestador) REFERENCES prestador (id_prestador) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Planes que ofrece cada prestador';

-- Nivel 4 --------------------------------------------------------------------

-- Reserva: compromiso de un cliente con un prestador para una fecha. Una reserva cancelada
-- no se borra (historial). APLICACIÓN: solo se reserva un plan vigente y activo en la fecha
-- del servicio; solo pasa a COMPLETADA si antes estuvo CONFIRMADA; reglas RN16 y RN17.
CREATE TABLE reserva (
  id_reserva      BIGINT         NOT NULL AUTO_INCREMENT,
  fecha_creacion  DATE           NOT NULL,
  fecha_servicio  DATE           NOT NULL,
  estado          VARCHAR(12)    NOT NULL DEFAULT 'PENDIENTE',
  valor_total     DECIMAL(12,2)  NOT NULL,
  canal           VARCHAR(25)    NOT NULL,
  id_cliente      BIGINT         NOT NULL,
  id_plan         BIGINT         NOT NULL,
  CONSTRAINT pk_reserva          PRIMARY KEY (id_reserva),
  CONSTRAINT ck_reserva_estado   CHECK (estado IN ('PENDIENTE','CONFIRMADA','CANCELADA','COMPLETADA')),
  CONSTRAINT ck_reserva_canal    CHECK (canal IN ('WEB','APP_MOVIL','TELEFONO','MOSTRADOR','AGENCIA_INTERMEDIARIA')),
  CONSTRAINT ck_reserva_valor    CHECK (valor_total > 0),
  CONSTRAINT ck_reserva_fechas   CHECK (fecha_servicio >= fecha_creacion),
  CONSTRAINT fk_reserva_cliente  FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente) ON DELETE RESTRICT,
  CONSTRAINT fk_reserva_plan     FOREIGN KEY (id_plan)    REFERENCES plan (id_plan)       ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Reservas del núcleo común';

-- Pago: una reserva se puede pagar en varios abonos. Los pagos con tarjeta o PSE traen la
-- referencia de la pasarela (no se repite); efectivo y transferencia no la llevan (RN09, solo fila).
-- Un reembolso se registra como un pago con estado REEMBOLSADO.
-- APLICACIÓN (RN10): REEMBOLSADO solo si la reserva está CANCELADA y lo reembolsado no supera lo pagado.
CREATE TABLE pago (
  id_pago                 BIGINT         NOT NULL AUTO_INCREMENT,
  fecha_pago              DATETIME       NOT NULL,
  monto                   DECIMAL(12,2)  NOT NULL,
  metodo                  VARCHAR(20)    NOT NULL,
  estado                  VARCHAR(12)    NOT NULL DEFAULT 'PENDIENTE',
  referencia_transaccion  VARCHAR(40)    NULL,
  id_reserva              BIGINT         NOT NULL,
  CONSTRAINT pk_pago            PRIMARY KEY (id_pago),
  CONSTRAINT uq_pago_referencia UNIQUE (referencia_transaccion),
  CONSTRAINT ck_pago_monto      CHECK (monto > 0),
  CONSTRAINT ck_pago_metodo     CHECK (metodo IN ('TARJETA_CREDITO','TARJETA_DEBITO','PSE','TRANSFERENCIA','EFECTIVO')),
  CONSTRAINT ck_pago_estado     CHECK (estado IN ('EXITOSO','FALLIDO','PENDIENTE','REEMBOLSADO')),
  CONSTRAINT ck_pago_referencia CHECK (   (metodo IN ('TARJETA_CREDITO','TARJETA_DEBITO','PSE') AND referencia_transaccion IS NOT NULL)
                                       OR (metodo IN ('TRANSFERENCIA','EFECTIVO')                AND referencia_transaccion IS NULL)),
  CONSTRAINT fk_pago_reserva    FOREIGN KEY (id_reserva) REFERENCES reserva (id_reserva) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Pagos y reembolsos de las reservas';

-- Notificación: recordatorios, confirmaciones, cambios de estado y promociones.
-- RN11 (solo fila): la promoción no lleva reserva; los demás tipos sí.
-- Acción al borrar la reserva: RESTRICT. Con SET NULL una notificación que no es promoción
-- quedaría sin reserva y violaría RN11 (además las reservas no se borran, se cancelan).
-- APLICACIÓN: RN12 (el cliente es el de la reserva), RN15 (fecha del recordatorio) y que
-- las promociones solo se envíen a clientes que las aceptaron.
CREATE TABLE notificacion (
  id_notificacion   BIGINT        NOT NULL AUTO_INCREMENT,
  tipo              VARCHAR(25)   NOT NULL,
  canal             VARCHAR(10)   NOT NULL,
  mensaje           VARCHAR(400)  NOT NULL,
  fecha_programada  DATE          NOT NULL,
  fecha_envio_real  DATE          NULL,
  estado            VARCHAR(10)   NOT NULL DEFAULT 'PENDIENTE',
  id_cliente        BIGINT        NOT NULL,
  id_reserva        BIGINT        NULL,
  CONSTRAINT pk_notificacion         PRIMARY KEY (id_notificacion),
  CONSTRAINT ck_notificacion_tipo    CHECK (tipo IN ('RECORDATORIO_RESERVA','CONFIRMACION_RESERVA','CONFIRMACION_PAGO','CAMBIO_ESTADO','PROMOCION')),
  CONSTRAINT ck_notificacion_canal   CHECK (canal IN ('CORREO','SMS','WHATSAPP')),
  CONSTRAINT ck_notificacion_estado  CHECK (estado IN ('PENDIENTE','ENVIADA','FALLIDA','LEIDA')),
  CONSTRAINT ck_notificacion_envio   CHECK (fecha_envio_real IS NULL OR fecha_envio_real >= fecha_programada),
  CONSTRAINT ck_notificacion_reserva CHECK (   (tipo = 'PROMOCION'  AND id_reserva IS NULL)
                                            OR (tipo <> 'PROMOCION' AND id_reserva IS NOT NULL)),
  CONSTRAINT fk_notificacion_cliente FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente) ON DELETE RESTRICT,
  CONSTRAINT fk_notificacion_reserva FOREIGN KEY (id_reserva) REFERENCES reserva (id_reserva) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Notificaciones al cliente';


-- =============================================================================
-- 2. MÓDULO TOURS Y ACTIVIDADES LOCALES
-- =============================================================================

-- Tour: lo publica un prestador. Edad mínima en años cumplidos; 0 = sin restricción.
-- APLICACIÓN (RN07): solo se programan salidas de tours cuyo prestador está ACTIVO.
CREATE TABLE tour (
  id_tour         BIGINT         NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(100)   NOT NULL,
  descripcion     VARCHAR(500)   NOT NULL,
  duracion_horas  DECIMAL(4,1)   NOT NULL,
  dificultad      VARCHAR(5)     NOT NULL,
  edad_minima     SMALLINT       NOT NULL DEFAULT 0,
  precio_persona  DECIMAL(12,2)  NOT NULL,
  id_categoria    BIGINT         NOT NULL,
  id_prestador    BIGINT         NOT NULL,
  CONSTRAINT pk_tour            PRIMARY KEY (id_tour),
  CONSTRAINT ck_tour_duracion   CHECK (duracion_horas > 0),
  CONSTRAINT ck_tour_dificultad CHECK (dificultad IN ('BAJA','MEDIA','ALTA')),
  CONSTRAINT ck_tour_edad       CHECK (edad_minima >= 0),
  CONSTRAINT ck_tour_precio     CHECK (precio_persona > 0),
  CONSTRAINT fk_tour_categoria  FOREIGN KEY (id_categoria) REFERENCES categoria_tour (id_categoria) ON DELETE RESTRICT,
  CONSTRAINT fk_tour_prestador  FOREIGN KEY (id_prestador) REFERENCES prestador (id_prestador)     ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Tours publicados por los prestadores';

-- Guía-Idioma: solución al atributo multivaluado "idiomas del guía" (relación N:M).
-- La clave primaria son las dos foráneas juntas: el mismo idioma no se repite para el mismo guía.
-- Si se borra el guía, sus filas se van con él (CASCADE); un idioma con guías no se borra (RESTRICT).
-- APLICACIÓN (RN08): todo guía habla al menos un idioma (participación total).
CREATE TABLE guia_idioma (
  id_guia    BIGINT  NOT NULL,
  id_idioma  BIGINT  NOT NULL,
  CONSTRAINT pk_guia_idioma        PRIMARY KEY (id_guia, id_idioma),
  CONSTRAINT fk_guia_idioma_guia   FOREIGN KEY (id_guia)   REFERENCES guia (id_guia)     ON DELETE CASCADE,
  CONSTRAINT fk_guia_idioma_idioma FOREIGN KEY (id_idioma) REFERENCES idioma (id_idioma) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Idiomas que habla cada guía';

-- Salida de tour: un tour que sale en una fecha y hora, con un guía, un idioma y un cupo.
-- La clave foránea COMPUESTA (id_guia, id_idioma) -> guia_idioma hace que la base misma garantice
-- que el guía habla el idioma de la salida. La clave alterna (id_guia, fecha, hora_inicio) impide
-- que un guía tenga dos salidas a la misma hora.
-- APLICACIÓN: el cruce de horarios completo (hora_fin = hora_inicio + duración del tour),
-- RN06 (REALIZADA solo desde PROGRAMADA y con fecha ya llegada) y que los participantes no superen el cupo.
CREATE TABLE salida_tour (
  id_salida    BIGINT       NOT NULL AUTO_INCREMENT,
  fecha        DATE         NOT NULL,
  hora_inicio  TIME         NOT NULL,
  cupo         SMALLINT     NOT NULL,
  estado       VARCHAR(12)  NOT NULL DEFAULT 'PROGRAMADA',
  id_tour      BIGINT       NOT NULL,
  id_guia      BIGINT       NOT NULL,
  id_idioma    BIGINT       NOT NULL,
  CONSTRAINT pk_salida_tour          PRIMARY KEY (id_salida),
  CONSTRAINT uq_salida_guia_horario  UNIQUE (id_guia, fecha, hora_inicio),
  CONSTRAINT ck_salida_cupo          CHECK (cupo > 0),
  CONSTRAINT ck_salida_estado        CHECK (estado IN ('PROGRAMADA','REALIZADA','CANCELADA')),
  CONSTRAINT fk_salida_tour          FOREIGN KEY (id_tour)             REFERENCES tour (id_tour)                      ON DELETE RESTRICT,
  CONSTRAINT fk_salida_guia_idioma   FOREIGN KEY (id_guia, id_idioma)  REFERENCES guia_idioma (id_guia, id_idioma)    ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Salidas programadas de cada tour';

-- Reserva de tour: subtipo de Reserva (jerarquía con padre y una tabla por subtipo). Su clave es la
-- misma de la reserva (PK y FK a la vez) y se borra con ella (CASCADE). Una reserva apunta a una sola
-- salida (RN03); la salida no se borra si tiene reservas (RESTRICT, historial de ocupación).
-- APLICACIÓN: RN01 (fecha_servicio = fecha de la salida), RN02 (el plan es del prestador del tour),
-- RN04 (la salida está PROGRAMADA al reservar).
CREATE TABLE reserva_tour (
  id_reserva               BIGINT         NOT NULL,
  id_salida                BIGINT         NOT NULL,
  precio_persona_aplicado  DECIMAL(12,2)  NOT NULL,
  CONSTRAINT pk_reserva_tour        PRIMARY KEY (id_reserva),
  CONSTRAINT ck_reserva_tour_precio CHECK (precio_persona_aplicado > 0),
  CONSTRAINT fk_reserva_tour_reserva FOREIGN KEY (id_reserva) REFERENCES reserva (id_reserva)      ON DELETE CASCADE,
  CONSTRAINT fk_reserva_tour_salida  FOREIGN KEY (id_salida)  REFERENCES salida_tour (id_salida)   ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Detalle de las reservas de tours (subtipo de reserva)';

-- Participante: cada persona que va a la salida, con su edad. No se borra con la reserva (RESTRICT, historial).
-- APLICACIÓN: edad >= edad mínima del tour, participantes de la salida <= cupo y (RN14) si hay un
-- menor de 18 debe haber un adulto en la misma reserva.
CREATE TABLE participante (
  id_participante  BIGINT        NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(100)  NOT NULL,
  edad             SMALLINT      NOT NULL,
  id_reserva       BIGINT        NOT NULL,
  CONSTRAINT pk_participante       PRIMARY KEY (id_participante),
  CONSTRAINT ck_participante_edad  CHECK (edad BETWEEN 0 AND 120),
  CONSTRAINT fk_participante_reserva_tour FOREIGN KEY (id_reserva) REFERENCES reserva_tour (id_reserva) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Participantes de cada reserva de tour';

-- Fin del esquema: 19 tablas.
