package co.edu.uniquindio.quindiostay.dto.catalogos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CatalogosRequests {

    public record MunicipioRequest(
            @NotBlank(message = "El nombre es obligatorio")
            @Size(max = 40, message = "Máximo 40 caracteres")
            String nombre,

            @NotBlank(message = "El código DANE es obligatorio")
            @Size(min = 5, max = 5, message = "El código DANE debe tener 5 dígitos")
            String codigoDane
    ) {}

    public record TipoPrestadorRequest(
            @NotBlank(message = "El nombre es obligatorio")
            String nombre
    ) {}

    public record RolRequest(
            @NotBlank(message = "El nombre es obligatorio")
            String nombre
    ) {}

    public record CategoriaTourRequest(
            @NotBlank(message = "El nombre es obligatorio")
            String nombre,

            String descripcion
    ) {}

    public record IdiomaRequest(
            @NotBlank(message = "El nombre es obligatorio")
            String nombre
    ) {}
}
