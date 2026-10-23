package co.edu.uniquindio.quindiostay.domain.entity.tours;

import co.edu.uniquindio.quindiostay.domain.enums.NombreCategoriaTour;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categoria_tour")
@Getter
@Setter
@NoArgsConstructor
public class CategoriaTour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Long idCategoria;

    @Enumerated(EnumType.STRING)
    @Column(name = "nombre", nullable = false, unique = true)
    private NombreCategoriaTour nombre;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    public CategoriaTour(NombreCategoriaTour nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CategoriaTour that)) return false;
        return idCategoria != null && idCategoria.equals(that.idCategoria);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
