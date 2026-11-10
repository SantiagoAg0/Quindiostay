package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByClienteIdCliente(Long idCliente);
}
