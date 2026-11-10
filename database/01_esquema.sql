-- =============================================================================
-- PROYECTO: QuindíoStay — Bases de Datos I (Universidad del Quindío)
-- ARCHIVO:  01_esquema.sql
-- MOTOR:    MySQL 8.0+ (InnoDB, utf8mb4)
-- NOTA:     Este script crea el esquema relacional exacto que mapean las entidades
--           JPA de Spring Boot con spring.jpa.hibernate.ddl-auto=none.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS quindiostay
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE quindiostay;

-- Desactivar temporalmente revisión de FKs para creación ordenada
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. TABLAS DEL NÚCLEO COMÚN
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS notificacion;
DROP TABLE IF EXISTS pago;
DROP TABLE IF EXISTS participante;
DROP TABLE IF EXISTS reserva_tour;
DROP TABLE IF EXISTS reserva;
DROP TABLE IF EXISTS plan;
DROP TABLE IF EXISTS perfil_cliente;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS usuario_sistema;
DROP TABLE IF EXISTS rol;
DROP TABLE IF EXISTS prestador;
DROP TABLE IF EXISTS tipo_prestador;
DROP TABLE IF EXISTS municipio;

-- 1.1 Municipio
CREATE TABLE municipio (
    id_municipio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(40) NOT NULL UNIQUE,
    codigo_dane VARCHAR(5) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.2 Tipo de Prestador
CREATE TABLE tipo_prestador (
    id_tipo_prestador INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.3 Prestador
CREATE TABLE prestador (
    id_prestador BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_comercial VARCHAR(100) NOT NULL,
    nit_documento VARCHAR(20) NOT NULL UNIQUE,
    rnt VARCHAR(20),
    direccion VARCHAR(120),
    telefono VARCHAR(10),
    correo VARCHAR(100),
    estado VARCHAR(30) NOT NULL,
    id_municipio INT NOT NULL,
    id_tipo_prestador INT NOT NULL,
    CONSTRAINT fk_prestador_municipio FOREIGN KEY (id_municipio) REFERENCES municipio (id_municipio),
    CONSTRAINT fk_prestador_tipo FOREIGN KEY (id_tipo_prestador) REFERENCES tipo_prestador (id_tipo_prestador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.4 Rol
CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.5 Usuario del Sistema (Personal)
CREATE TABLE usuario_sistema (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(30) NOT NULL UNIQUE,
    contrasena_cifrada VARCHAR(100) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    id_rol INT NOT NULL,
    id_prestador BIGINT NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol (id_rol),
    CONSTRAINT fk_usuario_prestador FOREIGN KEY (id_prestador) REFERENCES prestador (id_prestador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.6 Cliente
CREATE TABLE cliente (
    id_cliente BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(60) NOT NULL,
    apellidos VARCHAR(60) NOT NULL,
    tipo_documento VARCHAR(30) NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(10),
    fecha_nacimiento DATE,
    ciudad_origen VARCHAR(60),
    CONSTRAINT uq_cliente_documento UNIQUE (tipo_documento, numero_documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.7 Perfil Cliente (Entidad débil: PK compartida con Cliente)
CREATE TABLE perfil_cliente (
    id_cliente BIGINT PRIMARY KEY,
    contrasena_cifrada VARCHAR(100) NOT NULL,
    idioma_preferido VARCHAR(30),
    canal_preferido VARCHAR(30),
    anticipacion_dias SMALLINT,
    acepta_promociones VARCHAR(10),
    CONSTRAINT fk_perfil_cliente FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.8 Plan
CREATE TABLE plan (
    id_plan BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion VARCHAR(300),
    tipo VARCHAR(30) NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(30) NOT NULL,
    id_prestador BIGINT NOT NULL,
    CONSTRAINT fk_plan_prestador FOREIGN KEY (id_prestador) REFERENCES prestador (id_prestador),
    CONSTRAINT uq_plan_nombre_prestador UNIQUE (nombre, id_prestador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.9 Reserva
CREATE TABLE reserva (
    id_reserva BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_creacion DATE NOT NULL,
    fecha_servicio DATE NOT NULL,
    estado VARCHAR(30) NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    canal VARCHAR(30) NOT NULL,
    id_cliente BIGINT NOT NULL,
    id_plan BIGINT NOT NULL,
    CONSTRAINT fk_reserva_cliente FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente),
    CONSTRAINT fk_reserva_plan FOREIGN KEY (id_plan) REFERENCES plan (id_plan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.10 Pago
CREATE TABLE pago (
    id_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_pago DATETIME NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    metodo VARCHAR(30) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    referencia_transaccion VARCHAR(40) UNIQUE,
    id_reserva BIGINT NOT NULL,
    CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES reserva (id_reserva)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.11 Notificación
CREATE TABLE notificacion (
    id_notificacion BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL,
    canal VARCHAR(30) NOT NULL,
    mensaje VARCHAR(400) NOT NULL,
    fecha_programada DATE NOT NULL,
    fecha_envio_real DATE,
    estado VARCHAR(30) NOT NULL,
    id_cliente BIGINT NOT NULL,
    id_reserva BIGINT NULL,
    CONSTRAINT fk_notif_cliente FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente),
    CONSTRAINT fk_notif_reserva FOREIGN KEY (id_reserva) REFERENCES reserva (id_reserva)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. TABLAS DEL DOMINIO: TOURS Y ACTIVIDADES LOCALES
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS salida_tour;
DROP TABLE IF EXISTS guia_idioma;
DROP TABLE IF EXISTS idioma;
DROP TABLE IF EXISTS guia;
DROP TABLE IF EXISTS tour;
DROP TABLE IF EXISTS categoria_tour;

-- 2.1 Categoría de Tour
CREATE TABLE categoria_tour (
    id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 Tour
CREATE TABLE tour (
    id_tour BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    duracion_horas DECIMAL(4,1) NOT NULL,
    dificultad VARCHAR(30) NOT NULL,
    edad_minima SMALLINT NOT NULL DEFAULT 0,
    precio_persona DECIMAL(12,2) NOT NULL,
    id_categoria BIGINT NOT NULL,
    id_prestador BIGINT NOT NULL,
    CONSTRAINT fk_tour_categoria FOREIGN KEY (id_categoria) REFERENCES categoria_tour (id_categoria),
    CONSTRAINT fk_tour_prestador FOREIGN KEY (id_prestador) REFERENCES prestador (id_prestador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.3 Guía
CREATE TABLE guia (
    id_guia BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE,
    tarjeta_profesional VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.4 Idioma
CREATE TABLE idioma (
    id_idioma BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.5 Guía-Idioma (Muchos a Muchos con PK compuesta)
CREATE TABLE guia_idioma (
    id_guia BIGINT NOT NULL,
    id_idioma BIGINT NOT NULL,
    PRIMARY KEY (id_guia, id_idioma),
    CONSTRAINT fk_guia_idioma_guia FOREIGN KEY (id_guia) REFERENCES guia (id_guia),
    CONSTRAINT fk_guia_idioma_idioma FOREIGN KEY (id_idioma) REFERENCES idioma (id_idioma)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.6 Salida de Tour (FK compuesta a guia_idioma)
CREATE TABLE salida_tour (
    id_salida BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    cupo SMALLINT NOT NULL,
    estado VARCHAR(30) NOT NULL,
    id_tour BIGINT NOT NULL,
    id_guia BIGINT NOT NULL,
    id_idioma BIGINT NOT NULL,
    CONSTRAINT fk_salida_tour FOREIGN KEY (id_tour) REFERENCES tour (id_tour),
    CONSTRAINT fk_salida_guia_idioma FOREIGN KEY (id_guia, id_idioma) REFERENCES guia_idioma (id_guia, id_idioma),
    CONSTRAINT uq_salida_guia_horario UNIQUE (id_guia, fecha, hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.7 Reserva de Tour (Subtipo de Reserva: PK compartida con reserva)
CREATE TABLE reserva_tour (
    id_reserva BIGINT PRIMARY KEY,
    id_salida BIGINT NOT NULL,
    precio_persona_aplicado DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_reserva_tour_reserva FOREIGN KEY (id_reserva) REFERENCES reserva (id_reserva) ON DELETE CASCADE,
    CONSTRAINT fk_reserva_tour_salida FOREIGN KEY (id_salida) REFERENCES salida_tour (id_salida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.8 Participante
CREATE TABLE participante (
    id_participante BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    edad SMALLINT NOT NULL,
    id_reserva BIGINT NOT NULL,
    CONSTRAINT fk_participante_reserva_tour FOREIGN KEY (id_reserva) REFERENCES reserva_tour (id_reserva) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reactivar revisión de FKs
SET FOREIGN_KEY_CHECKS = 1;
