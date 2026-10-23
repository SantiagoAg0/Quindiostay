package co.edu.uniquindio.quindiostay.domain.entity.nucleo;

import co.edu.uniquindio.quindiostay.domain.enums.AceptaPromociones;
import co.edu.uniquindio.quindiostay.domain.enums.CanalPreferido;
import co.edu.uniquindio.quindiostay.domain.enums.IdiomaPreferido;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "perfil_cliente")
@Getter
@Setter
@NoArgsConstructor
public class PerfilCliente {

    @Id
    @Column(name = "id_cliente")
    private Long idCliente;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @Column(name = "contrasena_cifrada", length = 100, nullable = false)
    private String contrasenaCifrada;

    @Enumerated(EnumType.STRING)
    @Column(name = "idioma_preferido")
    private IdiomaPreferido idiomaPreferido;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_preferido")
    private CanalPreferido canalPreferido;

    @Column(name = "anticipacion_dias")
    private Short anticipacionDias;

    @Enumerated(EnumType.STRING)
    @Column(name = "acepta_promociones")
    private AceptaPromociones aceptaPromociones;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PerfilCliente that)) return false;
        return idCliente != null && idCliente.equals(that.idCliente);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
