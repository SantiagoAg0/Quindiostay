package co.edu.uniquindio.quindiostay.dto.clientes;

import co.edu.uniquindio.quindiostay.domain.enums.AceptaPromociones;
import co.edu.uniquindio.quindiostay.domain.enums.CanalPreferido;
import co.edu.uniquindio.quindiostay.domain.enums.IdiomaPreferido;
import jakarta.validation.constraints.NotNull;

public record ActualizarPerfilRequest(
        String telefono,
        String ciudadOrigen,

        @NotNull(message = "El idioma preferido es obligatorio")
        IdiomaPreferido idiomaPreferido,

        @NotNull(message = "El canal preferido es obligatorio")
        CanalPreferido canalPreferido,

        @NotNull(message = "La anticipación en días es obligatoria")
        Short anticipacionDias,

        @NotNull(message = "Debe indicar si acepta promociones")
        AceptaPromociones aceptaPromociones
) {}
