package co.edu.uniquindio.quindiostay.dto.tours;

import java.util.List;

public record GuiaDetalleDto(
        Long idGuia,
        String nombre,
        String documento,
        String tarjetaProfesional,
        List<Long> idiomasIds,
        List<String> idiomasNombres
) {}
