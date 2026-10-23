package co.edu.uniquindio.quindiostay.domain.entity.nucleo;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoPrestador;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "prestador")
@Getter
@Setter
@NoArgsConstructor
public class Prestador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prestador")
    private Long idPrestador;

    @Column(name = "nombre_comercial", length = 100, nullable = false)
    private String nombreComercial;

    @Column(name = "nit_documento", length = 20, nullable = false, unique = true)
    private String nitDocumento;

    @Column(name = "rnt", length = 20)
    private String rnt;

    @Column(name = "direccion", length = 120)
    private String direccion;

    @Column(name = "telefono", length = 10)
    private String telefono;

    @Column(name = "correo", length = 100)
    private String correo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoPrestador estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_municipio", nullable = false)
    private Municipio municipio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_prestador", nullable = false)
    private TipoPrestador tipoPrestador;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Prestador that)) return false;
        return idPrestador != null && idPrestador.equals(that.idPrestador);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
