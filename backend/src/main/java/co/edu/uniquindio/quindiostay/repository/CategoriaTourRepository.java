package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.tours.CategoriaTour;
import co.edu.uniquindio.quindiostay.domain.enums.NombreCategoriaTour;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoriaTourRepository extends JpaRepository<CategoriaTour, Long> {
    Optional<CategoriaTour> findByNombre(NombreCategoriaTour nombre);
}
