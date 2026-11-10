-- =============================================================================
-- PROYECTO: QuindíoStay — Bases de Datos I (Universidad del Quindío)
-- ARCHIVO:  03_seed_datos_completos.sql
-- MOTOR:    MySQL 8.0+
-- NOTA:     Datos completos para los 10 reportes, gráficos y todos los CRUDs.
-- =============================================================================

USE quindiostay;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. PRESTADORES ADICIONALES (En varios municipios del Quindío)
INSERT IGNORE INTO prestador (id_prestador, nombre_comercial, nit_documento, rnt, direccion, telefono, correo, estado, id_municipio, id_tipo_prestador) VALUES
(2, 'EcoRutas Filandia', '900234567-1', 'RNT-56123', 'Cra 6 # 7-18, Filandia', '3114561234', 'info@ecorutasfilandia.com', 'ACTIVO', 6, 2),
(3, 'Parapente Cordillera Buenavista', '900345678-2', 'RNT-67234', 'Mirador Cerro de las Tres Cruces', '3125672345', 'vuelos@parapentebuenavista.co', 'ACTIVO', 2, 2),
(4, 'Trekking Pijao y Alta Montaña', '900456789-3', 'RNT-78345', 'Plaza Principal # 3-10, Pijao', '3136783456', 'contacto@trekkingpijao.com', 'ACTIVO', 10, 5),
(5, 'Café & Tradición Armenia', '900567890-4', 'RNT-89456', 'Av. Bolívar # 14N-25, Armenia', '3147894567', 'reservas@cafeytradicion.com', 'ACTIVO', 1, 1),
(6, 'Experiencias Calarcá Peñas Blancas', '900678901-5', 'RNT-90567', 'Km 3 Vía al Valle, Calarcá', '3158905678', 'aventura@calarcaexp.com', 'SUSPENDIDO', 3, 2);

-- 2. USUARIO ENCARGADO DE PRESTADOR
INSERT IGNORE INTO usuario_sistema (id_usuario, nombre_usuario, contrasena_cifrada, estado, id_rol, id_prestador) VALUES
(3, 'encargado', '$2a$10$pBo2MNTNNRl4wTW1GQjwoeF06vNrz32YSGCzbfH2XPoBeI7FeLyiG', 'ACTIVO', 2, 1);

-- 3. PLANES DE LOS PRESTADORES
INSERT IGNORE INTO plan (id_plan, nombre, descripcion, tipo, precio, fecha_inicio, fecha_fin, estado, id_prestador) VALUES
(1, 'Tour Básico sin Alimentación', 'Incluye transporte local y guianza certificada', 'BASICO', 85000.00, '2025-01-01', '2026-12-31', 'ACTIVO', 1),
(2, 'Plan Estándar con Refrigerio', 'Incluye guianza, hidratación y refrigerio típico con café de origen', 'ESTANDAR', 120000.00, '2025-01-01', '2026-12-31', 'ACTIVO', 1),
(3, 'Plan Premium Todo Incluido', 'Guianza bilingüe personalizada, almuerzo campestre, suvenir y transporte 4x4', 'PREMIUM', 180000.00, '2025-01-01', '2026-12-31', 'ACTIVO', 1),
(4, 'Plan Eco-Aventura Filandia', 'Caminata botánica, degustación de café y taller de cestería', 'ESTANDAR', 110000.00, '2025-01-01', '2026-12-31', 'ACTIVO', 2),
(5, 'Plan Vuelo Libre Buenavista', 'Vuelo tándem con piloto máster, fotos y video HD', 'PREMIUM', 220000.00, '2025-01-01', '2026-12-31', 'ACTIVO', 3),
(6, 'Plan Páramos Pijao Extremo', 'Ascenso guiado a páramos con seguro de alta montaña', 'PREMIUM', 160000.00, '2025-01-01', '2026-12-31', 'ACTIVO', 4);

-- 4. TOURS ADICIONALES
INSERT IGNORE INTO tour (id_tour, nombre, descripcion, duracion_horas, dificultad, edad_minima, precio_persona, id_categoria, id_prestador) VALUES
(4, 'Vuelo en Parapente sobre el Valle de Maravélez', 'Vuelo tándem biplaza sobre los cafetales y miradores de Buenavista.', 2.0, 'ALTA', 10, 220000.00, 2, 3),
(5, 'Cata Sensorial de Cafés Especiales en Barismo', 'Recorrido por las variedades geisha, bourbon rosado y caturra con barista Q-Grader.', 2.5, 'BAJA', 14, 95000.00, 4, 1),
(6, 'Avistamiento de Aves en los Bosques de Niebla Pijao', 'Ruta matutina con telescopio para observar loros coroniazules y tucanes de montaña.', 4.0, 'MODERADA', 7, 130000.00, 3, 4),
(7, 'Ruta de la Arquitectura de la Colonización Antioqueña', 'Paseo histórico por las calles de balcones y talleres artesanales de Filandia.', 3.0, 'BAJA', 0, 65000.00, 1, 2),
(8, 'Ascenso a Peñas Blancas y Escalada en Roca', 'Ruta de trekking exigente por crestas rocosas de Calarcá con vistas panorámicas de Armenia.', 6.0, 'ALTA', 15, 150000.00, 2, 6);

-- 5. GUÍAS ADICIONALES
INSERT IGNORE INTO guia (id_guia, nombre, documento, tarjeta_profesional) VALUES
(5, 'Andrés Felipe Cardona', '1094888105', 'TP-GUI-00146'),
(6, 'Valentina Henao Duque', '1094888106', 'TP-GUI-00147');

INSERT IGNORE INTO guia_idioma (id_guia, id_idioma) VALUES
(5, 1), -- Andrés habla Español
(5, 2), -- Andrés habla Inglés
(6, 1), -- Valentina habla Español
(6, 3); -- Valentina habla Francés

-- 6. CLIENTES Y PERFILES
INSERT IGNORE INTO cliente (id_cliente, nombres, apellidos, tipo_documento, numero_documento, correo, telefono, fecha_nacimiento, ciudad_origen) VALUES
(2, 'Camila', 'Torres Sánchez', 'CEDULA_CIUDADANIA', '1094900124', 'camila.torres@gmail.com', '3161234567', '1992-03-22', 'Medellín'),
(3, 'Felipe', 'Salazar Pardo', 'CEDULA_CIUDADANIA', '1094900125', 'felipe.salazar@hotmail.com', '3172345678', '1988-11-10', 'Cali'),
(4, 'Mariana', 'López Castro', 'CEDULA_CIUDADANIA', '1094900126', 'mariana.lopez@yahoo.com', '3183456789', '1998-07-05', 'Bogotá D.C.'),
(5, 'John', 'Smith', 'PASAPORTE', 'P987654321', 'john.smith@usatour.com', '3194567890', '1985-09-18', 'Nueva York (EE.UU.)'),
(6, 'Daniela', 'Ríos Herrera', 'CEDULA_CIUDADANIA', '1094900127', 'daniela.rios@outlook.com', '3205678901', '1994-12-30', 'Manizales'),
(7, 'Mateo', 'Vargas Echeverry', 'CEDULA_CIUDADANIA', '1094900128', 'mateo.vargas@correo.com', '3216789012', '2001-04-14', 'Pereira'),
(8, 'Elena', 'Duval', 'PASAPORTE', 'F123456789', 'elena.duval@paris.fr', '3227890123', '1990-08-25', 'París (Francia)');

-- Contraseña para todos los clientes de prueba: Cliente123*
INSERT IGNORE INTO perfil_cliente (id_cliente, contrasena_cifrada, idioma_preferido, canal_preferido, anticipacion_dias, acepta_promociones) VALUES
(2, '$2a$10$8q5GG.IBGeUQY4.I3cTKyuv/MY2O4utR4vFj/10JT7RdP437xRsMi', 'ESPANOL', 'WHATSAPP', 1, 'SI'),
(3, '$2a$10$8q5GG.IBGeUQY4.I3cTKyuv/MY2O4utR4vFj/10JT7RdP437xRsMi', 'ESPANOL', 'CORREO_ELECTRONICO', 3, 'SI'),
(4, '$2a$10$8q5GG.IBGeUQY4.I3cTKyuv/MY2O4utR4vFj/10JT7RdP437xRsMi', 'ESPANOL', 'SMS', 7, 'NO'),
(5, '$2a$10$8q5GG.IBGeUQY4.I3cTKyuv/MY2O4utR4vFj/10JT7RdP437xRsMi', 'INGLES', 'CORREO_ELECTRONICO', 3, 'SI'),
(6, '$2a$10$8q5GG.IBGeUQY4.I3cTKyuv/MY2O4utR4vFj/10JT7RdP437xRsMi', 'ESPANOL', 'WHATSAPP', 3, 'SI'),
(7, '$2a$10$8q5GG.IBGeUQY4.I3cTKyuv/MY2O4utR4vFj/10JT7RdP437xRsMi', 'ESPANOL', 'CORREO_ELECTRONICO', 1, 'NO'),
(8, '$2a$10$8q5GG.IBGeUQY4.I3cTKyuv/MY2O4utR4vFj/10JT7RdP437xRsMi', 'FRANCES', 'CORREO_ELECTRONICO', 7, 'SI');

-- 7. SALIDAS DE TOURS ADICIONALES (Próximas y pasadas realizadas)
INSERT IGNORE INTO salida_tour (id_salida, fecha, hora_inicio, cupo, estado, id_tour, id_guia, id_idioma) VALUES
(9,  '2026-10-15', '08:00:00', 12, 'REALIZADA', 1, 1, 1),
(10, '2026-10-20', '09:00:00', 15, 'REALIZADA', 2, 2, 2),
(11, '2026-10-25', '07:30:00', 10, 'REALIZADA', 3, 3, 1),
(12, '2026-11-01', '10:00:00', 8,  'REALIZADA', 4, 1, 2),
(13, '2026-11-05', '14:00:00', 12, 'REALIZADA', 5, 2, 1),
(14, '2026-11-08', '06:30:00', 10, 'REALIZADA', 6, 4, 1),
(15, '2026-11-15', '08:30:00', 14, 'PROGRAMADA', 1, 2, 1),
(16, '2026-11-18', '09:00:00', 12, 'PROGRAMADA', 7, 5, 1),
(17, '2026-11-20', '08:00:00', 8,  'PROGRAMADA', 4, 1, 1),
(18, '2026-11-22', '07:00:00', 10, 'PROGRAMADA', 6, 4, 2),
(19, '2026-11-25', '14:30:00', 15, 'PROGRAMADA', 2, 3, 1),
(20, '2026-11-28', '10:00:00', 12, 'PROGRAMADA', 5, 2, 3);

-- 8. RESERVAS (Núcleo)
INSERT IGNORE INTO reserva (id_reserva, fecha_creacion, fecha_servicio, estado, valor_total, canal, id_cliente, id_plan) VALUES
(1,  '2026-10-10', '2026-10-15', 'COMPLETADA', 170000.00, 'WEB', 1, 1),
(2,  '2026-10-12', '2026-10-20', 'COMPLETADA', 240000.00, 'WEB', 2, 2),
(3,  '2026-10-18', '2026-10-25', 'COMPLETADA', 280000.00, 'WEB', 3, 1),
(4,  '2026-10-25', '2026-11-01', 'COMPLETADA', 440000.00, 'WEB', 5, 3),
(5,  '2026-10-28', '2026-11-05', 'COMPLETADA', 190000.00, 'WEB', 6, 2),
(6,  '2026-11-01', '2026-11-08', 'COMPLETADA', 260000.00, 'WEB', 8, 1),
(7,  '2026-11-02', '2026-11-15', 'CONFIRMADA', 255000.00, 'WEB', 1, 1),
(8,  '2026-11-03', '2026-11-18', 'CONFIRMADA', 130000.00, 'WEB', 4, 4),
(9,  '2026-11-05', '2026-11-20', 'PENDIENTE',  220000.00, 'WEB', 2, 5),
(10, '2026-11-06', '2026-11-22', 'CONFIRMADA', 260000.00, 'WEB', 5, 6),
(11, '2026-11-07', '2026-11-25', 'PENDIENTE',  360000.00, 'MOSTRADOR', 7, 2),
(12, '2026-10-05', '2026-10-12', 'CANCELADA',  255000.00, 'WEB', 3, 1),
(13, '2026-10-15', '2026-10-22', 'CANCELADA',  170000.00, 'WEB', 6, 1);

-- 9. RESERVA_TOUR (Subtipo)
INSERT IGNORE INTO reserva_tour (id_reserva, id_salida, precio_persona_aplicado) VALUES
(1,  9,  85000.00),
(2,  10, 120000.00),
(3,  11, 140000.00),
(4,  12, 220000.00),
(5,  13, 95000.00),
(6,  14, 130000.00),
(7,  15, 85000.00),
(8,  16, 65000.00),
(9,  17, 220000.00),
(10, 18, 130000.00),
(11, 19, 120000.00),
(12, 7,  85000.00),
(13, 7,  85000.00);

-- 10. PARTICIPANTES
INSERT IGNORE INTO participante (id_participante, nombre, edad, id_reserva) VALUES
(1,  'Alejandro Gómez', 30, 1),
(2,  'Mariana Salazar', 28, 1),
(3,  'Camila Torres', 32, 2),
(4,  'Andrés Torres', 35, 2),
(5,  'Felipe Salazar', 36, 3),
(6,  'Carolina Henao', 33, 3),
(7,  'John Smith', 39, 4),
(8,  'Sarah Smith', 37, 4),
(9,  'Daniela Ríos', 29, 5),
(10, 'Samuel Ríos', 10, 5),
(11, 'Elena Duval', 34, 6),
(12, 'Pierre Duval', 38, 6),
(13, 'Alejandro Gómez', 30, 7),
(14, 'Carlos Gómez', 12, 7),
(15, 'Sofía Gómez', 8, 7),
(16, 'Mariana López', 26, 8),
(17, 'Esteban Morales', 27, 8),
(18, 'Camila Torres', 32, 9),
(19, 'John Smith', 39, 10),
(20, 'David Wilson', 42, 10),
(21, 'Mateo Vargas', 23, 11),
(22, 'Laura Vargas', 25, 11),
(23, 'Lucas Vargas', 19, 11),
(24, 'Felipe Salazar', 36, 12),
(25, 'Daniela Ríos', 29, 13);

-- 11. PAGOS
INSERT IGNORE INTO pago (id_pago, fecha_pago, monto, metodo, estado, referencia_transaccion, id_reserva) VALUES
(1,  '2026-10-10 14:30:00', 170000.00, 'TARJETA_CREDITO', 'EXITOSO', 'TX-CC-20261010-001', 1),
(2,  '2026-10-12 11:15:00', 240000.00, 'PSE',             'EXITOSO', 'TX-PSE-20261012-002', 2),
(3,  '2026-10-18 16:45:00', 280000.00, 'TARJETA_DEBITO',  'EXITOSO', 'TX-TD-20261018-003', 3),
(4,  '2026-10-25 09:20:00', 440000.00, 'TARJETA_CREDITO', 'EXITOSO', 'TX-CC-20261025-004', 4),
(5,  '2026-10-28 17:00:00', 190000.00, 'PSE',             'EXITOSO', 'TX-PSE-20261028-005', 5),
(6,  '2026-11-01 10:30:00', 260000.00, 'TARJETA_CREDITO', 'EXITOSO', 'TX-CC-20261101-006', 6),
(7,  '2026-11-02 15:40:00', 255000.00, 'PSE',             'EXITOSO', 'TX-PSE-20261102-007', 7),
(8,  '2026-11-03 12:10:00', 130000.00, 'EFECTIVO',        'EXITOSO', NULL,                 8),
(9,  '2026-11-05 18:00:00', 100000.00, 'PSE',             'PENDIENTE', 'TX-PSE-20261105-008', 9),
(10, '2026-11-06 14:25:00', 260000.00, 'TARJETA_CREDITO', 'EXITOSO', 'TX-CC-20261106-009', 10),
(11, '2026-11-07 16:00:00', 150000.00, 'TRANSFERENCIA',   'PENDIENTE', NULL,                 11),
(12, '2026-10-06 10:00:00', 255000.00, 'PSE',             'FALLIDO', 'TX-PSE-20261006-ERR', 12),
(13, '2026-10-07 11:30:00', 204000.00, 'TRANSFERENCIA',   'REEMBOLSADO', NULL,              12),
(14, '2026-10-16 12:00:00', 136000.00, 'TARJETA_CREDITO', 'REEMBOLSADO', 'TX-CC-20261016-REF', 13);

-- 12. NOTIFICACIONES
INSERT IGNORE INTO notificacion (id_notificacion, tipo, canal, mensaje, fecha_programada, fecha_envio_real, estado, id_cliente, id_reserva) VALUES
(1, 'CONFIRMACION_RESERVA', 'CORREO', '¡Tu reserva #1 para Senderismo Valle de Cocora ha sido confirmada!', '2026-10-10', '2026-10-10', 'ENVIADA', 1, 1),
(2, 'RECORDATORIO_RESERVA', 'WHATSAPP', 'Recordatorio: Tu tour Senderismo Valle de Cocora es en 3 días. Prepárate con calzado cómodo.', '2026-10-12', '2026-10-12', 'LEIDA', 1, 1),
(3, 'CONFIRMACION_PAGO',    'WHATSAPP', 'Pago recibido por $240,000 para el Recorrido Cafetero en Jeep Willys.', '2026-10-12', '2026-10-12', 'ENVIADA', 2, 2),
(4, 'PROMOCION',            'CORREO', 'Disfruta un 15% de descuento en avistamiento de aves en Pijao este mes.', '2026-11-01', '2026-11-01', 'ENVIADA', 1, NULL),
(5, 'PROMOCION',            'WHATSAPP', 'Nueva temporada de parapente en Buenavista con los mejores vientos.', '2026-11-01', '2026-11-01', 'LEIDA', 2, NULL),
(6, 'RECORDATORIO_RESERVA', 'CORREO', 'Recordatorio de tu tour Senderismo Valle de Cocora programado para el 15 de noviembre.', '2026-11-12', '2026-11-12', 'PENDIENTE', 1, 7),
(7, 'CONFIRMACION_RESERVA', 'CORREO', 'Reserva confirmada #10: Avistamiento de Aves Pijao.', '2026-11-06', '2026-11-06', 'ENVIADA', 5, 10);

SET FOREIGN_KEY_CHECKS = 1;
