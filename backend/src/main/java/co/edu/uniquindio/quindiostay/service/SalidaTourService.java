package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.*;
import co.edu.uniquindio.quindiostay.domain.entity.tours.GuiaIdiomaId;
import co.edu.uniquindio.quindiostay.domain.entity.tours.SalidaTour;
import co.edu.uniquindio.quindiostay.domain.enums.*;
import co.edu.uniquindio.quindiostay.dto.comunes.PaginaResponse;
import co.edu.uniquindio.quindiostay.dto.tours.SalidaTourRequest;
import co.edu.uniquindio.quindiostay.dto.tours.SalidaTourResponse;
import co.edu.uniquindio.quindiostay.exception.ConflictoException;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.mapper.SalidaTourMapper;
import co.edu.uniquindio.quindiostay.repository.*;
import co.edu.uniquindio.quindiostay.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalidaTourService {

    private final SalidaTourRepository salidaTourRepository;
    private final TourRepository tourRepository;
    private final GuiaIdiomaRepository guiaIdiomaRepository;
    private final ReservaRepository reservaRepository;
    private final PagoRepository pagoRepository;
    private final NotificacionRepository notificacionRepository;

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
        var tour = tourRepository.findById(req.idTour())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tour no encontrado con ID: " + req.idTour()));

        // D07: Solo se programan salidas de tours cuyo prestador esta ACTIVO
        if (tour.getPrestador().getEstado() != EstadoPrestador.ACTIVO) {
            throw new ReglaNegocioException("D07: Solo se pueden programar salidas de tours cuyo prestador este ACTIVO. El prestador '"
                    + tour.getPrestador().getNombreComercial() + "' tiene estado " + tour.getPrestador().getEstado());
        }

        // ENCARGADO_PRESTADOR: solo sobre tours de su prestador
        validarAccesoPrestador(tour.getPrestador().getIdPrestador());

        var guiaIdioma = guiaIdiomaRepository.findById(new GuiaIdiomaId(req.idGuia(), req.idIdioma()))
                .orElseThrow(() -> new ReglaNegocioException("El guia no habla el idioma seleccionado"));

        // RN04: Validar cruce de horario real (por duracion del tour)
        validarCruceHorario(req.idGuia(), req.fecha(), req.horaInicio(), tour.getDuracionHoras(), null);

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

        // D06: Estados terminales REALIZADA y CANCELADA no se pueden editar
        if (salida.getEstado() == EstadoSalida.REALIZADA || salida.getEstado() == EstadoSalida.CANCELADA) {
            throw new ReglaNegocioException("D06: No se puede modificar una salida en estado " + salida.getEstado() + ". Los estados REALIZADA y CANCELADA son terminales.");
        }

        var tour = tourRepository.findById(req.idTour())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tour no encontrado con ID: " + req.idTour()));

        // D07: Prestador activo
        if (tour.getPrestador().getEstado() != EstadoPrestador.ACTIVO) {
            throw new ReglaNegocioException("D07: Solo se pueden programar salidas de tours cuyo prestador este ACTIVO");
        }

        // ENCARGADO_PRESTADOR: solo sobre tours de su prestador
        validarAccesoPrestador(tour.getPrestador().getIdPrestador());

        var guiaIdioma = guiaIdiomaRepository.findById(new GuiaIdiomaId(req.idGuia(), req.idIdioma()))
                .orElseThrow(() -> new ReglaNegocioException("El guia no habla el idioma seleccionado"));

        // Validar cupo no menor que participantes activos
        long participantesActivos = salidaTourRepository.contarParticipantes(id);
        if (req.cupo() < participantesActivos) {
            throw new ReglaNegocioException("No se puede reducir el cupo a " + req.cupo() + " porque hay " + participantesActivos + " participantes activos");
        }

        // Si hay reservas activas, no permitir cambio de fecha ni de tour
        long reservasActivas = salidaTourRepository.contarReservas(id);
        if (reservasActivas > 0) {
            if (!salida.getTour().getIdTour().equals(req.idTour())) {
                throw new ReglaNegocioException("No se puede cambiar el tour de una salida con reservas activas");
            }
            if (!salida.getFecha().equals(req.fecha())) {
                throw new ReglaNegocioException("No se puede cambiar la fecha de una salida con reservas activas");
            }
        }

        // RN04: Cruce de horario
        validarCruceHorario(req.idGuia(), req.fecha(), req.horaInicio(), tour.getDuracionHoras(), id);

        // D06: Solo se puede pasar a REALIZADA si viene de PROGRAMADA y fecha <= hoy
        if (req.estado() != null && req.estado() == EstadoSalida.REALIZADA) {
            if (salida.getEstado() != EstadoSalida.PROGRAMADA) {
                throw new ReglaNegocioException("D06: Solo se puede marcar como REALIZADA una salida que este en estado PROGRAMADA");
            }
            if (salida.getFecha().isAfter(LocalDate.now())) {
                throw new ReglaNegocioException("D06: Solo se puede marcar como REALIZADA una salida cuya fecha ya haya pasado o sea hoy");
            }
        }

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

        // ENCARGADO_PRESTADOR: solo sobre tours de su prestador
        validarAccesoPrestador(salida.getTour().getPrestador().getIdPrestador());

        long reservas = salidaTourRepository.contarReservas(id);
        long participantes = salidaTourRepository.contarParticipantes(id);

        if (reservas > 0 || participantes > 0) {
            throw new ConflictoException("La salida tiene reservas: cancelala en lugar de eliminarla");
        }

        salidaTourRepository.delete(salida);
    }

    @Transactional
    public SalidaTourResponse cancelar(Long id) {
        SalidaTour salida = salidaTourRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Salida de tour no encontrada con ID: " + id));

        if (salida.getEstado() == EstadoSalida.CANCELADA) {
            throw new ReglaNegocioException("La salida ya se encuentra cancelada");
        }
        if (salida.getEstado() == EstadoSalida.REALIZADA) {
            throw new ReglaNegocioException("No se puede cancelar una salida que ya fue REALIZADA");
        }

        // ENCARGADO_PRESTADOR: solo sobre tours de su prestador
        validarAccesoPrestador(salida.getTour().getPrestador().getIdPrestador());

        salida.setEstado(EstadoSalida.CANCELADA);
        salida = salidaTourRepository.save(salida);

        // D05 / RF25: Cancelar todas las reservas PENDIENTE/CONFIRMADA de esta salida y reembolsar 100%
        List<Reserva> reservasSalida = reservaRepository.findBySalidaId(id);
        for (Reserva reserva : reservasSalida) {
            if (reserva.getEstado() == EstadoReserva.PENDIENTE || reserva.getEstado() == EstadoReserva.CONFIRMADA) {
                reserva.setEstado(EstadoReserva.CANCELADA);
                reservaRepository.save(reserva);

                // Reembolso del 100% de lo pagado
                BigDecimal totalPagado = pagoRepository.sumExitososPorReserva(reserva.getIdReserva());
                BigDecimal yaReembolsado = pagoRepository.sumReembolsadosPorReserva(reserva.getIdReserva());
                BigDecimal montoReembolso = totalPagado.subtract(yaReembolsado);

                if (montoReembolso.compareTo(BigDecimal.ZERO) > 0) {
                    Pago reembolso = new Pago();
                    reembolso.setFechaPago(LocalDateTime.now());
                    reembolso.setMonto(montoReembolso);
                    reembolso.setMetodo(MetodoPago.TRANSFERENCIA);
                    reembolso.setEstado(EstadoPago.REEMBOLSADO);
                    reembolso.setReserva(reserva);
                    pagoRepository.save(reembolso);
                }

                // Notificacion al cliente
                Notificacion notif = new Notificacion();
                notif.setTipo(TipoNotificacion.CAMBIO_ESTADO);
                notif.setCanal(CanalNotificacion.CORREO);
                notif.setMensaje("La salida del tour '" + salida.getTour().getNombre() + "' programada para " + salida.getFecha()
                        + " ha sido CANCELADA por el operador. Tu reserva #" + reserva.getIdReserva() + " ha sido cancelada"
                        + (montoReembolso.compareTo(BigDecimal.ZERO) > 0 ? " y se ha procesado un reembolso del 100% ($" + montoReembolso + ")." : "."));
                notif.setFechaProgramada(LocalDate.now());
                notif.setFechaEnvioReal(LocalDate.now());
                notif.setEstado(EstadoNotificacion.ENVIADA);
                notif.setCliente(reserva.getCliente());
                notif.setReserva(reserva);
                notificacionRepository.save(notif);
            }
        }

        long participantes = salidaTourRepository.contarParticipantes(salida.getIdSalida());
        return SalidaTourMapper.aResponse(salida, participantes);
    }

    /**
     * RN04: Validacion real de cruce de horario considerando duracion del tour.
     * Calcula fin = horaInicio + duracionHoras y verifica que no haya solapamiento
     * con otras salidas del mismo guia en la misma fecha.
     */
    private void validarCruceHorario(Long idGuia, LocalDate fecha, LocalTime horaInicio, BigDecimal duracionHoras, Long idSalidaActual) {
        long minutosNueva = (long) (duracionHoras.doubleValue() * 60);
        LocalTime finNueva = horaInicio.plusMinutes(minutosNueva);

        List<SalidaTour> salidasGuia = salidaTourRepository.findSalidasGuiaEnFecha(idGuia, fecha, idSalidaActual);

        for (SalidaTour existente : salidasGuia) {
            LocalTime inicioExistente = existente.getHoraInicio();
            long minutosExistente = (long) (existente.getTour().getDuracionHoras().doubleValue() * 60);
            LocalTime finExistente = inicioExistente.plusMinutes(minutosExistente);

            // Solapamiento: inicioA < finB && inicioB < finA
            if (horaInicio.isBefore(finExistente) && inicioExistente.isBefore(finNueva)) {
                throw new ReglaNegocioException("RN04: El guia ya tiene asignada la salida '" + existente.getTour().getNombre()
                        + "' de " + inicioExistente + " a " + finExistente + " en la fecha " + fecha
                        + ". La nueva salida (" + horaInicio + " a " + finNueva + ") se solapa con ella.");
            }
        }
    }

    /**
     * Valida que un ENCARGADO_PRESTADOR solo opere sobre tours de su prestador.
     */
    private void validarAccesoPrestador(Long idPrestadorTour) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            if ("ENCARGADO_PRESTADOR".equalsIgnoreCase(principal.getRol())) {
                if (principal.getIdPrestador() == null || !principal.getIdPrestador().equals(idPrestadorTour)) {
                    throw new ReglaNegocioException("No tiene permisos para operar sobre tours de otro prestador");
                }
            }
        }
    }
}
