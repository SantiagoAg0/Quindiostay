package co.edu.uniquindio.quindiostay.dto.usuarios;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearUsuarioRequest(
        @NotBlank(message = "El nombre de usuario es obligatorio")
        String nombreUsuario,

        @NotBlank(message = "La contraseña es obligatoria")
        String contrasena,

        @NotNull(message = "El rol es obligatorio")
        Long idRol,

        EstadoUsuario estado,

        Long idPrestador
) {}
