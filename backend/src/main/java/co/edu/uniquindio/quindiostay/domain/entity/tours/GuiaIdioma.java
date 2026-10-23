package co.edu.uniquindio.quindiostay.domain.entity.tours;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "guia_idioma")
@Getter
@Setter
@NoArgsConstructor
public class GuiaIdioma {

    @EmbeddedId
    private GuiaIdiomaId id;

    @MapsId("idGuia")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_guia")
    private Guia guia;

    @MapsId("idIdioma")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_idioma")
    private Idioma idioma;

    public GuiaIdioma(Guia guia, Idioma idioma) {
        this.guia = guia;
        this.idioma = idioma;
        this.id = new GuiaIdiomaId(guia != null ? guia.getIdGuia() : null, idioma != null ? idioma.getIdIdioma() : null);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GuiaIdioma that)) return false;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
