package co.edu.uniquindio.quindiostay.domain.entity.nucleo;

import co.edu.uniquindio.quindiostay.domain.enums.CanalNotificacion;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoNotificacion;
import co.edu.uniquindio.quindiostay.domain.enums.TipoNotificacion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "notificacion")
@Getter
@Setter
@NoArgsConstructor
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    private Long idNotificacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoNotificacion tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal", nullable = false)
    private CanalNotificacion canal;

    @Column(name = "mensaje", length = 400, nullable = false)
    private String mensaje;

    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;

    @Column(name = "fecha_envio_real")
    private LocalDate fechaEnvioReal;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoNotificacion estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva")
    private Reserva reserva;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Notificacion that)) return false;
        return idNotificacion != null && idNotificacion.equals(that.idNotificacion);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
