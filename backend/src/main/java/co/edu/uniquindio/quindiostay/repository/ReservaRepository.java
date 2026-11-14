package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Reserva;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByClienteIdCliente(Long idCliente);

    @Query("SELECT r FROM Reserva r WHERE r.plan.prestador.idPrestador = :idPrestador")
    List<Reserva> findByPrestadorId(@Param("idPrestador") Long idPrestador);

    long countByEstado(EstadoReserva estado);

    @Query("SELECT rt.reserva FROM ReservaTour rt WHERE rt.salida.idSalida = :idSalida")
    List<Reserva> findBySalidaId(@Param("idSalida") Long idSalida);
}
