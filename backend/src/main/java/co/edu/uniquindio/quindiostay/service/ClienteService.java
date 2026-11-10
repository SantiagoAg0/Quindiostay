package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Cliente;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.PerfilCliente;
import co.edu.uniquindio.quindiostay.domain.enums.AceptaPromociones;
import co.edu.uniquindio.quindiostay.domain.enums.CanalPreferido;
import co.edu.uniquindio.quindiostay.domain.enums.IdiomaPreferido;
import co.edu.uniquindio.quindiostay.dto.clientes.ActualizarPerfilRequest;
import co.edu.uniquindio.quindiostay.dto.clientes.ClienteDto;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.repository.ClienteRepository;
import co.edu.uniquindio.quindiostay.repository.PerfilClienteRepository;
import co.edu.uniquindio.quindiostay.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PerfilClienteRepository perfilClienteRepository;

    @Transactional(readOnly = true)
    public List<ClienteDto> listar() {
        return clienteRepository.findAll().stream().map(this::convertirADto).toList();
    }

    @Transactional(readOnly = true)
    public ClienteDto obtenerPorId(Long id) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", id));
        return convertirADto(c);
    }

    @Transactional(readOnly = true)
    public ClienteDto obtenerMiPerfil() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return obtenerPorId(principal.getId());
        }
        throw new RecursoNoEncontradoException("Perfil de cliente no encontrado en sesión");
    }

    @Transactional
    public ClienteDto actualizarPerfil(Long idCliente, ActualizarPerfilRequest req) {
        Cliente c = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", idCliente));

        if (req.telefono() != null) c.setTelefono(req.telefono());
        if (req.ciudadOrigen() != null) c.setCiudadOrigen(req.ciudadOrigen());
        clienteRepository.save(c);

        PerfilCliente perfil = perfilClienteRepository.findById(idCliente).orElse(null);
        if (perfil == null) {
            perfil = new PerfilCliente();
            perfil.setCliente(c);
            perfil.setContrasenaCifrada("TEMP_ENCRYPTED");
        }
        perfil.setIdiomaPreferido(req.idiomaPreferido());
        perfil.setCanalPreferido(req.canalPreferido());
        perfil.setAnticipacionDias(req.anticipacionDias());
        perfil.setAceptaPromociones(req.aceptaPromociones());
        perfilClienteRepository.save(perfil);

        return convertirADto(c);
    }

    private ClienteDto convertirADto(Cliente c) {
        var perfilOpt = perfilClienteRepository.findById(c.getIdCliente());
        boolean tienePerfil = perfilOpt.isPresent();
        IdiomaPreferido idioma = tienePerfil ? perfilOpt.get().getIdiomaPreferido() : null;
        CanalPreferido canal = tienePerfil ? perfilOpt.get().getCanalPreferido() : null;
        Short ant = tienePerfil ? perfilOpt.get().getAnticipacionDias() : null;
        AceptaPromociones prom = tienePerfil ? perfilOpt.get().getAceptaPromociones() : null;

        return new ClienteDto(
                c.getIdCliente(),
                c.getNombres(),
                c.getApellidos(),
                c.getTipoDocumento(),
                c.getNumeroDocumento(),
                c.getCorreo(),
                c.getTelefono(),
                c.getFechaNacimiento(),
                c.getCiudadOrigen(),
                tienePerfil,
                idioma,
                canal,
                ant,
                prom
        );
    }
}
