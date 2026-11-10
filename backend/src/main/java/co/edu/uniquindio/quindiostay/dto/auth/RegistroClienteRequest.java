package co.edu.uniquindio.quindiostay.dto.auth;

import co.edu.uniquindio.quindiostay.domain.enums.AceptaPromociones;
import co.edu.uniquindio.quindiostay.domain.enums.CanalPreferido;
import co.edu.uniquindio.quindiostay.domain.enums.IdiomaPreferido;
import co.edu.uniquindio.quindiostay.domain.enums.TipoDocumento;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record RegistroClienteRequest(
        @NotBlank(message = "Los nombres son obligatorios")
        String nombres,

        @NotBlank(message = "Los apellidos son obligatorios")
        String apellidos,

        @NotNull(message = "El tipo de documento es obligatorio")
        TipoDocumento tipoDocumento,

        @NotBlank(message = "El número de documento es obligatorio")
        String numeroDocumento,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "Formato de correo inválido")
        String correo,

        String telefono,

        LocalDate fechaNacimiento,

        String ciudadOrigen,

        @NotBlank(message = "La contraseña es obligatoria")
        String contrasena,

        IdiomaPreferido idiomaPreferido,

        CanalPreferido canalPreferido,

        Short anticipacionDias,

        AceptaPromociones aceptaPromociones
) {}
