package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Cliente;
import co.edu.uniquindio.quindiostay.domain.enums.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByCorreo(String correo);

    Optional<Cliente> findByTipoDocumentoAndNumeroDocumento(TipoDocumento tipoDocumento, String numeroDocumento);

    boolean existsByTipoDocumentoAndNumeroDocumento(TipoDocumento tipoDocumento, String numeroDocumento);
}
