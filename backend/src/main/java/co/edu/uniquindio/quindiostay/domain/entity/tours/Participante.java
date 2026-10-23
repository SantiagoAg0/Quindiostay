package co.edu.uniquindio.quindiostay.domain.entity.tours;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "participante")
@Getter
@Setter
@NoArgsConstructor
public class Participante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_participante")
    private Long idParticipante;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "edad", nullable = false)
    private Short edad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false)
    private ReservaTour reservaTour;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Participante that)) return false;
        return idParticipante != null && idParticipante.equals(that.idParticipante);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
