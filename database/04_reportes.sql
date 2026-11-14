-- =============================================================================
-- QUINDÍOSTAY · Script 04 · Los 10 reportes en SQL (Entrega 2, sección 5)
-- Cada consulta se puede ejecutar sola en Workbench. Los valores entre @ son los
-- filtros que la aplicación envía como parámetros (?). Nivel: simple (R1-R3),
-- intermedio con GROUP BY / HAVING (R4, R5, R7, R8), avanzado con subconsultas (R6, R9, R10).
-- La aplicación debe ejecutar ESTAS consultas (no recorrer tablas con findAll en Java).
-- =============================================================================
USE quindiostay;
SET @hoy = '2026-11-11';                     -- en la app: CURDATE()
SET @dificultad = 'ALTA', @precio_min = 100000;
SET @desde = '2026-07-01', @hasta = '2026-09-30';
SET @min_salidas = 2, @min_canceladas = 3;

-- R1 · Catálogo de tours por dificultad y precio (SIMPLE · Tour)
SELECT nombre, dificultad, duracion_horas, edad_minima, precio_persona
FROM tour
WHERE dificultad = @dificultad AND precio_persona > @precio_min
ORDER BY precio_persona DESC;

-- R2 · Salidas programadas próximas, 30 días (SIMPLE · Salida_tour)
SELECT id_salida, fecha, hora_inicio, cupo, id_tour, id_guia
FROM salida_tour
WHERE estado = 'PROGRAMADA' AND fecha BETWEEN @hoy AND DATE_ADD(@hoy, INTERVAL 30 DAY)
ORDER BY fecha, hora_inicio;

-- R3 · Pagos fallidos y pendientes (SIMPLE · Pago)
SELECT id_pago, id_reserva, fecha_pago, monto, metodo, estado
FROM pago
WHERE estado IN ('FALLIDO','PENDIENTE')
ORDER BY fecha_pago;

-- R4 · Tours con más participantes por mes (INTERMEDIO · JOIN + GROUP BY) · gráfico de barras
SELECT DATE_FORMAT(s.fecha,'%Y-%m') AS mes, t.nombre AS tour, COUNT(p.id_participante) AS total_participantes
FROM salida_tour s
JOIN tour t          ON t.id_tour = s.id_tour
JOIN reserva_tour rt ON rt.id_salida = s.id_salida
JOIN reserva r       ON r.id_reserva = rt.id_reserva AND r.estado <> 'CANCELADA'
JOIN participante p  ON p.id_reserva = rt.id_reserva
WHERE s.estado = 'REALIZADA'
GROUP BY mes, t.id_tour, t.nombre
ORDER BY mes, total_participantes DESC;

-- R5 · Guías con más salidas realizadas (INTERMEDIO · GROUP BY + HAVING)
SELECT g.id_guia, g.nombre AS guia, COUNT(*) AS total_salidas, SUM(t.duracion_horas) AS horas_guiadas
FROM guia g
JOIN salida_tour s ON s.id_guia = g.id_guia
JOIN tour t        ON t.id_tour = s.id_tour
WHERE s.estado = 'REALIZADA' AND s.fecha BETWEEN @desde AND @hasta
GROUP BY g.id_guia, g.nombre
HAVING COUNT(*) >= @min_salidas
ORDER BY total_salidas DESC, horas_guiadas DESC;

-- R7 · Ingresos mensuales por método de pago, solo tours (INTERMEDIO · GROUP BY) · gráfico de líneas
SELECT DATE_FORMAT(p.fecha_pago,'%Y-%m') AS mes, p.metodo, SUM(p.monto) AS total_ingresos
FROM pago p
JOIN reserva r       ON r.id_reserva = p.id_reserva
JOIN reserva_tour rt ON rt.id_reserva = r.id_reserva
WHERE p.estado = 'EXITOSO'
GROUP BY mes, p.metodo
ORDER BY mes, p.metodo;

-- R8 · Prestadores con más cancelaciones (INTERMEDIO · GROUP BY + HAVING)
SELECT pr.nombre_comercial AS prestador, m.nombre AS municipio,
       COUNT(*) AS reservas_canceladas, SUM(r.valor_total) AS valor_cancelado
FROM reserva r
JOIN plan pl      ON pl.id_plan = r.id_plan
JOIN prestador pr ON pr.id_prestador = pl.id_prestador
JOIN municipio m  ON m.id_municipio = pr.id_municipio
WHERE r.estado = 'CANCELADA'
GROUP BY pr.id_prestador, pr.nombre_comercial, m.nombre
HAVING COUNT(*) >= @min_canceladas
ORDER BY reservas_canceladas DESC, valor_cancelado DESC;

-- R6 · Ocupación promedio por categoría (AVANZADO · subconsulta en el FROM) · gráfico de barras
-- La interna cuenta los participantes de cada salida realizada (LEFT JOIN: las vacías cuentan 0);
-- la externa promedia participantes / cupo por categoría.
SELECT c.nombre AS categoria, COUNT(*) AS salidas_realizadas,
       ROUND(AVG(x.participantes / x.cupo) * 100, 1) AS ocupacion_promedio
FROM (SELECT s.id_salida, s.id_tour, s.cupo, COUNT(p.id_participante) AS participantes
      FROM salida_tour s
      LEFT JOIN reserva_tour rt ON rt.id_salida = s.id_salida
      LEFT JOIN reserva r       ON r.id_reserva = rt.id_reserva AND r.estado <> 'CANCELADA'
      LEFT JOIN participante p  ON p.id_reserva = r.id_reserva
      WHERE s.estado = 'REALIZADA'
      GROUP BY s.id_salida, s.id_tour, s.cupo) x
JOIN tour t           ON t.id_tour = x.id_tour
JOIN categoria_tour c ON c.id_categoria = t.id_categoria
GROUP BY c.id_categoria, c.nombre
ORDER BY ocupacion_promedio DESC;

-- R9 · Guías sin salidas en un periodo (AVANZADO · NOT EXISTS)
SELECT g.nombre, g.documento, g.tarjeta_profesional
FROM guia g
WHERE NOT EXISTS (SELECT 1 FROM salida_tour s
                  WHERE s.id_guia = g.id_guia AND s.estado <> 'CANCELADA'
                    AND s.fecha BETWEEN @desde AND @hasta)
ORDER BY g.nombre;

-- R10 · Clientes de alto gasto que aceptan promociones (AVANZADO · subconsulta escalar en el HAVING)
SELECT CONCAT(c.nombres,' ',c.apellidos) AS cliente, c.ciudad_origen, pc.canal_preferido,
       SUM(p.monto) AS total_gastado, COUNT(DISTINCT r.id_reserva) AS numero_reservas
FROM cliente c
JOIN perfil_cliente pc ON pc.id_cliente = c.id_cliente AND pc.acepta_promociones = 'SI'
JOIN reserva r         ON r.id_cliente = c.id_cliente
JOIN reserva_tour rt   ON rt.id_reserva = r.id_reserva
JOIN pago p            ON p.id_reserva = r.id_reserva AND p.estado = 'EXITOSO'
GROUP BY c.id_cliente, c.nombres, c.apellidos, c.ciudad_origen, pc.canal_preferido
HAVING SUM(p.monto) > (SELECT AVG(gasto) FROM (
                         SELECT SUM(p2.monto) AS gasto
                         FROM reserva r2
                         JOIN reserva_tour rt2 ON rt2.id_reserva = r2.id_reserva
                         JOIN pago p2 ON p2.id_reserva = r2.id_reserva AND p2.estado = 'EXITOSO'
                         GROUP BY r2.id_cliente) g)
ORDER BY total_gastado DESC;
