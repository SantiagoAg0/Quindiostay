package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Cliente;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Notificacion;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Reserva;
import co.edu.uniquindio.quindiostay.domain.enums.AceptaPromociones;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoNotificacion;
import co.edu.uniquindio.quindiostay.domain.enums.TipoNotificacion;
import co.edu.uniquindio.quindiostay.dto.notificaciones.CrearNotificacionRequest;
import co.edu.uniquindio.quindiostay.dto.notificaciones.NotificacionDto;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.ClienteRepository;
import co.edu.uniquindio.quindiostay.repository.NotificacionRepository;
import co.edu.uniquindio.quindiostay.repository.PerfilClienteRepository;
import co.edu.uniquindio.quindiostay.repository.ReservaRepository;
import co.edu.uniquindio.quindiostay.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final ClienteRepository clienteRepository;
    private final PerfilClienteRepository perfilClienteRepository;
    private final ReservaRepository reservaRepository;

    @Transactional(readOnly = true)
    public List<NotificacionDto> listar(Long idClienteFiltro) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        List<Notificacion> notifs;

        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            if ("CLIENTE".equalsIgnoreCase(principal.getRol())) {
                notifs = notificacionRepository.findByClienteIdCliente(principal.getId());
            } else if (idClienteFiltro != null) {
                notifs = notificacionRepository.findByClienteIdCliente(idClienteFiltro);
            } else {
                notifs = notificacionRepository.findAll();
            }
        } else if (idClienteFiltro != null) {
            notifs = notificacionRepository.findByClienteIdCliente(idClienteFiltro);
        } else {
            notifs = notificacionRepository.findAll();
        }

        return notifs.stream().map(this::convertirADto).toList();
    }

    @Transactional
    public NotificacionDto crear(CrearNotificacionRequest req) {
        Cliente cliente = clienteRepository.findById(req.idCliente())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", req.idCliente()));

        // RN11: Promociones solo se envían a clientes que las aceptaron
        if (req.tipo() == TipoNotificacion.PROMOCION) {
            var perfil = perfilClienteRepository.findById(req.idCliente());
            if (perfil.isEmpty() || perfil.get().getAceptaPromociones() != AceptaPromociones.SI) {
                throw new ReglaNegocioException("RN11: Las promociones solo pueden enviarse a clientes que aceptaron recibirlas");
            }
        }

        Reserva reserva = null;
        if (req.idReserva() != null) {
            reserva = reservaRepository.findById(req.idReserva()).orElse(null);
        }

        Notificacion n = new Notificacion();
        n.setTipo(req.tipo());
        n.setCanal(req.canal());
        n.setMensaje(req.mensaje());
        n.setFechaProgramada(req.fechaProgramada());
        n.setFechaEnvioReal(req.fechaProgramada().isEqual(LocalDate.now()) ? LocalDate.now() : null);
        n.setEstado(req.fechaProgramada().isEqual(LocalDate.now()) ? EstadoNotificacion.ENVIADA : EstadoNotificacion.PENDIENTE);
        n.setCliente(cliente);
        n.setReserva(reserva);

        n = notificacionRepository.save(n);
        return convertirADto(n);
    }

    @Transactional
    public NotificacionDto marcarLeida(Long id) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Notificacion", id));
        n.setEstado(EstadoNotificacion.LEIDA);
        n = notificacionRepository.save(n);
        return convertirADto(n);
    }

    private NotificacionDto convertirADto(Notificacion n) {
        String cliNombre = n.getCliente() != null ? n.getCliente().getNombres() + " " + n.getCliente().getApellidos() : "N/A";
        Long idRes = n.getReserva() != null ? n.getReserva().getIdReserva() : null;
        return new NotificacionDto(
                n.getIdNotificacion(),
                n.getTipo(),
                n.getCanal(),
                n.getMensaje(),
                n.getFechaProgramada(),
                n.getFechaEnvioReal(),
                n.getEstado(),
                n.getCliente() != null ? n.getCliente().getIdCliente() : null,
                cliNombre,
                idRes
        );
    }
}
