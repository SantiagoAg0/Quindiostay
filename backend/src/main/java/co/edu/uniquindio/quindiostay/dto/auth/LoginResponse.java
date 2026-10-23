package co.edu.uniquindio.quindiostay.dto.auth;

public record LoginResponse(
        String token,
        String tipo,
        String nombre,
        String rol,
        Long idPrestador
) {}
