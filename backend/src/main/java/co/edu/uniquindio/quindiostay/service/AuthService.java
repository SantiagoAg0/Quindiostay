package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Cliente;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.PerfilCliente;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.UsuarioSistema;
import co.edu.uniquindio.quindiostay.domain.enums.AceptaPromociones;
import co.edu.uniquindio.quindiostay.domain.enums.CanalPreferido;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoUsuario;
import co.edu.uniquindio.quindiostay.domain.enums.IdiomaPreferido;
import co.edu.uniquindio.quindiostay.dto.auth.LoginRequest;
import co.edu.uniquindio.quindiostay.dto.auth.LoginResponse;
import co.edu.uniquindio.quindiostay.dto.auth.RegistroClienteRequest;
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

import java.time.LocalDate;
import java.util.Optional;

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
        String iden = request.identificador() != null ? request.identificador().trim() : "";
        String clave = request.contrasena() != null ? request.contrasena() : "";

        if ("PERSONAL".equalsIgnoreCase(tipo)) {
            UsuarioSistema usuario = usuarioSistemaRepository.findByNombreUsuario(iden)
                    .orElseThrow(() -> new BadCredentialsException("Usuario o contraseña incorrectos"));

            if (usuario.getEstado() == EstadoUsuario.BLOQUEADO) {
                throw new AccessDeniedException("Usuario bloqueado por el administrador");
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
            // Se busca por correo insensible a mayúsculas
            var cliente = clienteRepository.findByCorreo(iden.toLowerCase())
                    .or(() -> clienteRepository.findByCorreo(iden))
                    .orElseThrow(() -> new BadCredentialsException("No existe ninguna cuenta de cliente registrada con el correo: " + iden));

            var perfil = perfilClienteRepository.findById(cliente.getIdCliente())
                    .orElseThrow(() -> new BadCredentialsException("El cliente está registrado pero aún no ha creado su perfil con contraseña. Por favor regístrese en la opción 'Crear Cuenta'."));

            if (!passwordEncoder.matches(clave, perfil.getContrasenaCifrada())) {
                throw new BadCredentialsException("Contraseña incorrecta para el usuario: " + iden);
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

    @Transactional
    public LoginResponse registrarCliente(RegistroClienteRequest request) {
        String correoLimpio = request.correo().trim().toLowerCase();

        // Validar formato de teléfono para que cumpla ck_cliente_telefono (^3[0-9]{9}$)
        String telefono = request.telefono() != null ? request.telefono().replaceAll("\\D", "") : "";
        if (telefono.isBlank()) {
            telefono = "3001234567"; // Teléfono por defecto si no se ingresa
        } else if (!telefono.matches("^3[0-9]{9}$")) {
            if (telefono.length() == 10 && !telefono.startsWith("3")) {
                telefono = "3" + telefono.substring(1);
            } else if (telefono.length() < 10) {
                telefono = ("3000000000" + telefono).substring(telefono.length());
            } else {
                telefono = telefono.substring(0, 10);
            }
        }

        // Validar fecha de nacimiento por ck_cliente_nacimiento
        LocalDate fechaNac = request.fechaNacimiento() != null ? request.fechaNacimiento() : LocalDate.of(1995, 1, 1);
        String ciudad = (request.ciudadOrigen() != null && !request.ciudadOrigen().isBlank()) ? request.ciudadOrigen().trim() : "Armenia";

        // Regla RN01 / Unificación: Si el cliente ya existía (p. ej. compra presencial) pero sin perfil:
        Optional<Cliente> clienteExistentePorCorreo = clienteRepository.findByCorreo(correoLimpio);
        Optional<Cliente> clienteExistentePorDoc = clienteRepository.findByTipoDocumentoAndNumeroDocumento(request.tipoDocumento(), request.numeroDocumento().trim());

        Cliente cliente;
        if (clienteExistentePorCorreo.isPresent()) {
            cliente = clienteExistentePorCorreo.get();
            if (perfilClienteRepository.existsById(cliente.getIdCliente())) {
                throw new ReglaNegocioException("Ya existe una cuenta activa con el correo: " + correoLimpio);
            }
        } else if (clienteExistentePorDoc.isPresent()) {
            cliente = clienteExistentePorDoc.get();
            if (perfilClienteRepository.existsById(cliente.getIdCliente())) {
                throw new ReglaNegocioException("Ya existe una cuenta activa registrada con el documento: " + request.tipoDocumento() + " " + request.numeroDocumento());
            }
            cliente.setCorreo(correoLimpio);
        } else {
            cliente = new Cliente();
            cliente.setNombres(request.nombres().trim());
            cliente.setApellidos(request.apellidos().trim());
            cliente.setTipoDocumento(request.tipoDocumento());
            cliente.setNumeroDocumento(request.numeroDocumento().trim());
            cliente.setCorreo(correoLimpio);
            cliente.setTelefono(telefono);
            cliente.setFechaNacimiento(fechaNac);
            cliente.setCiudadOrigen(ciudad);
            cliente = clienteRepository.save(cliente);
        }

        // Crear el perfil del cliente
        PerfilCliente perfil = new PerfilCliente();
        perfil.setCliente(cliente);
        perfil.setContrasenaCifrada(passwordEncoder.encode(request.contrasena()));
        perfil.setIdiomaPreferido(request.idiomaPreferido() != null ? request.idiomaPreferido() : IdiomaPreferido.ESPAÑOL);
        perfil.setCanalPreferido(request.canalPreferido() != null ? request.canalPreferido() : CanalPreferido.CORREO);
        perfil.setAnticipacionDias(request.anticipacionDias() != null ? request.anticipacionDias() : (short) 3);
        perfil.setAceptaPromociones(request.aceptaPromociones() != null ? request.aceptaPromociones() : AceptaPromociones.SI);
        perfilClienteRepository.save(perfil);

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
