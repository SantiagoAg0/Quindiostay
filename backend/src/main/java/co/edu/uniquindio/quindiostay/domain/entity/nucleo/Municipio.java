package co.edu.uniquindio.quindiostay.domain.entity.nucleo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Objects;

@Entity
@Table(name = "municipio")
@Getter
@Setter
@NoArgsConstructor
public class Municipio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_municipio")
    private Long idMunicipio;

    @Column(name = "nombre", length = 40, nullable = false, unique = true)
    private String nombre;

    @Column(name = "codigo_dane", length = 5, nullable = false, unique = true)
    private String codigoDane;

    public Municipio(String nombre, String codigoDane) {
        this.nombre = nombre;
        this.codigoDane = codigoDane;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Municipio that)) return false;
        return idMunicipio != null && idMunicipio.equals(that.idMunicipio);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
