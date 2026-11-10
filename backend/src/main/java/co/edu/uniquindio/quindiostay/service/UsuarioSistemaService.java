package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Prestador;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Rol;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.UsuarioSistema;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoUsuario;
import co.edu.uniquindio.quindiostay.domain.enums.NombreRol;
import co.edu.uniquindio.quindiostay.dto.usuarios.CrearUsuarioRequest;
import co.edu.uniquindio.quindiostay.dto.usuarios.RolDto;
import co.edu.uniquindio.quindiostay.dto.usuarios.UsuarioSistemaDto;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.PrestadorRepository;
import co.edu.uniquindio.quindiostay.repository.RolRepository;
import co.edu.uniquindio.quindiostay.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioSistemaService {

    private final UsuarioSistemaRepository usuarioSistemaRepository;
    private final RolRepository rolRepository;
    private final PrestadorRepository prestadorRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioSistemaDto> listar() {
        return usuarioSistemaRepository.findAll().stream().map(this::convertirADto).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioSistemaDto obtenerPorId(Long id) {
        UsuarioSistema u = usuarioSistemaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("UsuarioSistema", id));
        return convertirADto(u);
    }

    @Transactional
    public UsuarioSistemaDto crear(CrearUsuarioRequest req) {
        if (usuarioSistemaRepository.findByNombreUsuario(req.nombreUsuario()).isPresent()) {
            throw new ReglaNegocioException("El nombre de usuario '" + req.nombreUsuario() + "' ya existe");
        }

        Rol rol = rolRepository.findById(req.idRol())
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol", req.idRol()));

        // RN13: Rol ENCARGADO_PRESTADOR debe tener prestador asociado
        Prestador prestador = null;
        if (rol.getNombre() == NombreRol.ENCARGADO_PRESTADOR) {
            if (req.idPrestador() == null) {
                throw new ReglaNegocioException("RN13: Un usuario con rol ENCARGADO_PRESTADOR debe tener un prestador asignado");
            }
            prestador = prestadorRepository.findById(req.idPrestador())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Prestador", req.idPrestador()));
        } else if (rol.getNombre() == NombreRol.ADMINISTRADOR_PLATAFORMA && req.idPrestador() != null) {
            throw new ReglaNegocioException("RN13: Un ADMINISTRADOR_PLATAFORMA no debe estar vinculado a un prestador específico");
        } else if (req.idPrestador() != null) {
            prestador = prestadorRepository.findById(req.idPrestador()).orElse(null);
        }

        UsuarioSistema u = new UsuarioSistema();
        u.setNombreUsuario(req.nombreUsuario());
        u.setContrasenaCifrada(passwordEncoder.encode(req.contrasena()));
        u.setEstado(req.estado() != null ? req.estado() : EstadoUsuario.ACTIVO);
        u.setRol(rol);
        u.setPrestador(prestador);

        u = usuarioSistemaRepository.save(u);
        return convertirADto(u);
    }

    @Transactional
    public UsuarioSistemaDto cambiarEstado(Long id, EstadoUsuario nuevoEstado) {
        UsuarioSistema u = usuarioSistemaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("UsuarioSistema", id));
        u.setEstado(nuevoEstado);
        u = usuarioSistemaRepository.save(u);
        return convertirADto(u);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!usuarioSistemaRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("UsuarioSistema", id);
        }
        usuarioSistemaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<RolDto> listarRoles() {
        return rolRepository.findAll().stream()
                .map(r -> new RolDto(r.getIdRol(), r.getNombre().name()))
                .toList();
    }

    private UsuarioSistemaDto convertirADto(UsuarioSistema u) {
        String rolNom = u.getRol() != null ? u.getRol().getNombre().name() : "N/A";
        Long idRol = u.getRol() != null ? u.getRol().getIdRol() : null;
        String prestNom = u.getPrestador() != null ? u.getPrestador().getNombreComercial() : null;
        Long idPrest = u.getPrestador() != null ? u.getPrestador().getIdPrestador() : null;

        return new UsuarioSistemaDto(
                u.getIdUsuario(),
                u.getNombreUsuario(),
                u.getEstado(),
                idRol,
                rolNom,
                idPrest,
                prestNom
        );
    }
}
