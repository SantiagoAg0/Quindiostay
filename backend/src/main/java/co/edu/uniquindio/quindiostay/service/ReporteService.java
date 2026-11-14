package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.enums.*;
import co.edu.uniquindio.quindiostay.dto.reportes.*;
import co.edu.uniquindio.quindiostay.report.PdfExportador;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReporteService {

    private final JdbcTemplate jdbcTemplate;
    private final PdfExportador pdfExportador;

    // R1. Catálogo de tours por dificultad y precio (Simple · Tour)
    public List<R1TourCatalogoFila> obtenerReporteR1(Dificultad dificultad, BigDecimal precioMax) {
        String sql = """
            SELECT nombre, dificultad, duracion_horas, edad_minima, precio_persona
            FROM tour
            WHERE (? IS NULL OR dificultad = ?)
              AND (? IS NULL OR precio_persona <= ?)
            ORDER BY precio_persona DESC
        """;
        String diffStr = dificultad != null ? dificultad.name() : null;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new R1TourCatalogoFila(
                rs.getString("nombre"),
                Dificultad.valueOf(rs.getString("dificultad")),
                rs.getBigDecimal("duracion_horas"),
                rs.getShort("edad_minima"),
                rs.getBigDecimal("precio_persona")
        ), diffStr, diffStr, precioMax, precioMax);
    }

    // R2. Salidas programadas próximas, 30 días (Simple · Salida_tour)
    public List<R2SalidaProximaFila> obtenerReporteR2(LocalDate desde, LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.of(2026, 11, 11);
        LocalDate h = hasta != null ? hasta : d.plusDays(30);

        String sql = """
            SELECT id_salida, fecha, hora_inicio, cupo, id_tour, id_guia
            FROM salida_tour
            WHERE estado = 'PROGRAMADA' AND fecha BETWEEN ? AND ?
            ORDER BY fecha, hora_inicio
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new R2SalidaProximaFila(
                rs.getLong("id_salida"),
                rs.getDate("fecha").toLocalDate(),
                rs.getTime("hora_inicio").toLocalTime(),
                rs.getShort("cupo"),
                rs.getLong("id_tour"),
                rs.getLong("id_guia")
        ), java.sql.Date.valueOf(d), java.sql.Date.valueOf(h));
    }

    // R3. Pagos fallidos y pendientes (Simple · Pago)
    public List<R3PagoPendienteFila> obtenerReporteR3() {
        String sql = """
            SELECT id_pago, id_reserva, fecha_pago, monto, metodo, estado
            FROM pago
            WHERE estado IN ('FALLIDO','PENDIENTE')
            ORDER BY fecha_pago DESC
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new R3PagoPendienteFila(
                rs.getLong("id_pago"),
                rs.getLong("id_reserva"),
                rs.getTimestamp("fecha_pago").toLocalDateTime(),
                rs.getBigDecimal("monto"),
                MetodoPago.valueOf(rs.getString("metodo")),
                EstadoPago.valueOf(rs.getString("estado"))
        ));
    }

    // R4. Tours con más participantes por mes (Intermedio · JOIN + GROUP BY · gráfico de barras)
    public List<R4TourParticipantesMesFila> obtenerReporteR4() {
        String sql = """
            SELECT DATE_FORMAT(s.fecha,'%Y-%m') AS mes, t.nombre AS tour, COUNT(p.id_participante) AS total_participantes
            FROM salida_tour s
            JOIN tour t          ON t.id_tour = s.id_tour
            JOIN reserva_tour rt ON rt.id_salida = s.id_salida
            JOIN reserva r       ON r.id_reserva = rt.id_reserva AND r.estado <> 'CANCELADA'
            JOIN participante p  ON p.id_reserva = rt.id_reserva
            WHERE s.estado = 'REALIZADA'
            GROUP BY mes, t.id_tour, t.nombre
            ORDER BY mes, total_participantes DESC
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new R4TourParticipantesMesFila(
                rs.getString("mes"),
                rs.getString("tour"),
                rs.getLong("total_participantes")
        ));
    }

    // R5. Guías con más salidas realizadas (Intermedio · GROUP BY + HAVING)
    public List<R5GuiaSalidasFila> obtenerReporteGuiasMasSalidas(LocalDate desde, LocalDate hasta, Integer minimo) {
        int min = (minimo != null && minimo > 0) ? minimo : 1;
        String sql = """
            SELECT g.id_guia, g.nombre AS guia,
                   GROUP_CONCAT(DISTINCT i.nombre ORDER BY i.nombre SEPARATOR ', ') AS idiomas_concat,
                   COUNT(DISTINCT s.id_salida) AS total_salidas,
                   SUM(DISTINCT t.duracion_horas) AS horas_guiadas
            FROM guia g
            JOIN salida_tour s ON s.id_guia = g.id_guia
            JOIN tour t        ON t.id_tour = s.id_tour
            LEFT JOIN guia_idioma gi ON gi.id_guia = g.id_guia
            LEFT JOIN idioma i ON i.id_idioma = gi.id_idioma
            WHERE s.estado = 'REALIZADA'
              AND (? IS NULL OR s.fecha >= ?)
              AND (? IS NULL OR s.fecha <= ?)
            GROUP BY g.id_guia, g.nombre
            HAVING COUNT(DISTINCT s.id_salida) >= ?
            ORDER BY total_salidas DESC, horas_guiadas DESC
        """;
        java.sql.Date dSql = desde != null ? java.sql.Date.valueOf(desde) : null;
        java.sql.Date hSql = hasta != null ? java.sql.Date.valueOf(hasta) : null;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String idiomasStr = rs.getString("idiomas_concat");
            List<String> idiomas = (idiomasStr != null && !idiomasStr.isBlank())
                    ? Arrays.asList(idiomasStr.split(",\\s*"))
                    : List.of();
            return new R5GuiaSalidasFila(
                    rs.getLong("id_guia"),
                    rs.getString("guia"),
                    idiomas,
                    rs.getLong("total_salidas"),
                    rs.getBigDecimal("horas_guiadas")
            );
        }, dSql, dSql, hSql, hSql, min);
    }

    // R6. Ocupación promedio por categoría de tour (Avanzado · subconsulta en el FROM · gráfico de barras)
    public List<R6OcupacionCategoriaFila> obtenerReporteR6() {
        String sql = """
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
            ORDER BY ocupacion_promedio DESC
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new R6OcupacionCategoriaFila(
                rs.getString("categoria"),
                rs.getLong("salidas_realizadas"),
                rs.getBigDecimal("ocupacion_promedio")
        ));
    }

    // R7. Ingresos mensuales por método de pago (Intermedio · GROUP BY · gráfico de líneas)
    public List<R7IngresoMensualFila> obtenerReporteR7() {
        String sql = """
            SELECT DATE_FORMAT(p.fecha_pago,'%Y-%m') AS mes, p.metodo, SUM(p.monto) AS total_ingresos
            FROM pago p
            JOIN reserva r       ON r.id_reserva = p.id_reserva
            JOIN reserva_tour rt ON rt.id_reserva = r.id_reserva
            WHERE p.estado = 'EXITOSO'
            GROUP BY mes, p.metodo
            ORDER BY mes, p.metodo
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new R7IngresoMensualFila(
                rs.getString("mes"),
                MetodoPago.valueOf(rs.getString("metodo")),
                rs.getBigDecimal("total_ingresos")
        ));
    }

    // R8. Prestadores con más cancelaciones (Intermedio · GROUP BY + HAVING)
    public List<R8PrestadorCancelacionesFila> obtenerReporteR8() {
        String sql = """
            SELECT pr.nombre_comercial AS prestador, m.nombre AS municipio,
                   COUNT(*) AS reservas_canceladas, SUM(r.valor_total) AS valor_cancelado
            FROM reserva r
            JOIN plan pl      ON pl.id_plan = r.id_plan
            JOIN prestador pr ON pr.id_prestador = pl.id_prestador
            JOIN municipio m  ON m.id_municipio = pr.id_municipio
            WHERE r.estado = 'CANCELADA'
            GROUP BY pr.id_prestador, pr.nombre_comercial, m.nombre
            ORDER BY reservas_canceladas DESC, valor_cancelado DESC
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new R8PrestadorCancelacionesFila(
                rs.getString("prestador"),
                rs.getString("municipio"),
                rs.getLong("reservas_canceladas"),
                rs.getBigDecimal("valor_cancelado")
        ));
    }

    // R9. Guías sin salidas en un periodo (Avanzado · NOT EXISTS)
    public List<R9GuiaSinSalidasFila> obtenerReporteR9(LocalDate desde, LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.of(2026, 7, 1);
        LocalDate h = hasta != null ? hasta : LocalDate.of(2026, 9, 30);

        String sql = """
            SELECT g.nombre, g.documento, g.tarjeta_profesional
            FROM guia g
            WHERE NOT EXISTS (SELECT 1 FROM salida_tour s
                              WHERE s.id_guia = g.id_guia AND s.estado <> 'CANCELADA'
                                AND s.fecha BETWEEN ? AND ?)
            ORDER BY g.nombre
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new R9GuiaSinSalidasFila(
                rs.getString("nombre"),
                rs.getString("documento"),
                rs.getString("tarjeta_profesional")
        ), java.sql.Date.valueOf(d), java.sql.Date.valueOf(h));
    }

    // R10. Clientes de alto gasto que aceptan promociones (Avanzado · subconsulta escalar en el HAVING)
    public List<R10ClienteAltoGastoFila> obtenerReporteR10() {
        String sql = """
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
            ORDER BY total_gastado DESC
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new R10ClienteAltoGastoFila(
                rs.getString("cliente"),
                rs.getString("ciudad_origen"),
                CanalPreferido.valueOf(rs.getString("canal_preferido")),
                rs.getBigDecimal("total_gastado"),
                rs.getLong("numero_reservas")
        ));
    }

    public byte[] exportarPdf(String codigoReporte) {
        return exportarPdf(codigoReporte, null, null, null, null, null);
    }

    // Exportación PDF genérica para reportes con soporte de filtros
    public byte[] exportarPdf(String codigoReporte, Dificultad dificultad, BigDecimal precioMax, LocalDate desde, LocalDate hasta, Integer minimo) {
        String titulo;
        List<String> columnas = new ArrayList<>();
        List<List<String>> filas = new ArrayList<>();
        Map<String, String> totales = new LinkedHashMap<>();

        switch (codigoReporte.toUpperCase()) {
            case "R1" -> {
                titulo = "R1: Catálogo de Tours por Dificultad y Precio";
                columnas = List.of("Tour", "Dificultad", "Duración (h)", "Edad Mín.", "Precio / Persona");
                var r1 = obtenerReporteR1(dificultad, precioMax);
                r1.forEach(f -> filas.add(List.of(f.nombre(), f.dificultad().name(), f.duracionHoras().toString(), f.edadMinima().toString(), "$" + f.precioPersona())));
                totales.put("Total tours listados", String.valueOf(r1.size()));
            }
            case "R2" -> {
                titulo = "R2: Salidas Programadas Próximas (30 días)";
                columnas = List.of("ID Salida", "Fecha", "Hora", "Cupo", "ID Tour", "ID Guía");
                var r2 = obtenerReporteR2(desde, hasta);
                r2.forEach(f -> filas.add(List.of(f.idSalida().toString(), f.fecha().toString(), f.horaInicio().toString(), f.cupo().toString(), String.valueOf(f.idTour()), String.valueOf(f.idGuia()))));
                totales.put("Total salidas próximas", String.valueOf(r2.size()));
            }
            case "R3" -> {
                titulo = "R3: Reporte de Cartera — Pagos Fallidos y Pendientes";
                columnas = List.of("ID Pago", "ID Reserva", "Fecha", "Monto", "Método", "Estado");
                var r3 = obtenerReporteR3();
                BigDecimal totalMonto = BigDecimal.ZERO;
                for (var f : r3) {
                    filas.add(List.of(f.idPago().toString(), f.idReserva().toString(), f.fechaPago().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), "$" + f.monto(), f.metodo().name(), f.estado().name()));
                    totalMonto = totalMonto.add(f.monto());
                }
                totales.put("Total pagos por gestionar", String.valueOf(r3.size()));
                totales.put("Monto total pendiente/fallido", "$" + totalMonto);
            }
            case "R4" -> {
                titulo = "R4: Tours con Más Participantes por Mes";
                columnas = List.of("Mes", "Tour", "Total Participantes");
                var r4 = obtenerReporteR4();
                r4.forEach(f -> filas.add(List.of(f.mes(), f.tour(), f.totalParticipantes().toString())));
                totales.put("Registros analizados", String.valueOf(r4.size()));
            }
            case "R5" -> {
                titulo = "R5: Guías con Más Salidas Realizadas";
                columnas = List.of("ID Guía", "Nombre del Guía", "Idiomas", "Salidas Realizadas", "Horas Guiadas");
                var r5 = obtenerReporteGuiasMasSalidas(desde, hasta, minimo);
                r5.forEach(f -> filas.add(List.of(f.idGuia().toString(), f.guia(), String.join(", ", f.idiomas()), String.valueOf(f.totalSalidas()), f.horasGuiadas().toString())));
                totales.put("Total guías evaluados", String.valueOf(r5.size()));
            }
            case "R6" -> {
                titulo = "R6: Ocupación Promedio por Categoría de Tour";
                columnas = List.of("Categoría de Tour", "Salidas Realizadas", "Ocupación Promedio (%)");
                var r6 = obtenerReporteR6();
                r6.forEach(f -> filas.add(List.of(f.categoria(), f.salidasRealizadas().toString(), f.ocupacionPromedio() + "%")));
                totales.put("Categorías evaluadas", String.valueOf(r6.size()));
            }
            case "R7" -> {
                titulo = "R7: Ingresos Mensuales por Método de Pago";
                columnas = List.of("Mes", "Método de Pago", "Ingresos Totales");
                var r7 = obtenerReporteR7();
                BigDecimal granTotal = BigDecimal.ZERO;
                for (var f : r7) {
                    filas.add(List.of(f.mes(), f.metodo().name(), "$" + f.totalIngresos()));
                    granTotal = granTotal.add(f.totalIngresos());
                }
                totales.put("Gran Total Recaudado", "$" + granTotal);
            }
            case "R8" -> {
                titulo = "R8: Prestadores con Más Cancelaciones";
                columnas = List.of("Prestador", "Municipio", "Reservas Canceladas", "Valor Cancelado");
                var r8 = obtenerReporteR8();
                r8.forEach(f -> filas.add(List.of(f.prestador(), f.municipio(), f.reservasCanceladas().toString(), "$" + f.valorCancelado())));
                totales.put("Total prestadores con cancelaciones", String.valueOf(r8.size()));
            }
            case "R9" -> {
                titulo = "R9: Guías sin Salidas Asignadas en el Periodo";
                columnas = List.of("Nombre del Guía", "Documento", "Tarjeta Profesional");
                var r9 = obtenerReporteR9(desde, hasta);
                r9.forEach(f -> filas.add(List.of(f.nombre(), f.documento(), f.tarjetaProfesional())));
                totales.put("Guías con capacidad ociosa", String.valueOf(r9.size()));
            }
            case "R10" -> {
                titulo = "R10: Clientes de Alto Gasto que Aceptan Promociones";
                columnas = List.of("Cliente", "Ciudad de Origen", "Canal Preferido", "Total Gastado", "N° Reservas");
                var r10 = obtenerReporteR10();
                r10.forEach(f -> filas.add(List.of(f.cliente(), f.ciudadOrigen() != null ? f.ciudadOrigen() : "N/A", f.canalPreferido() != null ? f.canalPreferido().name() : "N/A", "$" + f.totalGastado(), f.numeroReservas().toString())));
                totales.put("Clientes VIP para campañas", String.valueOf(r10.size()));
            }
            default -> throw new IllegalArgumentException("Código de reporte inválido: " + codigoReporte);
        }

        return pdfExportador.exportarReporte(titulo, LocalDate.now(), null, columnas, filas, totales);
    }
}
