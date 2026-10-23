package co.edu.uniquindio.quindiostay.domain.entity.tours;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoSalida;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "salida_tour", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"id_guia", "fecha", "hora_inicio"})
})
@Getter
@Setter
@NoArgsConstructor
public class SalidaTour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_salida")
    private Long idSalida;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "cupo", nullable = false)
    private Short cupo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoSalida estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tour", nullable = false)
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "id_guia", referencedColumnName = "id_guia", nullable = false),
        @JoinColumn(name = "id_idioma", referencedColumnName = "id_idioma", nullable = false)
    })
    private GuiaIdioma guiaIdioma;

    public Guia getGuia() {
        return guiaIdioma != null ? guiaIdioma.getGuia() : null;
    }

    public Idioma getIdioma() {
        return guiaIdioma != null ? guiaIdioma.getIdioma() : null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SalidaTour that)) return false;
        return idSalida != null && idSalida.equals(that.idSalida);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
