package co.edu.uniquindio.quindiostay.dto.clientes;

import co.edu.uniquindio.quindiostay.domain.enums.AceptaPromociones;
import co.edu.uniquindio.quindiostay.domain.enums.CanalPreferido;
import co.edu.uniquindio.quindiostay.domain.enums.IdiomaPreferido;
import co.edu.uniquindio.quindiostay.domain.enums.TipoDocumento;
import java.time.LocalDate;

public record ClienteDto(
        Long idCliente,
        String nombres,
        String apellidos,
        TipoDocumento tipoDocumento,
        String numeroDocumento,
        String correo,
        String telefono,
        LocalDate fechaNacimiento,
        String ciudadOrigen,
        boolean tienePerfil,
        IdiomaPreferido idiomaPreferido,
        CanalPreferido canalPreferido,
        Short anticipacionDias,
        AceptaPromociones aceptaPromociones
) {}
