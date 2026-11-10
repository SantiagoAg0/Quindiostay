package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.tours.Participante;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParticipanteRepository extends JpaRepository<Participante, Long> {
    List<Participante> findByReservaTourIdReserva(Long idReserva);
}
