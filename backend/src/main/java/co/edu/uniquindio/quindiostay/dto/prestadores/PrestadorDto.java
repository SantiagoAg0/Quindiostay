package co.edu.uniquindio.quindiostay.dto.prestadores;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoPrestador;

public record PrestadorDto(
        Long idPrestador,
        String nombreComercial,
        String nitDocumento,
        String rnt,
        String direccion,
        String telefono,
        String correo,
        EstadoPrestador estado,
        Long idMunicipio,
        String municipioNombre,
        Long idTipoPrestador,
        String tipoPrestadorNombre
) {}
