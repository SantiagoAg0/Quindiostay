package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Plan;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Prestador;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoPrestador;
import co.edu.uniquindio.quindiostay.dto.planes.CrearPlanRequest;
import co.edu.uniquindio.quindiostay.dto.planes.PlanDto;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.PlanRepository;
import co.edu.uniquindio.quindiostay.repository.PrestadorRepository;
import co.edu.uniquindio.quindiostay.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;
    private final PrestadorRepository prestadorRepository;

    @Transactional(readOnly = true)
    public List<PlanDto> listar(Long idPrestadorFiltro) {
        // ENCARGADO_PRESTADOR solo ve planes de su prestador
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            if ("ENCARGADO_PRESTADOR".equalsIgnoreCase(principal.getRol()) && principal.getIdPrestador() != null) {
                idPrestadorFiltro = principal.getIdPrestador();
            }
        }

        List<Plan> planes = planRepository.findAll();
        if (idPrestadorFiltro != null) {
            final Long filtro = idPrestadorFiltro;
            planes = planes.stream()
                    .filter(p -> p.getPrestador() != null && filtro.equals(p.getPrestador().getIdPrestador()))
                    .toList();
        }
        return planes.stream().map(this::convertirADto).toList();
    }

    @Transactional(readOnly = true)
    public PlanDto obtenerPorId(Long id) {
        Plan p = planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan", id));
        return convertirADto(p);
    }

    @Transactional
    public PlanDto crear(CrearPlanRequest req) {
        validarPlan(req);

        Prestador prestador = prestadorRepository.findById(req.idPrestador())
                .orElseThrow(() -> new RecursoNoEncontradoException("Prestador", req.idPrestador()));

        // El prestador debe estar ACTIVO
        if (prestador.getEstado() != EstadoPrestador.ACTIVO) {
            throw new ReglaNegocioException("El prestador debe estar ACTIVO para crear planes");
        }

        // ENCARGADO_PRESTADOR: solo sobre su prestador
        validarAccesoPrestador(prestador.getIdPrestador());

        Plan p = new Plan();
        p.setNombre(req.nombre());
        p.setDescripcion(req.descripcion());
        p.setTipo(req.tipo());
        p.setPrecio(req.precio());
        p.setFechaInicio(req.fechaInicio());
        p.setFechaFin(req.fechaFin());
        p.setEstado(req.estado());
        p.setPrestador(prestador);

        p = planRepository.save(p);
        return convertirADto(p);
    }

    @Transactional
    public PlanDto actualizar(Long id, CrearPlanRequest req) {
        Plan p = planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan", id));

        validarPlan(req);

        Prestador prestador = prestadorRepository.findById(req.idPrestador())
                .orElseThrow(() -> new RecursoNoEncontradoException("Prestador", req.idPrestador()));

        // ENCARGADO_PRESTADOR: solo sobre su prestador
        validarAccesoPrestador(prestador.getIdPrestador());

        p.setNombre(req.nombre());
        p.setDescripcion(req.descripcion());
        p.setTipo(req.tipo());
        p.setPrecio(req.precio());
        p.setFechaInicio(req.fechaInicio());
        p.setFechaFin(req.fechaFin());
        p.setEstado(req.estado());
        p.setPrestador(prestador);

        p = planRepository.save(p);
        return convertirADto(p);
    }

    @Transactional
    public void eliminar(Long id) {
        Plan p = planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan", id));

        // ENCARGADO_PRESTADOR: solo sobre su prestador
        validarAccesoPrestador(p.getPrestador().getIdPrestador());

        planRepository.deleteById(id);
    }

    private void validarPlan(CrearPlanRequest req) {
        if (req.precio() == null || req.precio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ReglaNegocioException("El precio del plan debe ser mayor a 0");
        }
        if (req.fechaInicio() != null && req.fechaFin() != null && !req.fechaFin().isAfter(req.fechaInicio())) {
            throw new ReglaNegocioException("La fecha fin del plan debe ser posterior a la fecha inicio");
        }
    }

    private void validarAccesoPrestador(Long idPrestador) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            if ("ENCARGADO_PRESTADOR".equalsIgnoreCase(principal.getRol())) {
                if (principal.getIdPrestador() == null || !principal.getIdPrestador().equals(idPrestador)) {
                    throw new ReglaNegocioException("No tiene permisos para operar sobre planes de otro prestador");
                }
            }
        }
    }

    private PlanDto convertirADto(Plan p) {
        String prestNombre = p.getPrestador() != null ? p.getPrestador().getNombreComercial() : "N/A";
        Long idPrest = p.getPrestador() != null ? p.getPrestador().getIdPrestador() : null;
        return new PlanDto(
                p.getIdPlan(),
                p.getNombre(),
                p.getDescripcion(),
                p.getTipo(),
                p.getPrecio(),
                p.getFechaInicio(),
                p.getFechaFin(),
                p.getEstado(),
                idPrest,
                prestNombre
        );
    }
}
