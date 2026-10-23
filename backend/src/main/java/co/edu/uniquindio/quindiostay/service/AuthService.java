package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.UsuarioSistema;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoUsuario;
import co.edu.uniquindio.quindiostay.dto.auth.LoginRequest;
import co.edu.uniquindio.quindiostay.dto.auth.LoginResponse;
import co.edu.uniquindio.quindiostay.dto.auth.UsuarioActualResponse;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.ClienteRepository;
import co.edu.uniquindio.quindiostay.repository.PerfilClienteRepository;
import co.edu.uniquindio.quindiostay.repository.UsuarioSistemaRepository;
import co.edu.uniquindio.quindiostay.security.JwtService;
import co.edu.uniquindio.quindiostay.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioSistemaRepository usuarioSistemaRepository;
    private final ClienteRepository clienteRepository;
    private final PerfilClienteRepository perfilClienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String tipo = request.tipoIngreso();
        String iden = request.identificador();
        String clave = request.contrasena();

        if ("PERSONAL".equalsIgnoreCase(tipo)) {
            UsuarioSistema usuario = usuarioSistemaRepository.findByNombreUsuario(iden)
                    .orElseThrow(() -> new BadCredentialsException("Usuario o contraseña incorrectos"));

            if (usuario.getEstado() == EstadoUsuario.BLOQUEADO) {
                throw new AccessDeniedException("Usuario bloqueado");
            }

            if (!passwordEncoder.matches(clave, usuario.getContrasenaCifrada())) {
                throw new BadCredentialsException("Usuario o contraseña incorrectos");
            }

            Long idPrestador = usuario.getPrestador() != null ? usuario.getPrestador().getIdPrestador() : null;
            var principal = new UsuarioPrincipal(
                    usuario.getIdUsuario(),
                    usuario.getNombreUsuario(),
                    usuario.getNombreUsuario(),
                    usuario.getContrasenaCifrada(),
                    usuario.getRol().getNombre().name(),
                    idPrestador,
                    true
            );

            String token = jwtService.generarToken(principal);
            return new LoginResponse(token, "Bearer", usuario.getNombreUsuario(), usuario.getRol().getNombre().name(), idPrestador);

        } else if ("CLIENTE".equalsIgnoreCase(tipo)) {
            var cliente = clienteRepository.findByCorreo(iden)
                    .orElseThrow(() -> new BadCredentialsException("Usuario o contraseña incorrectos"));

            var perfil = perfilClienteRepository.findById(cliente.getIdCliente())
                    .orElseThrow(() -> new BadCredentialsException("Usuario o contraseña incorrectos"));

            if (!passwordEncoder.matches(clave, perfil.getContrasenaCifrada())) {
                throw new BadCredentialsException("Usuario o contraseña incorrectos");
            }

            String nombreCompleto = cliente.getNombres() + " " + cliente.getApellidos();
            var principal = new UsuarioPrincipal(
                    cliente.getIdCliente(),
                    cliente.getCorreo(),
                    nombreCompleto,
                    perfil.getContrasenaCifrada(),
                    "CLIENTE",
                    null,
                    true
            );

            String token = jwtService.generarToken(principal);
            return new LoginResponse(token, "Bearer", nombreCompleto, "CLIENTE", null);
        } else {
            throw new ReglaNegocioException("Tipo de ingreso inválido. Debe ser PERSONAL o CLIENTE");
        }
    }

    public UsuarioActualResponse obtenerUsuarioActual() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            throw new BadCredentialsException("No autenticado");
        }

        var principal = (UsuarioPrincipal) auth.getPrincipal();
        return new UsuarioActualResponse(
                principal.getNombreCompleto(),
                principal.getRol(),
                principal.getIdPrestador()
        );
    }
}
