-- =============================================================================
-- QUINDÍOSTAY · Script 03 · Verificación de la base limpia
-- Ejecutar después de 01_esquema.sql y 02_datos.sql.
-- Parte A: conteos contra los mínimos exigidos.   Parte B: reglas que la base
-- no declara (se validan en la aplicación, sin triggers). Cada consulta de la
-- parte B debe devolver 0 en la columna "violaciones".
-- =============================================================================
USE quindiostay;

-- A. CONTEOS vs MÍNIMOS ------------------------------------------------------
SELECT 'municipio' tabla, COUNT(*) filas, 12 minimo, IF(COUNT(*)>=12,'OK','FALTA') resultado FROM municipio UNION ALL
SELECT 'tipo_prestador', COUNT(*), 4, IF(COUNT(*)>=4,'OK','FALTA') FROM tipo_prestador UNION ALL
SELECT 'prestador', COUNT(*), 20, IF(COUNT(*)>=20,'OK','FALTA') FROM prestador UNION ALL
SELECT 'cliente', COUNT(*), 150, IF(COUNT(*)>=150,'OK','FALTA') FROM cliente UNION ALL
SELECT 'reserva', COUNT(*), 500, IF(COUNT(*)>=500,'OK','FALTA') FROM reserva UNION ALL
SELECT 'pago', COUNT(*), 500, IF(COUNT(*)>=500,'OK','FALTA') FROM pago UNION ALL
SELECT 'plan', COUNT(*), 40, IF(COUNT(*)>=40,'OK','FALTA') FROM plan UNION ALL
SELECT 'notificacion', COUNT(*), 800, IF(COUNT(*)>=800,'OK','FALTA') FROM notificacion UNION ALL
SELECT 'usuario_sistema', COUNT(*), 5, IF(COUNT(*)>=5,'OK','FALTA') FROM usuario_sistema UNION ALL
SELECT 'rol', COUNT(*), 3, IF(COUNT(*)>=3,'OK','FALTA') FROM rol UNION ALL
SELECT 'perfil_cliente', COUNT(*), 1, IF(COUNT(*)>=1,'OK','FALTA') FROM perfil_cliente UNION ALL
SELECT 'categoria_tour', COUNT(*), 4, IF(COUNT(*)>=4,'OK','FALTA') FROM categoria_tour UNION ALL
SELECT 'idioma', COUNT(*), 5, IF(COUNT(*)>=5,'OK','FALTA') FROM idioma UNION ALL
SELECT 'guia', COUNT(*), 1, IF(COUNT(*)>=1,'OK','FALTA') FROM guia UNION ALL
SELECT 'guia_idioma', COUNT(*), 1, IF(COUNT(*)>=1,'OK','FALTA') FROM guia_idioma UNION ALL
SELECT 'tour', COUNT(*), 1, IF(COUNT(*)>=1,'OK','FALTA') FROM tour UNION ALL
SELECT 'salida_tour', COUNT(*), 1, IF(COUNT(*)>=1,'OK','FALTA') FROM salida_tour UNION ALL
SELECT 'reserva_tour', COUNT(*), 1, IF(COUNT(*)>=1,'OK','FALTA') FROM reserva_tour UNION ALL
SELECT 'participante', COUNT(*), 1, IF(COUNT(*)>=1,'OK','FALTA') FROM participante;

-- B. REGLAS DE APLICACIÓN (todas deben dar 0) ---------------------------------
SELECT 'D01 fecha_servicio = fecha de la salida' regla, COUNT(*) violaciones
FROM reserva_tour rt JOIN reserva r ON r.id_reserva=rt.id_reserva JOIN salida_tour s ON s.id_salida=rt.id_salida
WHERE r.fecha_servicio <> s.fecha
UNION ALL
SELECT 'D02 plan del prestador del tour', COUNT(*)
FROM reserva_tour rt JOIN reserva r ON r.id_reserva=rt.id_reserva JOIN plan p ON p.id_plan=r.id_plan
JOIN salida_tour s ON s.id_salida=rt.id_salida JOIN tour t ON t.id_tour=s.id_tour
WHERE p.id_prestador <> t.id_prestador
UNION ALL
SELECT 'D07 salida solo de prestador ACTIVO', COUNT(*)
FROM salida_tour s JOIN tour t ON t.id_tour=s.id_tour JOIN prestador pr ON pr.id_prestador=t.id_prestador
WHERE pr.estado <> 'ACTIVO'
UNION ALL
SELECT 'D06 REALIZADA solo con fecha pasada (2026-11-11)', COUNT(*) FROM salida_tour WHERE estado='REALIZADA' AND fecha > '2026-11-11'
UNION ALL
SELECT 'D08 todo guía habla algún idioma', COUNT(*) FROM guia g WHERE NOT EXISTS (SELECT 1 FROM guia_idioma gi WHERE gi.id_guia=g.id_guia)
UNION ALL
SELECT 'RN04 guía sin salidas con horario cruzado', COUNT(*)
FROM salida_tour a JOIN tour ta ON ta.id_tour=a.id_tour
JOIN salida_tour b ON b.id_guia=a.id_guia AND b.fecha=a.fecha AND b.id_salida<a.id_salida JOIN tour tb ON tb.id_tour=b.id_tour
WHERE TIME_TO_SEC(a.hora_inicio) < TIME_TO_SEC(b.hora_inicio)+tb.duracion_horas*3600
  AND TIME_TO_SEC(b.hora_inicio) < TIME_TO_SEC(a.hora_inicio)+ta.duracion_horas*3600
UNION ALL
SELECT 'Cupo: participantes (reservas no canceladas) <= cupo', COUNT(*) FROM (
  SELECT s.id_salida FROM salida_tour s JOIN reserva_tour rt ON rt.id_salida=s.id_salida
  JOIN reserva r ON r.id_reserva=rt.id_reserva AND r.estado<>'CANCELADA'
  JOIN participante p ON p.id_reserva=rt.id_reserva GROUP BY s.id_salida, s.cupo HAVING COUNT(*)>s.cupo) x
UNION ALL
SELECT 'Edad participante >= edad mínima del tour', COUNT(*)
FROM participante p JOIN reserva_tour rt ON rt.id_reserva=p.id_reserva JOIN salida_tour s ON s.id_salida=rt.id_salida
JOIN tour t ON t.id_tour=s.id_tour WHERE p.edad < t.edad_minima
UNION ALL
SELECT 'D14 menor de 18 exige adulto en la reserva', COUNT(*) FROM (
  SELECT id_reserva FROM participante GROUP BY id_reserva HAVING SUM(edad<18)>0 AND SUM(edad>=18)=0) x
UNION ALL
SELECT 'D17 valor_total = participantes x precio aplicado', COUNT(*)
FROM reserva_tour rt JOIN reserva r ON r.id_reserva=rt.id_reserva
JOIN (SELECT id_reserva, COUNT(*) n FROM participante GROUP BY id_reserva) c ON c.id_reserva=rt.id_reserva
WHERE r.valor_total <> c.n*rt.precio_persona_aplicado
UNION ALL
SELECT 'Reserva de tour sin participantes', COUNT(*) FROM reserva_tour rt WHERE NOT EXISTS (SELECT 1 FROM participante p WHERE p.id_reserva=rt.id_reserva)
UNION ALL
SELECT 'Reserva dentro de la vigencia del plan', COUNT(*) FROM reserva r JOIN plan p ON p.id_plan=r.id_plan
WHERE r.fecha_servicio NOT BETWEEN p.fecha_inicio AND p.fecha_fin
UNION ALL
SELECT 'D16 WEB/APP_MOVIL exige perfil de cliente', COUNT(*) FROM reserva r
WHERE r.canal IN ('WEB','APP_MOVIL') AND NOT EXISTS (SELECT 1 FROM perfil_cliente pc WHERE pc.id_cliente=r.id_cliente)
UNION ALL
SELECT 'Estado coherente con la fecha (COMPLETADA pasada; CONFIRMADA/PENDIENTE futura)', COUNT(*) FROM reserva
WHERE (estado='COMPLETADA' AND fecha_servicio>='2026-11-11') OR (estado IN ('CONFIRMADA','PENDIENTE') AND fecha_servicio<'2026-11-11')
UNION ALL
SELECT 'Cliente mayor de edad si usa CC', COUNT(*) FROM cliente WHERE tipo_documento='CC' AND TIMESTAMPDIFF(YEAR,fecha_nacimiento,'2026-11-11')<18
UNION ALL
SELECT 'D10 REEMBOLSADO solo si la reserva está CANCELADA', COUNT(*)
FROM pago p JOIN reserva r ON r.id_reserva=p.id_reserva WHERE p.estado='REEMBOLSADO' AND r.estado<>'CANCELADA'
UNION ALL
SELECT 'D10 reembolsado <= pagado', COUNT(*) FROM (
  SELECT id_reserva FROM pago GROUP BY id_reserva
  HAVING SUM(IF(estado='REEMBOLSADO',monto,0)) > SUM(IF(estado='EXITOSO',monto,0))) x
UNION ALL
SELECT 'Pagado exitoso <= valor_total', COUNT(*) FROM (
  SELECT p.id_reserva FROM pago p JOIN reserva r ON r.id_reserva=p.id_reserva GROUP BY p.id_reserva, r.valor_total
  HAVING SUM(IF(p.estado='EXITOSO',p.monto,0)) > r.valor_total) x
UNION ALL
SELECT 'Pago posterior a la creación de la reserva', COUNT(*)
FROM pago p JOIN reserva r ON r.id_reserva=p.id_reserva WHERE DATE(p.fecha_pago) < r.fecha_creacion
UNION ALL
SELECT 'D12 cliente de la notificación = cliente de la reserva', COUNT(*)
FROM notificacion n JOIN reserva r ON r.id_reserva=n.id_reserva WHERE n.id_cliente<>r.id_cliente
UNION ALL
SELECT 'Promoción solo a clientes que la aceptan', COUNT(*)
FROM notificacion n LEFT JOIN perfil_cliente pc ON pc.id_cliente=n.id_cliente
WHERE n.tipo='PROMOCION' AND (pc.acepta_promociones IS NULL OR pc.acepta_promociones<>'SI')
UNION ALL
SELECT 'D15 recordatorio = fecha_servicio - anticipacion_dias', COUNT(*)
FROM notificacion n JOIN reserva r ON r.id_reserva=n.id_reserva JOIN perfil_cliente pc ON pc.id_cliente=n.id_cliente
WHERE n.tipo='RECORDATORIO_RESERVA' AND n.fecha_programada <> DATE_SUB(r.fecha_servicio, INTERVAL pc.anticipacion_dias DAY)
UNION ALL
SELECT 'Notificación PENDIENTE solo con fecha futura; enviada/leída con fecha real', COUNT(*) FROM notificacion
WHERE (estado='PENDIENTE' AND (fecha_programada<='2026-11-11' OR fecha_envio_real IS NOT NULL))
   OR (estado IN ('ENVIADA','LEIDA') AND fecha_envio_real IS NULL)
UNION ALL
SELECT 'D13 ENCARGADO_PRESTADOR con prestador; los demás sin', COUNT(*)
FROM usuario_sistema u JOIN rol r ON r.id_rol=u.id_rol
WHERE (r.nombre='ENCARGADO_PRESTADOR' AND u.id_prestador IS NULL) OR (r.nombre<>'ENCARGADO_PRESTADOR' AND u.id_prestador IS NOT NULL)
UNION ALL
SELECT 'RN07 CONFIRMADA y COMPLETADA: pagos exitosos = valor_total', COUNT(*) FROM (
  SELECT r.id_reserva FROM reserva r LEFT JOIN pago p ON p.id_reserva=r.id_reserva
  WHERE r.estado IN ('CONFIRMADA','COMPLETADA')
  GROUP BY r.id_reserva, r.valor_total HAVING COALESCE(SUM(IF(p.estado='EXITOSO',p.monto,0)),0) <> r.valor_total) x
UNION ALL
SELECT 'RN07 PENDIENTE: pagos exitosos < valor_total', COUNT(*) FROM (
  SELECT r.id_reserva FROM reserva r JOIN pago p ON p.id_reserva=r.id_reserva
  WHERE r.estado='PENDIENTE'
  GROUP BY r.id_reserva, r.valor_total HAVING SUM(IF(p.estado='EXITOSO',p.monto,0)) >= r.valor_total) x
UNION ALL
SELECT 'RN08/D05 reembolso = 100 % (salida cancelada) u 80 % (más de 5 días)', COUNT(*) FROM (
  SELECT p.id_reserva, p.monto, DATE(p.fecha_pago) f, r.fecha_servicio,
         (SELECT SUM(e.monto) FROM pago e WHERE e.id_reserva=p.id_reserva AND e.estado='EXITOSO') pagado,
         EXISTS (SELECT 1 FROM reserva_tour rt JOIN salida_tour s ON s.id_salida=rt.id_salida
                 WHERE rt.id_reserva=p.id_reserva AND s.estado='CANCELADA') op
  FROM pago p JOIN reserva r ON r.id_reserva=p.id_reserva WHERE p.estado='REEMBOLSADO') x
WHERE NOT ( (op=1 AND monto=pagado) OR (op=0 AND monto=ROUND(pagado*0.8,2) AND DATEDIFF(fecha_servicio, f) > 5) )
UNION ALL
SELECT 'RN12 el prestador de un tour es de tipo GUIANZA', COUNT(*)
FROM tour t JOIN prestador p ON p.id_prestador=t.id_prestador JOIN tipo_prestador tp ON tp.id_tipo_prestador=p.id_tipo_prestador
WHERE tp.nombre <> 'GUIANZA';
