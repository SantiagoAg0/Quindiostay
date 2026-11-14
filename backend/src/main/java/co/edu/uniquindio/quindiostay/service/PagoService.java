package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Notificacion;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Pago;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Reserva;
import co.edu.uniquindio.quindiostay.domain.enums.*;
import co.edu.uniquindio.quindiostay.dto.pagos.CrearPagoRequest;
import co.edu.uniquindio.quindiostay.dto.pagos.PagoDetalleDto;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.NotificacionRepository;
import co.edu.uniquindio.quindiostay.repository.PagoRepository;
import co.edu.uniquindio.quindiostay.repository.ReservaRepository;
import co.edu.uniquindio.quindiostay.repository.ReservaTourRepository;
import lombok.RequiredArgsConstructor;
import co.edu.uniquindio.quindiostay.security.UsuarioPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;
    private final ReservaTourRepository reservaTourRepository;
    private final NotificacionRepository notificacionRepository;

    @Transactional(readOnly = true)
    public List<PagoDetalleDto> listar(Long idReservaFiltro, EstadoPago estadoFiltro) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        List<Pago> pagos;

        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            if ("CLIENTE".equalsIgnoreCase(principal.getRol())) {
                // El cliente solo puede consultar sus propios pagos
                pagos = pagoRepository.findByReservaClienteIdCliente(principal.getId());
                if (idReservaFiltro != null) {
                    pagos = pagos.stream().filter(p -> p.getReserva().getIdReserva().equals(idReservaFiltro)).toList();
                }
                if (estadoFiltro != null) {
                    pagos = pagos.stream().filter(p -> p.getEstado() == estadoFiltro).toList();
                }
            } else if ("ENCARGADO_PRESTADOR".equalsIgnoreCase(principal.getRol()) && principal.getIdPrestador() != null) {
                // ENCARGADO_PRESTADOR ve solo pagos de reservas cuyo plan pertenece a su prestador
                pagos = pagoRepository.findByPrestadorId(principal.getIdPrestador());
                if (idReservaFiltro != null) {
                    pagos = pagos.stream().filter(p -> p.getReserva().getIdReserva().equals(idReservaFiltro)).toList();
                }
                if (estadoFiltro != null) {
                    pagos = pagos.stream().filter(p -> p.getEstado() == estadoFiltro).toList();
                }
            } else {
                // ADMIN / OPERADOR: ven todo
                if (idReservaFiltro != null) {
                    pagos = pagoRepository.findByReservaIdReserva(idReservaFiltro);
                } else if (estadoFiltro != null) {
                    pagos = pagoRepository.findByEstado(estadoFiltro);
                } else {
                    pagos = pagoRepository.findAll();
                }
            }
        } else if (idReservaFiltro != null) {
            pagos = pagoRepository.findByReservaIdReserva(idReservaFiltro);
        } else if (estadoFiltro != null) {
            pagos = pagoRepository.findByEstado(estadoFiltro);
        } else {
            pagos = pagoRepository.findAll();
        }
        return pagos.stream().map(this::convertirADto).toList();
    }

    @Transactional
    public PagoDetalleDto registrarPago(CrearPagoRequest request) {
        Reserva reserva = reservaRepository.findById(request.idReserva())
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva", request.idReserva()));

        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new ReglaNegocioException("No se pueden registrar pagos para una reserva CANCELADA");
        }
        if (reserva.getEstado() == EstadoReserva.COMPLETADA) {
            throw new ReglaNegocioException("No se pueden registrar pagos para una reserva COMPLETADA");
        }

        BigDecimal yaPagado = pagoRepository.sumExitososPorReserva(reserva.getIdReserva());
        BigDecimal nuevoTotal = yaPagado.add(request.monto());

        if (nuevoTotal.compareTo(reserva.getValorTotal()) > 0) {
            throw new ReglaNegocioException("El monto ($" + request.monto() + ") excede el saldo pendiente ($" + (reserva.getValorTotal().subtract(yaPagado)) + ")");
        }

        // Generar referencia para pagos en linea si no viene
        String ref = request.referenciaTransaccion();
        if (request.metodo() == MetodoPago.TARJETA_CREDITO || request.metodo() == MetodoPago.TARJETA_DEBITO || request.metodo() == MetodoPago.PSE) {
            if (ref == null || ref.isBlank()) {
                ref = "TX-" + request.metodo().name().substring(0, 3) + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            }
        }
        // Para TRANSFERENCIA y EFECTIVO, referencia debe ser null (CHECK constraint ck_pago_referencia)
        if (request.metodo() == MetodoPago.TRANSFERENCIA || request.metodo() == MetodoPago.EFECTIVO) {
            ref = null;
        }

        Pago pago = new Pago();
        pago.setFechaPago(LocalDateTime.now());
        pago.setMonto(request.monto());
        pago.setMetodo(request.metodo());
        pago.setEstado(EstadoPago.EXITOSO);
        pago.setReferenciaTransaccion(ref);
        pago.setReserva(reserva);
        pago = pagoRepository.save(pago);

        // RN07: Si con este pago se cubre el valor total, la reserva pasa a CONFIRMADA
        if (nuevoTotal.compareTo(reserva.getValorTotal()) >= 0) {
            reserva.setEstado(EstadoReserva.CONFIRMADA);
            reservaRepository.save(reserva);

            // Notificacion de confirmacion de reserva
            Notificacion notifConf = new Notificacion();
            notifConf.setTipo(TipoNotificacion.CONFIRMACION_RESERVA);
            notifConf.setCanal(CanalNotificacion.CORREO);
            notifConf.setMensaje("Tu reserva #" + reserva.getIdReserva() + " ha sido PAGADA en su totalidad y esta CONFIRMADA.");
            notifConf.setFechaProgramada(LocalDate.now());
            notifConf.setFechaEnvioReal(LocalDate.now());
            notifConf.setEstado(EstadoNotificacion.ENVIADA);
            notifConf.setCliente(reserva.getCliente());
            notifConf.setReserva(reserva);
            notificacionRepository.save(notifConf);
        }

        // Notificacion de confirmacion de pago
        Notificacion notif = new Notificacion();
        notif.setTipo(TipoNotificacion.CONFIRMACION_PAGO);
        notif.setCanal(CanalNotificacion.CORREO);
        notif.setMensaje("Hemos recibido tu pago de $" + request.monto() + " via " + request.metodo() + " para la reserva #" + reserva.getIdReserva() + (ref != null ? " (Ref: " + ref + ")" : ""));
        notif.setFechaProgramada(LocalDate.now());
        notif.setFechaEnvioReal(LocalDate.now());
        notif.setEstado(EstadoNotificacion.ENVIADA);
        notif.setCliente(reserva.getCliente());
        notif.setReserva(reserva);
        notificacionRepository.save(notif);

        return convertirADto(pago);
    }

    @Transactional
    public PagoDetalleDto reembolsar(Long idPago) {
        Pago pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago", idPago));

        // D10: Solo se reembolsa si la reserva esta CANCELADA
        if (pago.getReserva().getEstado() != EstadoReserva.CANCELADA) {
            throw new ReglaNegocioException("D10: Un pago solo puede ser reembolsado si la reserva se encuentra CANCELADA");
        }

        if (pago.getEstado() == EstadoPago.REEMBOLSADO) {
            throw new ReglaNegocioException("Este pago ya fue reembolsado");
        }

        // D10: El monto reembolsado no puede exceder lo pagado - ya reembolsado
        BigDecimal totalPagado = pagoRepository.sumExitososPorReserva(pago.getReserva().getIdReserva());
        BigDecimal yaReembolsado = pagoRepository.sumReembolsadosPorReserva(pago.getReserva().getIdReserva());
        BigDecimal disponibleReembolso = totalPagado.subtract(yaReembolsado);

        if (pago.getMonto().compareTo(disponibleReembolso) > 0) {
            throw new ReglaNegocioException("D10: El monto a reembolsar ($" + pago.getMonto() + ") excede el saldo disponible para reembolso ($" + disponibleReembolso + ")");
        }

        // Crear un nuevo registro de pago REEMBOLSADO en lugar de mutar el existente
        Pago reembolso = new Pago();
        reembolso.setFechaPago(LocalDateTime.now());
        reembolso.setMonto(pago.getMonto());
        reembolso.setMetodo(MetodoPago.TRANSFERENCIA);
        reembolso.setEstado(EstadoPago.REEMBOLSADO);
        reembolso.setReserva(pago.getReserva());
        reembolso = pagoRepository.save(reembolso);

        return convertirADto(reembolso);
    }

    private PagoDetalleDto convertirADto(Pago p) {
        String cliNombre = p.getReserva() != null && p.getReserva().getCliente() != null
                ? p.getReserva().getCliente().getNombres() + " " + p.getReserva().getCliente().getApellidos() : "N/A";

        String tourNombre = "N/A";
        if (p.getReserva() != null) {
            var rt = reservaTourRepository.findById(p.getReserva().getIdReserva());
            if (rt.isPresent() && rt.get().getSalida() != null && rt.get().getSalida().getTour() != null) {
                tourNombre = rt.get().getSalida().getTour().getNombre();
            }
        }

        return new PagoDetalleDto(
                p.getIdPago(),
                p.getReserva() != null ? p.getReserva().getIdReserva() : null,
                p.getFechaPago(),
                p.getMonto(),
                p.getMetodo(),
                p.getEstado(),
                p.getReferenciaTransaccion(),
                cliNombre,
                tourNombre
        );
    }
}
