package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.tours.GuiaIdiomaId;
import co.edu.uniquindio.quindiostay.domain.entity.tours.SalidaTour;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoSalida;
import co.edu.uniquindio.quindiostay.dto.comunes.PaginaResponse;
import co.edu.uniquindio.quindiostay.dto.tours.SalidaTourRequest;
import co.edu.uniquindio.quindiostay.dto.tours.SalidaTourResponse;
import co.edu.uniquindio.quindiostay.exception.ConflictoException;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.mapper.SalidaTourMapper;
import co.edu.uniquindio.quindiostay.repository.GuiaIdiomaRepository;
import co.edu.uniquindio.quindiostay.repository.SalidaTourRepository;
import co.edu.uniquindio.quindiostay.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalidaTourService {

    private final SalidaTourRepository salidaTourRepository;
    private final TourRepository tourRepository;
    private final GuiaIdiomaRepository guiaIdiomaRepository;

    @Transactional(readOnly = true)
    public PaginaResponse<SalidaTourResponse> buscar(Long idTour, EstadoSalida estado, LocalDate fecha, String texto, Pageable pageable) {
        Page<SalidaTour> page = salidaTourRepository.buscar(idTour, estado, fecha, texto, pageable);
        List<SalidaTourResponse> lista = page.getContent().stream()
                .map(s -> {
                    long participantes = salidaTourRepository.contarParticipantes(s.getIdSalida());
                    return SalidaTourMapper.aResponse(s, participantes);
                })
                .toList();
        return new PaginaResponse<>(lista, page.getNumber(), page.getTotalPages(), page.getTotalElements(), page.getSize());
    }

    @Transactional(readOnly = true)
    public SalidaTourResponse obtenerPorId(Long id) {
        SalidaTour salida = salidaTourRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Salida de tour no encontrada con ID: " + id));
        long participantes = salidaTourRepository.contarParticipantes(salida.getIdSalida());
        return SalidaTourMapper.aResponse(salida, participantes);
    }

    @Transactional
    public SalidaTourResponse crear(SalidaTourRequest req) {
        validarReglasNegocio(req, null);

        var tour = tourRepository.findById(req.idTour())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tour no encontrado con ID: " + req.idTour()));

        var guiaIdioma = guiaIdiomaRepository.findById(new GuiaIdiomaId(req.idGuia(), req.idIdioma()))
                .orElseThrow(() -> new ReglaNegocioException("El guía no habla el idioma seleccionado"));

        SalidaTour salida = new SalidaTour();
        salida.setTour(tour);
        salida.setGuiaIdioma(guiaIdioma);
        salida.setFecha(req.fecha());
        salida.setHoraInicio(req.horaInicio());
        salida.setCupo(req.cupo());
        salida.setEstado(req.estado() != null ? req.estado() : EstadoSalida.PROGRAMADA);

        salida = salidaTourRepository.save(salida);
        return SalidaTourMapper.aResponse(salida, 0);
    }

    @Transactional
    public SalidaTourResponse modificar(Long id, SalidaTourRequest req) {
        SalidaTour salida = salidaTourRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Salida de tour no encontrada con ID: " + id));

        validarReglasNegocio(req, id);

        var tour = tourRepository.findById(req.idTour())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tour no encontrado con ID: " + req.idTour()));

        var guiaIdioma = guiaIdiomaRepository.findById(new GuiaIdiomaId(req.idGuia(), req.idIdioma()))
                .orElseThrow(() -> new ReglaNegocioException("El guía no habla el idioma seleccionado"));

        salida.setTour(tour);
        salida.setGuiaIdioma(guiaIdioma);
        salida.setFecha(req.fecha());
        salida.setHoraInicio(req.horaInicio());
        salida.setCupo(req.cupo());
        if (req.estado() != null) {
            salida.setEstado(req.estado());
        }

        salida = salidaTourRepository.save(salida);
        long participantes = salidaTourRepository.contarParticipantes(salida.getIdSalida());
        return SalidaTourMapper.aResponse(salida, participantes);
    }

    @Transactional
    public void eliminar(Long id) {
        SalidaTour salida = salidaTourRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Salida de tour no encontrada con ID: " + id));

        long reservas = salidaTourRepository.contarReservas(id);
        long participantes = salidaTourRepository.contarParticipantes(id);

        if (reservas > 0 || participantes > 0) {
            throw new ConflictoException("La salida tiene reservas: cancélala en lugar de eliminarla");
        }

        salidaTourRepository.delete(salida);
    }

    @Transactional
    public SalidaTourResponse cancelar(Long id) {
        SalidaTour salida = salidaTourRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Salida de tour no encontrada con ID: " + id));

        salida.setEstado(EstadoSalida.CANCELADA);
        salida = salidaTourRepository.save(salida);

        // TODO RN05: Si el operador cancela una salida, sus reservas PENDIENTE/CONFIRMADA pasan a CANCELADA y se reembolsa el 100%

        long participantes = salidaTourRepository.contarParticipantes(salida.getIdSalida());
        return SalidaTourMapper.aResponse(salida, participantes);
    }

    private void validarReglasNegocio(SalidaTourRequest req, Long idSalidaActual) {
        if (req.cupo() == null || req.cupo() <= 0) {
            throw new ReglaNegocioException("El cupo de la salida debe ser mayor a 0");
        }

        // Validación de cruce de horario
        if (salidaTourRepository.existeCruceExacto(req.idGuia(), req.fecha(), req.horaInicio(), idSalidaActual)) {
            throw new ReglaNegocioException("El guía ya tiene una salida asignada en la misma fecha y hora");
        }

        // TODO RN07: Solo se programan salidas de tours cuyo prestador está ACTIVO
        // TODO ENCARGADO_PRESTADOR: solo sobre tours de su prestador
    }
}
