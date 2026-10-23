package co.edu.uniquindio.quindiostay.domain.entity.tours;

import co.edu.uniquindio.quindiostay.domain.enums.NombreIdioma;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "idioma")
@Getter
@Setter
@NoArgsConstructor
public class Idioma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_idioma")
    private Long idIdioma;

    @Enumerated(EnumType.STRING)
    @Column(name = "nombre", nullable = false, unique = true)
    private NombreIdioma nombre;

    public Idioma(NombreIdioma nombre) {
        this.nombre = nombre;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Idioma that)) return false;
        return idIdioma != null && idIdioma.equals(that.idIdioma);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
