package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Pago;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByReservaIdReserva(Long idReserva);

    List<Pago> findByReservaClienteIdCliente(Long idCliente);

    List<Pago> findByEstado(EstadoPago estado);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM Pago p WHERE p.reserva.idReserva = :idReserva AND p.estado = 'EXITOSO'")
    BigDecimal sumExitososPorReserva(@Param("idReserva") Long idReserva);
}
