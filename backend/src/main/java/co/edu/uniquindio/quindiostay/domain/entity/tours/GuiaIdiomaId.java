package co.edu.uniquindio.quindiostay.domain.entity.tours;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GuiaIdiomaId implements Serializable {

    @Column(name = "id_guia")
    private Long idGuia;

    @Column(name = "id_idioma")
    private Long idIdioma;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GuiaIdiomaId that)) return false;
        return Objects.equals(idGuia, that.idGuia) && Objects.equals(idIdioma, that.idIdioma);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idGuia, idIdioma);
    }
}
