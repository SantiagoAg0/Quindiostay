package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Prestador;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PrestadorRepository extends JpaRepository<Prestador, Long> {
    Optional<Prestador> findByNitDocumento(String nitDocumento);
}
