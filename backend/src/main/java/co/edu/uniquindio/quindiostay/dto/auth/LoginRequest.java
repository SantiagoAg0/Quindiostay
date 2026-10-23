package co.edu.uniquindio.quindiostay.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "El tipo de ingreso es obligatorio (PERSONAL o CLIENTE)")
        String tipoIngreso,

        @NotBlank(message = "El identificador es obligatorio")
        String identificador,

        @NotBlank(message = "La contraseña es obligatoria")
        String contrasena
) {}
