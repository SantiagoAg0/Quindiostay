package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.tours.SalidaTour;
import co.edu.uniquindio.quindiostay.dto.reportes.*;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.GuiaIdiomaRepository;
import co.edu.uniquindio.quindiostay.repository.SalidaTourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReporteService {

    private final SalidaTourRepository salidaTourRepository;
    private final GuiaIdiomaRepository guiaIdiomaRepository;

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

        // Ordenar desc por total de salidas y luego por horas
        resultado.sort((a, b) -> {
            int cmp = Long.compare(b.totalSalidas(), a.totalSalidas());
            if (cmp != 0) return cmp;
            return b.horasGuiadas().compareTo(a.horasGuiadas());
        });

        return resultado;
    }

    public List<R1TourCatalogoFila> obtenerReporteR1() {
        throw new ReglaNegocioException("Funcionalidad disponible en la Entrega 3 (R1: Catálogo de Tours)");
    }

    public List<R2SalidaProximaFila> obtenerReporteR2() {
        throw new ReglaNegocioException("Funcionalidad disponible en la Entrega 3 (R2: Salidas Próximas)");
    }

    public List<R3PagoPendienteFila> obtenerReporteR3() {
        throw new ReglaNegocioException("Funcionalidad disponible en la Entrega 3 (R3: Pagos Pendientes)");
    }

    public List<R4TourParticipantesMesFila> obtenerReporteR4() {
        throw new ReglaNegocioException("Funcionalidad disponible en la Entrega 3 (R4: Participantes por Mes)");
    }

    public List<R6OcupacionCategoriaFila> obtenerReporteR6() {
        throw new ReglaNegocioException("Funcionalidad disponible en la Entrega 3 (R6: Ocupación por Categoría)");
    }

    public List<R7IngresoMensualFila> obtenerReporteR7() {
        throw new ReglaNegocioException("Funcionalidad disponible en la Entrega 3 (R7: Ingresos Mensuales)");
    }

    public List<R8PrestadorCancelacionesFila> obtenerReporteR8() {
        throw new ReglaNegocioException("Funcionalidad disponible en la Entrega 3 (R8: Cancelaciones por Prestador)");
    }

    public List<R9GuiaSinSalidasFila> obtenerReporteR9() {
        throw new ReglaNegocioException("Funcionalidad disponible en la Entrega 3 (R9: Guías sin Salidas)");
    }

    public List<R10ClienteAltoGastoFila> obtenerReporteR10() {
        throw new ReglaNegocioException("Funcionalidad disponible en la Entrega 3 (R10: Clientes de Alto Gasto)");
    }
}
