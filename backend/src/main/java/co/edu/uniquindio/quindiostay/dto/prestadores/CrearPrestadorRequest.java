package co.edu.uniquindio.quindiostay.dto.prestadores;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoPrestador;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearPrestadorRequest(
        @NotBlank(message = "El nombre comercial es obligatorio")
        String nombreComercial,

        @NotBlank(message = "El NIT o documento es obligatorio")
        String nitDocumento,

        String rnt,
        String direccion,
        String telefono,
        String correo,

        @NotNull(message = "El estado es obligatorio")
        EstadoPrestador estado,

        @NotNull(message = "El municipio es obligatorio")
        Long idMunicipio,

        @NotNull(message = "El tipo de prestador es obligatorio")
        Long idTipoPrestador
) {}
