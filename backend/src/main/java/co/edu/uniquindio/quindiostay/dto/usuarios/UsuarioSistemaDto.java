package co.edu.uniquindio.quindiostay.dto.usuarios;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoUsuario;

public record UsuarioSistemaDto(
        Long idUsuario,
        String nombreUsuario,
        EstadoUsuario estado,
        Long idRol,
        String rolNombre,
        Long idPrestador,
        String prestadorNombre
) {}
