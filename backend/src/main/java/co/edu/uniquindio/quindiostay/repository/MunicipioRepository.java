package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Municipio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MunicipioRepository extends JpaRepository<Municipio, Long> {
    Optional<Municipio> findByCodigoDane(String codigoDane);
    Optional<Municipio> findByNombre(String nombre);
}
