package co.edu.uniquindio.quindiostay.domain.entity.tours;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "guia")
@Getter
@Setter
@NoArgsConstructor
public class Guia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_guia")
    private Long idGuia;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "documento", length = 20, nullable = false, unique = true)
    private String documento;

    @Column(name = "tarjeta_profesional", length = 20, nullable = false, unique = true)
    private String tarjetaProfesional;

    public Guia(String nombre, String documento, String tarjetaProfesional) {
        this.nombre = nombre;
        this.documento = documento;
        this.tarjetaProfesional = tarjetaProfesional;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Guia that)) return false;
        return idGuia != null && idGuia.equals(that.idGuia);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
