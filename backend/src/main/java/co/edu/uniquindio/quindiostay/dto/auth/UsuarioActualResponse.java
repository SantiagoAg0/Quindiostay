package co.edu.uniquindio.quindiostay.dto.auth;

public record UsuarioActualResponse(
        String nombre,
        String rol,
        Long idPrestador
) {}
