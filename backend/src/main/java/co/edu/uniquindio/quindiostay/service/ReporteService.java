package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Cliente;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Pago;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Prestador;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Reserva;
import co.edu.uniquindio.quindiostay.domain.entity.tours.Guia;
import co.edu.uniquindio.quindiostay.domain.entity.tours.Participante;
import co.edu.uniquindio.quindiostay.domain.entity.tours.SalidaTour;
import co.edu.uniquindio.quindiostay.domain.entity.tours.Tour;
import co.edu.uniquindio.quindiostay.domain.enums.*;
import co.edu.uniquindio.quindiostay.dto.reportes.*;
import co.edu.uniquindio.quindiostay.report.PdfExportador;
import co.edu.uniquindio.quindiostay.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReporteService {

    private final SalidaTourRepository salidaTourRepository;
    private final GuiaIdiomaRepository guiaIdiomaRepository;
    private final TourRepository tourRepository;
    private final GuiaRepository guiaRepository;
    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;
    private final ReservaTourRepository reservaTourRepository;
    private final ParticipanteRepository participanteRepository;
    private final ClienteRepository clienteRepository;
    private final PerfilClienteRepository perfilClienteRepository;
    private final PrestadorRepository prestadorRepository;
    private final CategoriaTourRepository categoriaTourRepository;
    private final PdfExportador pdfExportador;

    // R1. Catálogo de tours por dificultad y precio (Simple)
    public List<R1TourCatalogoFila> obtenerReporteR1(Dificultad dificultad, BigDecimal precioMax) {
        return tourRepository.findAll().stream()
                .filter(t -> dificultad == null || t.getDificultad() == dificultad)
                .filter(t -> precioMax == null || t.getPrecioPersona().compareTo(precioMax) <= 0)
                .sorted((a, b) -> b.getPrecioPersona().compareTo(a.getPrecioPersona()))
                .map(t -> new R1TourCatalogoFila(t.getNombre(), t.getDificultad(), t.getDuracionHoras(), t.getEdadMinima(), t.getPrecioPersona()))
                .toList();
    }

    // R2. Salidas programadas próximas (Simple)
    public List<R2SalidaProximaFila> obtenerReporteR2(LocalDate desde, LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.now();
        LocalDate h = hasta != null ? hasta : LocalDate.now().plusDays(30);

        return salidaTourRepository.findAll().stream()
                .filter(s -> s.getEstado() == EstadoSalida.PROGRAMADA)
                .filter(s -> !s.getFecha().isBefore(d) && !s.getFecha().isAfter(h))
                .sorted(Comparator.comparing(SalidaTour::getFecha).thenComparing(SalidaTour::getHoraInicio))
                .map(s -> new R2SalidaProximaFila(
                        s.getIdSalida(),
                        s.getFecha(),
                        s.getHoraInicio(),
                        s.getCupo(),
                        s.getTour() != null ? s.getTour().getIdTour() : null,
                        s.getGuiaIdioma() != null && s.getGuiaIdioma().getGuia() != null ? s.getGuiaIdioma().getGuia().getIdGuia() : null
                ))
                .toList();
    }

    // R3. Pagos fallidos y pendientes (Simple)
    public List<R3PagoPendienteFila> obtenerReporteR3() {
        return pagoRepository.findAll().stream()
                .filter(p -> p.getEstado() == EstadoPago.FALLIDO || p.getEstado() == EstadoPago.PENDIENTE)
                .sorted((a, b) -> b.getFechaPago().compareTo(a.getFechaPago()))
                .map(p -> new R3PagoPendienteFila(
                        p.getIdPago(),
                        p.getReserva() != null ? p.getReserva().getIdReserva() : null,
                        p.getFechaPago(),
                        p.getMonto(),
                        p.getMetodo(),
                        p.getEstado()
                ))
                .toList();
    }

    // R4. Tours con más participantes por mes (Intermedio con gráfico de barras)
    public List<R4TourParticipantesMesFila> obtenerReporteR4() {
        List<SalidaTour> salidas = salidaTourRepository.findAll();
        Map<String, Long> agrupado = new LinkedHashMap<>();

        for (SalidaTour s : salidas) {
            if (s.getTour() == null) continue;
            String mes = s.getFecha().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String tour = s.getTour().getNombre();
            String key = mes + "___" + tour;

            long partCount = salidaTourRepository.contarParticipantes(s.getIdSalida());
            agrupado.put(key, agrupado.getOrDefault(key, 0L) + partCount);
        }

        List<R4TourParticipantesMesFila> resultado = new ArrayList<>();
        agrupado.forEach((k, v) -> {
            String[] parts = k.split("___");
            resultado.add(new R4TourParticipantesMesFila(parts[0], parts[1], v));
        });

        resultado.sort(Comparator.comparing(R4TourParticipantesMesFila::mes).thenComparing(R4TourParticipantesMesFila::totalParticipantes).reversed());
        return resultado;
    }

    // R5. Guías con más salidas realizadas (Intermedio)
    public List<R5GuiaSalidasFila> obtenerReporteGuiasMasSalidas(LocalDate desde, LocalDate hasta, Integer minimo) {
        int min = (minimo != null && minimo > 0) ? minimo : 1;
        List<SalidaTour> salidas = salidaTourRepository.findRealizadasEnRango(desde, hasta);

        Map<Long, List<SalidaTour>> salidasPorGuia = salidas.stream()
                .filter(s -> s.getGuia() != null)
                .collect(Collectors.groupingBy(s -> s.getGuia().getIdGuia()));

        List<R5GuiaSalidasFila> resultado = new ArrayList<>();

        for (Map.Entry<Long, List<SalidaTour>> entry : salidasPorGuia.entrySet()) {
            Long idGuia = entry.getKey();
            List<SalidaTour> lista = entry.getValue();

            long totalSalidas = lista.size();
            if (totalSalidas < min) continue;

            String nombreGuia = lista.getFirst().getGuia().getNombre();

            BigDecimal totalHoras = BigDecimal.ZERO;
            for (SalidaTour s : lista) {
                if (s.getTour() != null && s.getTour().getDuracionHoras() != null) {
                    totalHoras = totalHoras.add(s.getTour().getDuracionHoras());
                }
            }

            List<String> idiomas = guiaIdiomaRepository.findByGuiaId(idGuia).stream()
                    .map(gi -> gi.getIdioma().getNombre().name())
                    .toList();

            resultado.add(new R5GuiaSalidasFila(idGuia, nombreGuia, idiomas, totalSalidas, totalHoras));
        }

        resultado.sort((a, b) -> {
            int cmp = Long.compare(b.totalSalidas(), a.totalSalidas());
            if (cmp != 0) return cmp;
            return b.horasGuiadas().compareTo(a.horasGuiadas());
        });

        return resultado;
    }

    // R6. Ocupación promedio por categoría de tour (Avanzado con gráfico de barras)
    public List<R6OcupacionCategoriaFila> obtenerReporteR6() {
        var categorias = categoriaTourRepository.findAll();
        List<R6OcupacionCategoriaFila> resultado = new ArrayList<>();

        for (var cat : categorias) {
            List<SalidaTour> salidasCat = salidaTourRepository.findAll().stream()
                    .filter(s -> s.getTour() != null && s.getTour().getCategoria() != null
                            && s.getTour().getCategoria().getIdCategoria().equals(cat.getIdCategoria()))
                    .filter(s -> s.getEstado() == EstadoSalida.REALIZADA)
                    .toList();

            long totalSalidas = salidasCat.size();
            if (totalSalidas == 0) {
                resultado.add(new R6OcupacionCategoriaFila(cat.getNombre().name(), 0L, BigDecimal.ZERO));
                continue;
            }

            BigDecimal sumaOcupacion = BigDecimal.ZERO;
            for (SalidaTour s : salidasCat) {
                long part = salidaTourRepository.contarParticipantes(s.getIdSalida());
                double ratio = ((double) part / s.getCupo()) * 100.0;
                sumaOcupacion = sumaOcupacion.add(BigDecimal.valueOf(ratio));
            }

            BigDecimal promedio = sumaOcupacion.divide(BigDecimal.valueOf(totalSalidas), 2, RoundingMode.HALF_UP);
            resultado.add(new R6OcupacionCategoriaFila(cat.getNombre().name(), totalSalidas, promedio));
        }

        resultado.sort((a, b) -> b.ocupacionPromedio().compareTo(a.ocupacionPromedio()));
        return resultado;
    }

    // R7. Ingresos mensuales por método de pago (Intermedio con gráfico de líneas)
    public List<R7IngresoMensualFila> obtenerReporteR7() {
        List<Pago> pagosExitosos = pagoRepository.findAll().stream()
                .filter(p -> p.getEstado() == EstadoPago.EXITOSO && p.getFechaPago() != null)
                .toList();

        Map<String, BigDecimal> agrupado = new TreeMap<>();

        for (Pago p : pagosExitosos) {
            String mes = p.getFechaPago().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String metodo = p.getMetodo().name();
            String key = mes + "___" + metodo;
            agrupado.put(key, agrupado.getOrDefault(key, BigDecimal.ZERO).add(p.getMonto()));
        }

        List<R7IngresoMensualFila> resultado = new ArrayList<>();
        agrupado.forEach((k, v) -> {
            String[] parts = k.split("___");
            resultado.add(new R7IngresoMensualFila(parts[0], MetodoPago.valueOf(parts[1]), v));
        });

        return resultado;
    }

    // R8. Prestadores con más cancelaciones (Intermedio)
    public List<R8PrestadorCancelacionesFila> obtenerReporteR8() {
        List<Prestador> prestadores = prestadorRepository.findAll();
        List<R8PrestadorCancelacionesFila> resultado = new ArrayList<>();

        for (Prestador p : prestadores) {
            List<Reserva> canceladas = reservaRepository.findAll().stream()
                    .filter(r -> r.getPlan() != null && r.getPlan().getPrestador() != null
                            && p.getIdPrestador().equals(r.getPlan().getPrestador().getIdPrestador()))
                    .filter(r -> r.getEstado() == EstadoReserva.CANCELADA)
                    .toList();

            long totalCanceladas = canceladas.size();
            BigDecimal valorCancelado = canceladas.stream()
                    .map(Reserva::getValorTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalCanceladas > 0) {
                String munNom = p.getMunicipio() != null ? p.getMunicipio().getNombre() : "N/A";
                resultado.add(new R8PrestadorCancelacionesFila(p.getNombreComercial(), munNom, totalCanceladas, valorCancelado));
            }
        }

        resultado.sort((a, b) -> Long.compare(b.reservasCanceladas(), a.reservasCanceladas()));
        return resultado;
    }

    // R9. Guías sin salidas en un periodo (Avanzado)
    public List<R9GuiaSinSalidasFila> obtenerReporteR9(LocalDate desde, LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.now().minusMonths(1);
        LocalDate h = hasta != null ? hasta : LocalDate.now();

        Set<Long> guiasConSalida = salidaTourRepository.findAll().stream()
                .filter(s -> s.getEstado() != EstadoSalida.CANCELADA)
                .filter(s -> !s.getFecha().isBefore(d) && !s.getFecha().isAfter(h))
                .filter(s -> s.getGuia() != null)
                .map(s -> s.getGuia().getIdGuia())
                .collect(Collectors.toSet());

        return guiaRepository.findAll().stream()
                .filter(g -> !guiasConSalida.contains(g.getIdGuia()))
                .map(g -> new R9GuiaSinSalidasFila(g.getNombre(), g.getDocumento(), g.getTarjetaProfesional()))
                .toList();
    }

    // R10. Clientes de alto gasto que aceptan promociones (Avanzado)
    public List<R10ClienteAltoGastoFila> obtenerReporteR10() {
        List<Cliente> clientes = clienteRepository.findAll();
        Map<Long, BigDecimal> gastoPorCliente = new HashMap<>();
        Map<Long, Long> reservasPorCliente = new HashMap<>();

        for (Cliente c : clientes) {
            List<Reserva> resCli = reservaRepository.findByClienteIdCliente(c.getIdCliente());
            reservasPorCliente.put(c.getIdCliente(), (long) resCli.size());

            BigDecimal gastado = BigDecimal.ZERO;
            for (Reserva r : resCli) {
                gastado = gastado.add(pagoRepository.sumExitososPorReserva(r.getIdReserva()));
            }
            gastoPorCliente.put(c.getIdCliente(), gastado);
        }

        // Subconsulta: promedio de gasto general
        double promedioGeneral = gastoPorCliente.values().stream()
                .filter(v -> v.compareTo(BigDecimal.ZERO) > 0)
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.0);

        List<R10ClienteAltoGastoFila> resultado = new ArrayList<>();

        for (Cliente c : clientes) {
            var perfilOpt = perfilClienteRepository.findById(c.getIdCliente());
            if (perfilOpt.isPresent() && perfilOpt.get().getAceptaPromociones() == AceptaPromociones.SI) {
                BigDecimal gastado = gastoPorCliente.getOrDefault(c.getIdCliente(), BigDecimal.ZERO);
                if (gastado.doubleValue() >= promedioGeneral && gastado.compareTo(BigDecimal.ZERO) > 0) {
                    String nombreComp = c.getNombres() + " " + c.getApellidos();
                    resultado.add(new R10ClienteAltoGastoFila(
                            nombreComp,
                            c.getCiudadOrigen(),
                            perfilOpt.get().getCanalPreferido(),
                            gastado,
                            reservasPorCliente.getOrDefault(c.getIdCliente(), 0L)
                    ));
                }
            }
        }

        resultado.sort((a, b) -> b.totalGastado().compareTo(a.totalGastado()));
        return resultado;
    }

    // Exportación PDF genérica para reportes
    public byte[] exportarPdf(String codigoReporte) {
        String titulo;
        List<String> columnas = new ArrayList<>();
        List<List<String>> filas = new ArrayList<>();
        Map<String, String> totales = new LinkedHashMap<>();

        switch (codigoReporte.toUpperCase()) {
            case "R1" -> {
                titulo = "R1: Catálogo de Tours por Dificultad y Precio";
                columnas = List.of("Tour", "Dificultad", "Duración (h)", "Edad Mín.", "Precio / Persona");
                var r1 = obtenerReporteR1(null, null);
                r1.forEach(f -> filas.add(List.of(f.nombre(), f.dificultad().name(), f.duracionHoras().toString(), f.edadMinima().toString(), "$" + f.precioPersona())));
                totales.put("Total tours listados", String.valueOf(r1.size()));
            }
            case "R2" -> {
                titulo = "R2: Salidas Programadas Próximas (30 días)";
                columnas = List.of("ID Salida", "Fecha", "Hora", "Cupo", "ID Tour", "ID Guía");
                var r2 = obtenerReporteR2(null, null);
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
                var r5 = obtenerReporteGuiasMasSalidas(null, null, 1);
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
                var r9 = obtenerReporteR9(null, null);
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
