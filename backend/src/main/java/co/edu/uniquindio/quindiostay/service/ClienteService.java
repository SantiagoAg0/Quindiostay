package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Cliente;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.PerfilCliente;
import co.edu.uniquindio.quindiostay.domain.enums.AceptaPromociones;
import co.edu.uniquindio.quindiostay.domain.enums.CanalPreferido;
import co.edu.uniquindio.quindiostay.domain.enums.IdiomaPreferido;
import co.edu.uniquindio.quindiostay.dto.clientes.ActualizarPerfilRequest;
import co.edu.uniquindio.quindiostay.dto.clientes.ClienteDto;
import co.edu.uniquindio.quindiostay.dto.clientes.CrearClienteRequest;
import co.edu.uniquindio.quindiostay.dto.clientes.ModificarClienteRequest;
import co.edu.uniquindio.quindiostay.exception.ConflictoException;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.ClienteRepository;
import co.edu.uniquindio.quindiostay.repository.PerfilClienteRepository;
import co.edu.uniquindio.quindiostay.repository.ReservaRepository;
import co.edu.uniquindio.quindiostay.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PerfilClienteRepository perfilClienteRepository;
    private final ReservaRepository reservaRepository;

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

    @Transactional
    public ClienteDto crearClienteMostrador(CrearClienteRequest req) {
        String correoLimpio = req.correo().trim().toLowerCase();
        if (clienteRepository.existsByCorreo(correoLimpio)) {
            throw new ConflictoException("Ya existe un cliente registrado con el correo: " + correoLimpio);
        }
        if (clienteRepository.existsByTipoDocumentoAndNumeroDocumento(req.tipoDocumento(), req.numeroDocumento().trim())) {
            throw new ConflictoException("Ya existe un cliente registrado con el documento: " + req.tipoDocumento() + " " + req.numeroDocumento().trim());
        }

        String tel = req.telefono().replaceAll("\\D", "");
        if (!tel.matches("^3[0-9]{9}$")) {
            throw new ReglaNegocioException("El teléfono debe iniciar con 3 y tener 10 dígitos");
        }
        if (req.fechaNacimiento().isAfter(LocalDate.now())) {
            throw new ReglaNegocioException("La fecha de nacimiento no puede ser futura");
        }
        if (req.fechaNacimiento().isBefore(LocalDate.of(1900, 1, 1))) {
            throw new ReglaNegocioException("La fecha de nacimiento debe ser posterior a 1900");
        }

        Cliente c = new Cliente();
        c.setNombres(req.nombres().trim());
        c.setApellidos(req.apellidos().trim());
        c.setTipoDocumento(req.tipoDocumento());
        c.setNumeroDocumento(req.numeroDocumento().trim());
        c.setCorreo(correoLimpio);
        c.setTelefono(tel);
        c.setFechaNacimiento(req.fechaNacimiento());
        c.setCiudadOrigen(req.ciudadOrigen().trim());
        c = clienteRepository.save(c);

        return convertirADto(c);
    }

    @Transactional
    public ClienteDto modificarCliente(Long id, ModificarClienteRequest req) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", id));

        String correoLimpio = req.correo().trim().toLowerCase();
        var existentePorCorreo = clienteRepository.findByCorreo(correoLimpio);
        if (existentePorCorreo.isPresent() && !existentePorCorreo.get().getIdCliente().equals(id)) {
            throw new ConflictoException("Ya existe otro cliente con el correo: " + correoLimpio);
        }

        String tel = req.telefono().replaceAll("\\D", "");
        if (!tel.matches("^3[0-9]{9}$")) {
            throw new ReglaNegocioException("El teléfono debe iniciar con 3 y tener 10 dígitos");
        }
        if (req.fechaNacimiento().isAfter(LocalDate.now())) {
            throw new ReglaNegocioException("La fecha de nacimiento no puede ser futura");
        }

        c.setNombres(req.nombres().trim());
        c.setApellidos(req.apellidos().trim());
        c.setCorreo(correoLimpio);
        c.setTelefono(tel);
        c.setFechaNacimiento(req.fechaNacimiento());
        c.setCiudadOrigen(req.ciudadOrigen().trim());
        c = clienteRepository.save(c);

        return convertirADto(c);
    }

    @Transactional
    public void eliminarCliente(Long id) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", id));

        long reservas = reservaRepository.countByClienteIdCliente(id);
        if (reservas > 0) {
            throw new ConflictoException("No se puede eliminar el cliente porque tiene reservas registradas (" + reservas + " reservas).");
        }

        perfilClienteRepository.deleteById(id);
        clienteRepository.delete(c);
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
