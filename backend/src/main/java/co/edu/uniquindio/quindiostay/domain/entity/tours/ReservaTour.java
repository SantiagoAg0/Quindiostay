package co.edu.uniquindio.quindiostay.domain.entity.tours;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Reserva;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "reserva_tour")
@Getter
@Setter
@NoArgsConstructor
public class ReservaTour {

    @Id
    @Column(name = "id_reserva")
    private Long idReserva;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_reserva")
    private Reserva reserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_salida", nullable = false)
    private SalidaTour salida;

    @Column(name = "precio_persona_aplicado", precision = 12, scale = 2, nullable = false)
    private BigDecimal precioPersonaAplicado;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ReservaTour that)) return false;
        return idReserva != null && idReserva.equals(that.idReserva);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
