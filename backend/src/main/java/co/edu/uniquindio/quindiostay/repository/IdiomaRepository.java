package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.tours.Idioma;
import co.edu.uniquindio.quindiostay.domain.enums.NombreIdioma;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface IdiomaRepository extends JpaRepository<Idioma, Long> {
    Optional<Idioma> findByNombre(NombreIdioma nombre);
}
