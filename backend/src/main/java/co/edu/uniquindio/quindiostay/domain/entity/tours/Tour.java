package co.edu.uniquindio.quindiostay.domain.entity.tours;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Prestador;
import co.edu.uniquindio.quindiostay.domain.enums.Dificultad;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "tour")
@Getter
@Setter
@NoArgsConstructor
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tour")
    private Long idTour;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "duracion_horas", precision = 4, scale = 1, nullable = false)
    private BigDecimal duracionHoras;

    @Enumerated(EnumType.STRING)
    @Column(name = "dificultad", nullable = false)
    private Dificultad dificultad;

    @Column(name = "edad_minima", nullable = false)
    private Short edadMinima;

    @Column(name = "precio_persona", precision = 12, scale = 2, nullable = false)
    private BigDecimal precioPersona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = false)
    private CategoriaTour categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prestador", nullable = false)
    private Prestador prestador;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Tour that)) return false;
        return idTour != null && idTour.equals(that.idTour);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
