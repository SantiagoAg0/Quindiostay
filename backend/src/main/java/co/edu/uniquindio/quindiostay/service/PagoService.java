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
        List<Pago> pagos;
        if (idReservaFiltro != null) {
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

        BigDecimal yaPagado = pagoRepository.sumExitososPorReserva(reserva.getIdReserva());
        BigDecimal nuevoTotal = yaPagado.add(request.monto());

        if (nuevoTotal.compareTo(reserva.getValorTotal()) > 0) {
            throw new ReglaNegocioException("El monto ($" + request.monto() + ") excede el saldo pendiente ($" + (reserva.getValorTotal().subtract(yaPagado)) + ")");
        }

        // RN09: Pagos en línea exigen referencia de pasarela (generamos una simulada si no viene)
        String ref = request.referenciaTransaccion();
        if (request.metodo() == MetodoPago.TARJETA_CREDITO || request.metodo() == MetodoPago.TARJETA_DEBITO || request.metodo() == MetodoPago.PSE) {
            if (ref == null || ref.isBlank()) {
                ref = "TX-" + request.metodo().name().substring(0, 3) + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            }
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

            // Enviar notificación de confirmación de reserva
            Notificacion notifConf = new Notificacion();
            notifConf.setTipo(TipoNotificacion.CONFIRMACION_RESERVA);
            notifConf.setCanal(CanalNotificacion.CORREO);
            notifConf.setMensaje("¡Tu reserva #" + reserva.getIdReserva() + " ha sido PAGADA en su totalidad y está CONFIRMADA!");
            notifConf.setFechaProgramada(LocalDate.now());
            notifConf.setFechaEnvioReal(LocalDate.now());
            notifConf.setEstado(EstadoNotificacion.ENVIADA);
            notifConf.setCliente(reserva.getCliente());
            notifConf.setReserva(reserva);
            notificacionRepository.save(notifConf);
        }

        // Enviar notificación de confirmación de pago
        Notificacion notif = new Notificacion();
        notif.setTipo(TipoNotificacion.CONFIRMACION_PAGO);
        notif.setCanal(CanalNotificacion.CORREO);
        notif.setMensaje("Hemos recibido tu pago de $" + request.monto() + " vía " + request.metodo() + " para la reserva #" + reserva.getIdReserva() + (ref != null ? " (Ref: " + ref + ")" : ""));
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

        // RN10: Un pago solo puede quedar REEMBOLSADO si su reserva está CANCELADA
        if (pago.getReserva().getEstado() != EstadoReserva.CANCELADA) {
            throw new ReglaNegocioException("RN10: Un pago solo puede ser reembolsado si la reserva se encuentra CANCELADA");
        }

        pago.setEstado(EstadoPago.REEMBOLSADO);
        pago = pagoRepository.save(pago);
        return convertirADto(pago);
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
