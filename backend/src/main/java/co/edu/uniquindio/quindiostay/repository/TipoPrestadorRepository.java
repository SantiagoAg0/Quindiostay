package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.TipoPrestador;
import co.edu.uniquindio.quindiostay.domain.enums.NombreTipoPrestador;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TipoPrestadorRepository extends JpaRepository<TipoPrestador, Long> {
    Optional<TipoPrestador> findByNombre(NombreTipoPrestador nombre);
}
