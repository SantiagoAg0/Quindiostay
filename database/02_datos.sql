-- =============================================================================
-- PROYECTO: QuindíoStay — Bases de Datos I (Universidad del Quindío)
-- ARCHIVO:  02_datos.sql
-- MOTOR:    MySQL 8.0+
-- NOTA:     Datos semilla iniciales para desarrollo y evaluación académica.
--           Credenciales de prueba:
--             - admin / Admin123*
--             - operador / Operador123*
--             - cliente@correo.com / Cliente123*
-- =============================================================================

USE quindiostay;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. ROLES DEL SISTEMA
INSERT INTO rol (id_rol, nombre) VALUES
(1, 'ADMINISTRADOR_PLATAFORMA'),
(2, 'ENCARGADO_PRESTADOR'),
(3, 'OPERADOR');

-- 2. MUNICIPIOS DEL QUINDÍO (12 municipios con código DANE oficial)
INSERT INTO municipio (id_municipio, nombre, codigo_dane) VALUES
(1, 'Armenia', '63001'),
(2, 'Buenavista', '63111'),
(3, 'Calarcá', '63130'),
(4, 'Circasia', '63190'),
(5, 'Córdoba', '63212'),
(6, 'Filandia', '63272'),
(7, 'Génova', '63302'),
(8, 'La Tebaida', '63401'),
(9, 'Montenegro', '63470'),
(10, 'Pijao', '63548'),
(11, 'Quimbaya', '63594'),
(12, 'Salento', '63690');

-- 3. TIPOS DE PRESTADOR TURÍSTICO
INSERT INTO tipo_prestador (id_tipo_prestador, nombre) VALUES
(1, 'AGENCIA_VIAJES_Y_TURISMO'),
(2, 'AGENCIA_OPERADORA'),
(3, 'AGENCIA_VIAJES_MAYORISTA'),
(4, 'ESTABLECIMIENTO_ALOJAMIENTO'),
(5, 'GUIA_DE_TURISMO'),
(6, 'OPERADOR_PROFESIONAL_CONGRESOS'),
(7, 'ARRENDADOR_VEHICULOS'),
(8, 'EMPRESA_TRANSPORTE_TERRESTRE');

-- 4. PRESTADOR PILOTO
INSERT INTO prestador (id_prestador, nombre_comercial, nit_documento, rnt, direccion, telefono, correo, estado, id_municipio, id_tipo_prestador) VALUES
(1, 'Aventuras del Café SAS', '900123456-7', 'RNT-45892', 'Calle Real # 4-12', '3104567890', 'contacto@aventurasdelcafe.com', 'ACTIVO', 12, 2);

-- 5. USUARIOS DEL SISTEMA (BCrypt passwords: Admin123*, Operador123*)
INSERT INTO usuario_sistema (id_usuario, nombre_usuario, contrasena_cifrada, estado, id_rol, id_prestador) VALUES
(1, 'admin', '$2a$10$yRShBf/shiRcg7smNS41teHBL8pmRobWTEkMdMuawpynrI8/YarV2', 'ACTIVO', 1, NULL),
(2, 'operador', '$2a$10$pBo2MNTNNRl4wTW1GQjwoeF06vNrz32YSGCzbfH2XPoBeI7FeLyiG', 'ACTIVO', 3, NULL);

-- 6. CLIENTE Y PERFIL CLIENTE (Password: Cliente123*)
INSERT INTO cliente (id_cliente, nombres, apellidos, tipo_documento, numero_documento, correo, telefono, fecha_nacimiento, ciudad_origen) VALUES
(1, 'Alejandro', 'Gómez Jaramillo', 'CEDULA_CIUDADANIA', '1094900123', 'cliente@correo.com', '3157894512', '1995-06-15', 'Bogotá D.C.');

INSERT INTO perfil_cliente (id_cliente, contrasena_cifrada, idioma_preferido, canal_preferido, anticipacion_dias, acepta_promociones) VALUES
(1, '$2a$10$8q5GG.IBGeUQY4.I3cTKyuv/MY2O4utR4vFj/10JT7RdP437xRsMi', 'ESPANOL', 'CORREO_ELECTRONICO', 3, 'SI');

-- 7. CATEGORÍAS DE TOURS
INSERT INTO categoria_tour (id_categoria, nombre, descripcion) VALUES
(1, 'CULTURAL', 'Tours de patrimonio histórico, arquitectura y tradiciones cafeteras'),
(2, 'AVENTURA', 'Senderismo, cabalgatas, canopy y travesías de alta montaña'),
(3, 'NATURALEZA', 'Avistamiento de aves, flora nativa y bosques de niebla'),
(4, 'GASTRONOMICO', 'Catas de café especial y gastronomía tradicional quindiana');

-- 8. IDIOMAS DISPONIBLES
INSERT INTO idioma (id_idioma, nombre) VALUES
(1, 'ESPANOL'),
(2, 'INGLES'),
(3, 'FRANCES'),
(4, 'ALEMAN'),
(5, 'PORTUGUES');

-- 9. GUÍAS TURÍSTICOS
INSERT INTO guia (id_guia, nombre, documento, tarjeta_profesional) VALUES
(1, 'Carlos Alberto Mendoza', '1094888101', 'TP-GUI-00142'),
(2, 'María Paula Restrepo', '1094888102', 'TP-GUI-00143'),
(3, 'Juan David Gómez', '1094888103', 'TP-GUI-00144'),
(4, 'Laura Sofía Morales', '1094888104', 'TP-GUI-00145');

-- 10. GUÍA - IDIOMAS QUE HABLAN
INSERT INTO guia_idioma (id_guia, id_idioma) VALUES
(1, 1), -- Carlos habla Español
(1, 2), -- Carlos habla Inglés
(2, 1), -- María habla Español
(2, 2), -- María habla Inglés
(2, 3), -- María habla Francés
(3, 1), -- Juan habla Español
(3, 4), -- Juan habla Alemán
(4, 1), -- Laura habla Español
(4, 2), -- Laura habla Inglés
(4, 5); -- Laura habla Portugués

-- 11. TOURS DISPONIBLES
INSERT INTO tour (id_tour, nombre, descripcion, duracion_horas, dificultad, edad_minima, precio_persona, id_categoria, id_prestador) VALUES
(1, 'Senderismo Valle de Cocora y Bosque de Palmas', 'Caminata guiada entre las palmas de cera más altas del mundo, miradores panorámicos y reserva natural.', 4.5, 'MODERADA', 8, 85000.00, 3, 1),
(2, 'Recorrido Cafetero Tradicional en Jeep Willys', 'Inmersión completa en finca cafetera de tradición: cosecha, despulpe, secado y cata de café especial.', 3.0, 'BAJA', 5, 120000.00, 1, 1),
(3, 'Travesía Cañón del Río Barbas y Monos Aulladores', 'Ruta de aventura y conservación por los relictos boscosos de Filandia con observación de fauna silvestre.', 5.0, 'ALTA', 12, 140000.00, 2, 1);

-- 12. SALIDAS DE TOUR (Próximas, en curso y pasadas)
INSERT INTO salida_tour (id_salida, fecha, hora_inicio, cupo, estado, id_tour, id_guia, id_idioma) VALUES
(1, CURRENT_DATE + INTERVAL 1 DAY, '08:00:00', 12, 'PROGRAMADA', 1, 1, 1),
(2, CURRENT_DATE + INTERVAL 2 DAY, '09:30:00', 15, 'PROGRAMADA', 2, 2, 2),
(3, CURRENT_DATE + INTERVAL 3 DAY, '07:00:00', 10, 'PROGRAMADA', 3, 3, 1),
(4, CURRENT_DATE + INTERVAL 4 DAY, '14:00:00', 12, 'PROGRAMADA', 1, 2, 3),
(5, CURRENT_DATE + INTERVAL 5 DAY, '08:30:00', 15, 'PROGRAMADA', 2, 4, 1),
(6, CURRENT_DATE + INTERVAL 6 DAY, '09:00:00', 12, 'PROGRAMADA', 1, 4, 5),
(7, CURRENT_DATE - INTERVAL 2 DAY, '08:00:00', 12, 'REALIZADA',  1, 1, 1),
(8, CURRENT_DATE - INTERVAL 1 DAY, '10:00:00', 10, 'CANCELADA',  2, 3, 4);

SET FOREIGN_KEY_CHECKS = 1;
