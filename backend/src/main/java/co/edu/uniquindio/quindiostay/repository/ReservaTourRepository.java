package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.tours.ReservaTour;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservaTourRepository extends JpaRepository<ReservaTour, Long> {
    List<ReservaTour> findBySalidaIdSalida(Long idSalida);
}
