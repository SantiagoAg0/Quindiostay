package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.UsuarioSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UsuarioSistemaRepository extends JpaRepository<UsuarioSistema, Long> {
    @Query("SELECT u FROM UsuarioSistema u JOIN FETCH u.rol LEFT JOIN FETCH u.prestador WHERE u.nombreUsuario = :nombreUsuario")
    Optional<UsuarioSistema> findByNombreUsuario(@Param("nombreUsuario") String nombreUsuario);
}
