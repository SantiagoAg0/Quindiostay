package co.edu.uniquindio.quindiostay.domain.entity.nucleo;

import co.edu.uniquindio.quindiostay.domain.enums.NombreTipoPrestador;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tipo_prestador")
@Getter
@Setter
@NoArgsConstructor
public class TipoPrestador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_prestador")
    private Long idTipoPrestador;

    @Enumerated(EnumType.STRING)
    @Column(name = "nombre", nullable = false, unique = true)
    private NombreTipoPrestador nombre;

    public TipoPrestador(NombreTipoPrestador nombre) {
        this.nombre = nombre;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TipoPrestador that)) return false;
        return idTipoPrestador != null && idTipoPrestador.equals(that.idTipoPrestador);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
