package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.*;
import co.edu.uniquindio.quindiostay.domain.entity.tours.Participante;
import co.edu.uniquindio.quindiostay.domain.entity.tours.ReservaTour;
import co.edu.uniquindio.quindiostay.domain.entity.tours.SalidaTour;
import co.edu.uniquindio.quindiostay.domain.enums.*;
import co.edu.uniquindio.quindiostay.dto.reservas.CrearReservaRequest;
import co.edu.uniquindio.quindiostay.dto.reservas.ParticipanteDto;
import co.edu.uniquindio.quindiostay.dto.reservas.ReservaDetalleDto;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.*;
import co.edu.uniquindio.quindiostay.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ReservaTourRepository reservaTourRepository;
    private final SalidaTourRepository salidaTourRepository;
    private final ParticipanteRepository participanteRepository;
    private final ClienteRepository clienteRepository;
    private final PerfilClienteRepository perfilClienteRepository;
    private final PlanRepository planRepository;
    private final PagoRepository pagoRepository;
    private final NotificacionRepository notificacionRepository;

    @Transactional(readOnly = true)
    public List<ReservaDetalleDto> listar(Long idClienteFiltro) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        List<Reserva> reservas;

        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            if ("CLIENTE".equalsIgnoreCase(principal.getRol())) {
                reservas = reservaRepository.findByClienteIdCliente(principal.getId());
            } else if ("ENCARGADO_PRESTADOR".equalsIgnoreCase(principal.getRol()) && principal.getIdPrestador() != null) {
                reservas = reservaRepository.findByPrestadorId(principal.getIdPrestador());
            } else if (idClienteFiltro != null) {
                reservas = reservaRepository.findByClienteIdCliente(idClienteFiltro);
            } else {
                reservas = reservaRepository.findAll();
            }
        } else if (idClienteFiltro != null) {
            reservas = reservaRepository.findByClienteIdCliente(idClienteFiltro);
        } else {
            reservas = reservaRepository.findAll();
        }

        return reservas.stream().map(this::convertirADto).toList();
    }

    @Transactional(readOnly = true)
    public ReservaDetalleDto obtenerPorId(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva", id));
        return convertirADto(reserva);
    }

    @Transactional
    public ReservaDetalleDto crear(CrearReservaRequest request) {
        // 1. Obtener cliente (del request o del JWT)
        Long idCliente = request.idCliente();
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            if ("CLIENTE".equalsIgnoreCase(principal.getRol())) {
                idCliente = principal.getId();
            }
        }

        if (idCliente == null) {
            throw new ReglaNegocioException("Debe especificar el cliente para la reserva");
        }

        final Long idClienteFinal = idCliente;
        Cliente cliente = clienteRepository.findById(idClienteFinal)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", idClienteFinal));

        // RN16: Reserva por canal WEB o APP_MOVIL exige perfil creado
        if (request.canal() == CanalReserva.WEB || request.canal() == CanalReserva.APP_MOVIL) {
            if (!perfilClienteRepository.existsById(idClienteFinal)) {
                throw new ReglaNegocioException("RN16: Para reservar por canal web o app móvil el cliente debe tener una cuenta y perfil activos");
            }
        }

        // 2. Obtener salida
        SalidaTour salida = salidaTourRepository.findById(request.idSalida())
                .orElseThrow(() -> new RecursoNoEncontradoException("SalidaTour", request.idSalida()));

        // RN04: Solo se reservan cupos en salidas PROGRAMADA
        if (salida.getEstado() != EstadoSalida.PROGRAMADA) {
            throw new ReglaNegocioException("RN04: Solo se pueden reservar salidas en estado PROGRAMADA");
        }

        // 3. Obtener plan
        Plan plan = planRepository.findById(request.idPlan())
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan", request.idPlan()));

        // RN02: El plan debe pertenecer al prestador que publica el tour
        if (!plan.getPrestador().getIdPrestador().equals(salida.getTour().getPrestador().getIdPrestador())) {
            throw new ReglaNegocioException("RN02: El plan seleccionado debe pertenecer al prestador del tour (" + salida.getTour().getPrestador().getNombreComercial() + ")");
        }

        // 4. Validar participantes y cupos (RN06)
        int numParticipantes = request.participantes().size();
        long participantesOcupados = salidaTourRepository.contarParticipantes(salida.getIdSalida());
        if (participantesOcupados + numParticipantes > salida.getCupo()) {
            throw new ReglaNegocioException("RN06: Cupo insuficiente. Cupos disponibles: " + (salida.getCupo() - participantesOcupados) + ", solicitados: " + numParticipantes);
        }

        // Validar edades (RN05 & RN14)
        short edadMinimaTour = salida.getTour().getEdadMinima();
        boolean hayMenor = false;
        boolean hayAdulto = false;

        for (ParticipanteDto p : request.participantes()) {
            if (p.edad() < edadMinimaTour) {
                throw new ReglaNegocioException("RN05: El participante " + p.nombre() + " tiene " + p.edad() + " años, pero el tour exige mínimo " + edadMinimaTour + " años");
            }
            if (p.edad() < 18) {
                hayMenor = true;
            } else {
                hayAdulto = true;
            }
        }

        // RN14: Un participante menor de 18 años exige al menos un participante adulto en la misma reserva
        if (hayMenor && !hayAdulto) {
            throw new ReglaNegocioException("RN14: Todo participante menor de edad debe viajar acompañado de al menos un adulto en la misma reserva");
        }

        // 5. RN17: Calcular valor_total = numParticipantes * precio_persona
        BigDecimal precioPersona = salida.getTour().getPrecioPersona();
        BigDecimal valorTotal = precioPersona.multiply(BigDecimal.valueOf(numParticipantes));

        // 6. Guardar Reserva (RN01: fecha_servicio es la fecha de la salida)
        Reserva reserva = new Reserva();
        reserva.setFechaCreacion(LocalDate.now());
        reserva.setFechaServicio(salida.getFecha());
        reserva.setEstado(EstadoReserva.PENDIENTE);
        reserva.setValorTotal(valorTotal);
        reserva.setCanal(request.canal());
        reserva.setCliente(cliente);
        reserva.setPlan(plan);
        reserva = reservaRepository.save(reserva);

        // 7. Guardar ReservaTour
        ReservaTour reservaTour = new ReservaTour();
        reservaTour.setReserva(reserva);
        reservaTour.setSalida(salida);
        reservaTour.setPrecioPersonaAplicado(precioPersona);
        reservaTour = reservaTourRepository.save(reservaTour);

        // 8. Guardar Participantes
        List<Participante> participantesGuardados = new ArrayList<>();
        for (ParticipanteDto p : request.participantes()) {
            Participante part = new Participante();
            part.setNombre(p.nombre());
            part.setEdad(p.edad());
            part.setReservaTour(reservaTour);
            participantesGuardados.add(participanteRepository.save(part));
        }

        // 9. Programar Recordatorio según perfil del cliente (RN13 / RN15)
        var perfilOpt = perfilClienteRepository.findById(cliente.getIdCliente());
        if (perfilOpt.isPresent()) {
            var perfil = perfilOpt.get();
            short anticipacion = perfil.getAnticipacionDias() != null ? perfil.getAnticipacionDias() : 3;
            LocalDate fechaProgramada = salida.getFecha().minusDays(anticipacion);
            if (fechaProgramada.isBefore(LocalDate.now())) {
                fechaProgramada = LocalDate.now();
            }

            Notificacion notif = new Notificacion();
            notif.setTipo(TipoNotificacion.RECORDATORIO_RESERVA);
            notif.setCanal(perfil.getCanalPreferido() != null && perfil.getCanalPreferido() == CanalPreferido.WHATSAPP ? CanalNotificacion.WHATSAPP : CanalNotificacion.CORREO);
            notif.setMensaje("Recordatorio: Tienes programado el tour '" + salida.getTour().getNombre() + "' el día " + salida.getFecha() + " a las " + salida.getHoraInicio());
            notif.setFechaProgramada(fechaProgramada);
            notif.setEstado(EstadoNotificacion.PENDIENTE);
            notif.setCliente(cliente);
            notif.setReserva(reserva);
            notificacionRepository.save(notif);
        }

        return convertirADto(reserva);
    }

    @Transactional
    public ReservaDetalleDto cambiarEstado(Long idReserva, EstadoReserva nuevoEstado) {
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva", idReserva));

        // RN09: Una reserva solo pasa a COMPLETADA si antes estuvo CONFIRMADA
        if (nuevoEstado == EstadoReserva.COMPLETADA && reserva.getEstado() != EstadoReserva.CONFIRMADA) {
            throw new ReglaNegocioException("RN09: Una reserva de tour solo puede pasar a estado COMPLETADA si antes estuvo CONFIRMADA");
        }

        reserva.setEstado(nuevoEstado);
        reserva = reservaRepository.save(reserva);
        return convertirADto(reserva);
    }

    @Transactional
    public ReservaDetalleDto cancelarReserva(Long idReserva, String motivo) {
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva", idReserva));

        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new ReglaNegocioException("La reserva ya se encuentra cancelada");
        }

        BigDecimal totalPagado = pagoRepository.sumExitososPorReserva(idReserva);

        // RN08: Si cancela con más de 5 días de anticipación -> reembolso 80%; con menos de 5 días -> 0%
        long diasAnticipacion = ChronoUnit.DAYS.between(LocalDate.now(), reserva.getFechaServicio());
        BigDecimal porcentajeReembolso = diasAnticipacion > 5 ? BigDecimal.valueOf(0.80) : BigDecimal.ZERO;
        BigDecimal montoReembolso = totalPagado.multiply(porcentajeReembolso);

        reserva.setEstado(EstadoReserva.CANCELADA);
        reservaRepository.save(reserva);

        // Crear pago de reembolso si aplica
        if (montoReembolso.compareTo(BigDecimal.ZERO) > 0) {
            Pago reembolso = new Pago();
            reembolso.setFechaPago(java.time.LocalDateTime.now());
            reembolso.setMonto(montoReembolso);
            reembolso.setMetodo(MetodoPago.TRANSFERENCIA);
            reembolso.setEstado(EstadoPago.REEMBOLSADO);
            reembolso.setReserva(reserva);
            pagoRepository.save(reembolso);
        }

        // Notificación de cancelación al cliente
        Notificacion notif = new Notificacion();
        notif.setTipo(TipoNotificacion.CAMBIO_ESTADO);
        notif.setCanal(CanalNotificacion.CORREO);
        notif.setMensaje("Tu reserva #" + idReserva + " ha sido cancelada. " +
                (montoReembolso.compareTo(BigDecimal.ZERO) > 0 ? "Se procesó un reembolso del 80% ($" + montoReembolso + ") por cancelación con más de 5 días de anticipación (RN08)." : "No aplica reembolso según la política de menos de 5 días de anticipación."));
        notif.setFechaProgramada(LocalDate.now());
        notif.setFechaEnvioReal(LocalDate.now());
        notif.setEstado(EstadoNotificacion.ENVIADA);
        notif.setCliente(reserva.getCliente());
        notif.setReserva(reserva);
        notificacionRepository.save(notif);

        return convertirADto(reserva);
    }

    private ReservaDetalleDto convertirADto(Reserva r) {
        BigDecimal pagado = pagoRepository.sumExitososPorReserva(r.getIdReserva());
        BigDecimal saldo = r.getValorTotal().subtract(pagado);
        if (saldo.compareTo(BigDecimal.ZERO) < 0) saldo = BigDecimal.ZERO;

        var reservaTourOpt = reservaTourRepository.findById(r.getIdReserva());
        Long idSalida = null;
        Long idTour = null;
        String tourNombre = "N/A";
        String tourDificultad = "N/A";
        String guiaNombre = "N/A";
        String idiomaNombre = "N/A";

        if (reservaTourOpt.isPresent()) {
            var rt = reservaTourOpt.get();
            var salida = rt.getSalida();
            idSalida = salida.getIdSalida();
            if (salida.getTour() != null) {
                idTour = salida.getTour().getIdTour();
                tourNombre = salida.getTour().getNombre();
                tourDificultad = salida.getTour().getDificultad().name();
            }
            if (salida.getGuiaIdioma() != null) {
                guiaNombre = salida.getGuiaIdioma().getGuia().getNombre();
                idiomaNombre = salida.getGuiaIdioma().getIdioma().getNombre().name();
            }
        }

        List<ParticipanteDto> parts = participanteRepository.findByReservaTourIdReserva(r.getIdReserva()).stream()
                .map(p -> new ParticipanteDto(p.getIdParticipante(), p.getNombre(), p.getEdad()))
                .toList();

        String clienteNombre = r.getCliente() != null ? r.getCliente().getNombres() + " " + r.getCliente().getApellidos() : "N/A";
        String clienteCorreo = r.getCliente() != null ? r.getCliente().getCorreo() : "N/A";
        Long idPlan = r.getPlan() != null ? r.getPlan().getIdPlan() : null;
        String planNombre = r.getPlan() != null ? r.getPlan().getNombre() : "N/A";

        return new ReservaDetalleDto(
                r.getIdReserva(),
                r.getFechaCreacion(),
                r.getFechaServicio(),
                r.getEstado(),
                r.getValorTotal(),
                pagado,
                saldo,
                r.getCanal(),
                r.getCliente() != null ? r.getCliente().getIdCliente() : null,
                clienteNombre,
                clienteCorreo,
                idSalida,
                idTour,
                tourNombre,
                tourDificultad,
                guiaNombre,
                idiomaNombre,
                idPlan,
                planNombre,
                parts
        );
    }
}
