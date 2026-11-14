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
            String correoLimpio = iden.trim().toLowerCase();
            // Se busca por correo insensible a mayúsculas
            var cliente = clienteRepository.findByCorreoIgnoreCase(correoLimpio)
                    .or(() -> clienteRepository.findByCorreo(iden.trim()))
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

    @Transactional
    public LoginResponse registrarCliente(RegistroClienteRequest request) {
        if (request.nombres() == null || request.nombres().isBlank()) {
            throw new ReglaNegocioException("El campo nombres es obligatorio");
        }
        if (request.apellidos() == null || request.apellidos().isBlank()) {
            throw new ReglaNegocioException("El campo apellidos es obligatorio");
        }
        if (request.tipoDocumento() == null) {
            throw new ReglaNegocioException("El campo tipoDocumento es obligatorio");
        }
        if (request.numeroDocumento() == null || request.numeroDocumento().isBlank()) {
            throw new ReglaNegocioException("El campo numeroDocumento es obligatorio");
        }
        if (request.correo() == null || request.correo().isBlank()) {
            throw new ReglaNegocioException("El campo correo es obligatorio");
        }
        if (request.telefono() == null || request.telefono().isBlank()) {
            throw new ReglaNegocioException("El campo telefono es obligatorio");
        }
        String telefono = request.telefono().replaceAll("\\D", "");
        if (!telefono.matches("^3[0-9]{9}$")) {
            throw new ReglaNegocioException("El teléfono debe iniciar con 3 y tener 10 dígitos numéricos");
        }
        if (request.fechaNacimiento() == null) {
            throw new ReglaNegocioException("El campo fechaNacimiento es obligatorio");
        }
        if (request.fechaNacimiento().isAfter(LocalDate.now())) {
            throw new ReglaNegocioException("La fecha de nacimiento no puede ser futura");
        }
        if (request.fechaNacimiento().isBefore(LocalDate.of(1900, 1, 1))) {
            throw new ReglaNegocioException("La fecha de nacimiento debe ser a partir del año 1900");
        }
        if (request.ciudadOrigen() == null || request.ciudadOrigen().isBlank()) {
            throw new ReglaNegocioException("El campo ciudadOrigen es obligatorio");
        }
        if (request.contrasena() == null || request.contrasena().isBlank() || request.contrasena().length() < 6) {
            throw new ReglaNegocioException("La contraseña es obligatoria y debe tener al menos 6 caracteres");
        }
        if (request.idiomaPreferido() == null) {
            throw new ReglaNegocioException("El campo idiomaPreferido es obligatorio");
        }
        if (request.canalPreferido() == null) {
            throw new ReglaNegocioException("El campo canalPreferido es obligatorio");
        }
        if (request.anticipacionDias() == null) {
            throw new ReglaNegocioException("El campo anticipacionDias es obligatorio");
        }
        if (request.aceptaPromociones() == null) {
            throw new ReglaNegocioException("El campo aceptaPromociones es obligatorio");
        }

        String correoLimpio = request.correo().trim().toLowerCase();
        String docLimpio = request.numeroDocumento().trim();

        // Regla RN01 / Unificación: Si el cliente ya existía (p. ej. compra presencial) pero sin perfil:
        Optional<Cliente> clienteExistentePorCorreo = clienteRepository.findByCorreoIgnoreCase(correoLimpio);
        Optional<Cliente> clienteExistentePorDoc = clienteRepository.findByTipoDocumentoAndNumeroDocumento(request.tipoDocumento(), docLimpio);

        // Mensaje genérico de duplicidad que no revela la existencia del correo
        if (clienteExistentePorCorreo.isPresent() && perfilClienteRepository.existsById(clienteExistentePorCorreo.get().getIdCliente())) {
            throw new ReglaNegocioException("No fue posible completar el registro. Si ya tiene una cuenta registrada, por favor inicie sesión.");
        }
        if (clienteExistentePorDoc.isPresent() && perfilClienteRepository.existsById(clienteExistentePorDoc.get().getIdCliente())) {
            throw new ReglaNegocioException("No fue posible completar el registro. Si ya tiene una cuenta registrada, por favor inicie sesión.");
        }

        // Si existen dos clientes distintos de mostrador por correo y documento
        if (clienteExistentePorCorreo.isPresent() && clienteExistentePorDoc.isPresent()
                && !clienteExistentePorCorreo.get().getIdCliente().equals(clienteExistentePorDoc.get().getIdCliente())) {
            throw new ReglaNegocioException("No fue posible completar el registro. Los datos ingresados corresponden a registros diferentes.");
        }

        Cliente cliente;
        if (clienteExistentePorCorreo.isPresent()) {
            cliente = clienteExistentePorCorreo.get();
            cliente.setNombres(request.nombres().trim());
            cliente.setApellidos(request.apellidos().trim());
            cliente.setTipoDocumento(request.tipoDocumento());
            cliente.setNumeroDocumento(docLimpio);
            cliente.setTelefono(telefono);
            cliente.setFechaNacimiento(request.fechaNacimiento());
            cliente.setCiudadOrigen(request.ciudadOrigen().trim());
            cliente = clienteRepository.save(cliente);
        } else if (clienteExistentePorDoc.isPresent()) {
            cliente = clienteExistentePorDoc.get();
            cliente.setNombres(request.nombres().trim());
            cliente.setApellidos(request.apellidos().trim());
            cliente.setCorreo(correoLimpio);
            cliente.setTelefono(telefono);
            cliente.setFechaNacimiento(request.fechaNacimiento());
            cliente.setCiudadOrigen(request.ciudadOrigen().trim());
            cliente = clienteRepository.save(cliente);
        } else {
            cliente = new Cliente();
            cliente.setNombres(request.nombres().trim());
            cliente.setApellidos(request.apellidos().trim());
            cliente.setTipoDocumento(request.tipoDocumento());
            cliente.setNumeroDocumento(docLimpio);
            cliente.setCorreo(correoLimpio);
            cliente.setTelefono(telefono);
            cliente.setFechaNacimiento(request.fechaNacimiento());
            cliente.setCiudadOrigen(request.ciudadOrigen().trim());
            cliente = clienteRepository.save(cliente);
        }

        // Crear el perfil del cliente
        PerfilCliente perfil = new PerfilCliente();
        perfil.setCliente(cliente);
        perfil.setContrasenaCifrada(passwordEncoder.encode(request.contrasena()));
        perfil.setIdiomaPreferido(request.idiomaPreferido());
        perfil.setCanalPreferido(request.canalPreferido());
        perfil.setAnticipacionDias(request.anticipacionDias());
        perfil.setAceptaPromociones(request.aceptaPromociones());
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
