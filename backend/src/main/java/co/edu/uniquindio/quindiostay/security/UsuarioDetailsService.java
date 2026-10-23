package co.edu.uniquindio.quindiostay.security;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoUsuario;
import co.edu.uniquindio.quindiostay.repository.ClienteRepository;
import co.edu.uniquindio.quindiostay.repository.PerfilClienteRepository;
import co.edu.uniquindio.quindiostay.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioSistemaRepository usuarioSistemaRepository;
    private final ClienteRepository clienteRepository;
    private final PerfilClienteRepository perfilClienteRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Primero intenta buscar como usuario del sistema
        var optUsuario = usuarioSistemaRepository.findByNombreUsuario(username);
        if (optUsuario.isPresent()) {
            var u = optUsuario.get();
            boolean activo = u.getEstado() == EstadoUsuario.ACTIVO;
            Long idPrestador = u.getPrestador() != null ? u.getPrestador().getIdPrestador() : null;
            return new UsuarioPrincipal(
                    u.getIdUsuario(),
                    u.getNombreUsuario(),
                    u.getNombreUsuario(),
                    u.getContrasenaCifrada(),
                    u.getRol().getNombre().name(),
                    idPrestador,
                    activo
            );
        }

        // Si no, busca como cliente
        var optCliente = clienteRepository.findByCorreo(username);
        if (optCliente.isPresent()) {
            var c = optCliente.get();
            var perfil = perfilClienteRepository.findById(c.getIdCliente())
                    .orElseThrow(() -> new UsernameNotFoundException("Perfil de cliente no encontrado para: " + username));
            return new UsuarioPrincipal(
                    c.getIdCliente(),
                    c.getCorreo(),
                    c.getNombres() + " " + c.getApellidos(),
                    perfil.getContrasenaCifrada(),
                    "CLIENTE",
                    null,
                    true
            );
        }

        throw new UsernameNotFoundException("Usuario no encontrado con identificador: " + username);
    }
}
