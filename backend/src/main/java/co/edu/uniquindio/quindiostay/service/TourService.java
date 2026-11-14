package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.tours.Tour;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoPrestador;
import co.edu.uniquindio.quindiostay.domain.enums.NombreTipoPrestador;
import co.edu.uniquindio.quindiostay.dto.tours.CategoriaTourDto;
import co.edu.uniquindio.quindiostay.dto.tours.CrearTourRequest;
import co.edu.uniquindio.quindiostay.dto.tours.TourDetalleDto;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.CategoriaTourRepository;
import co.edu.uniquindio.quindiostay.repository.PrestadorRepository;
import co.edu.uniquindio.quindiostay.repository.TourRepository;
import co.edu.uniquindio.quindiostay.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final CategoriaTourRepository categoriaTourRepository;
    private final PrestadorRepository prestadorRepository;

    @Transactional(readOnly = true)
    public List<TourDetalleDto> listarTodos() {
        return tourRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
    }

    @Transactional(readOnly = true)
    public TourDetalleDto obtenerPorId(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Tour", id));
        return convertirADto(tour);
    }

    @Transactional
    public TourDetalleDto crear(CrearTourRequest request) {
        var categoria = categoriaTourRepository.findById(request.idCategoria())
                .orElseThrow(() -> new RecursoNoEncontradoException("CategoriaTour", request.idCategoria()));
        var prestador = prestadorRepository.findById(request.idPrestador())
                .orElseThrow(() -> new RecursoNoEncontradoException("Prestador", request.idPrestador()));

        // RN12: Solo prestadores de tipo GUIANZA pueden publicar tours
        if (prestador.getTipoPrestador().getNombre() != NombreTipoPrestador.GUIANZA) {
            throw new ReglaNegocioException("RN12: Solo prestadores de tipo GUIANZA pueden publicar tours. El prestador '"
                    + prestador.getNombreComercial() + "' es de tipo " + prestador.getTipoPrestador().getNombre());
        }

        // El prestador debe estar ACTIVO
        if (prestador.getEstado() != EstadoPrestador.ACTIVO) {
            throw new ReglaNegocioException("D07: El prestador debe estar ACTIVO para publicar tours");
        }

        // ENCARGADO_PRESTADOR: solo sobre su prestador
        validarAccesoPrestador(prestador.getIdPrestador());

        Tour tour = new Tour();
        tour.setNombre(request.nombre());
        tour.setDescripcion(request.descripcion());
        tour.setDuracionHoras(request.duracionHoras());
        tour.setDificultad(request.dificultad());
        tour.setEdadMinima(request.edadMinima());
        tour.setPrecioPersona(request.precioPersona());
        tour.setCategoria(categoria);
        tour.setPrestador(prestador);

        tour = tourRepository.save(tour);
        return convertirADto(tour);
    }

    @Transactional
    public TourDetalleDto actualizar(Long id, CrearTourRequest request) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Tour", id));
        var categoria = categoriaTourRepository.findById(request.idCategoria())
                .orElseThrow(() -> new RecursoNoEncontradoException("CategoriaTour", request.idCategoria()));
        var prestador = prestadorRepository.findById(request.idPrestador())
                .orElseThrow(() -> new RecursoNoEncontradoException("Prestador", request.idPrestador()));

        // RN12
        if (prestador.getTipoPrestador().getNombre() != NombreTipoPrestador.GUIANZA) {
            throw new ReglaNegocioException("RN12: Solo prestadores de tipo GUIANZA pueden publicar tours");
        }

        // ENCARGADO_PRESTADOR: solo sobre su prestador
        validarAccesoPrestador(prestador.getIdPrestador());

        tour.setNombre(request.nombre());
        tour.setDescripcion(request.descripcion());
        tour.setDuracionHoras(request.duracionHoras());
        tour.setDificultad(request.dificultad());
        tour.setEdadMinima(request.edadMinima());
        tour.setPrecioPersona(request.precioPersona());
        tour.setCategoria(categoria);
        tour.setPrestador(prestador);

        tour = tourRepository.save(tour);
        return convertirADto(tour);
    }

    @Transactional
    public void eliminar(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Tour", id));

        // ENCARGADO_PRESTADOR: solo sobre su prestador
        validarAccesoPrestador(tour.getPrestador().getIdPrestador());

        tourRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CategoriaTourDto> listarCategorias() {
        return categoriaTourRepository.findAll().stream()
                .map(c -> new CategoriaTourDto(c.getIdCategoria(), c.getNombre().name(), c.getDescripcion()))
                .toList();
    }

    private void validarAccesoPrestador(Long idPrestadorTour) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            if ("ENCARGADO_PRESTADOR".equalsIgnoreCase(principal.getRol())) {
                if (principal.getIdPrestador() == null || !principal.getIdPrestador().equals(idPrestadorTour)) {
                    throw new ReglaNegocioException("No tiene permisos para operar sobre tours de otro prestador");
                }
            }
        }
    }

    private TourDetalleDto convertirADto(Tour t) {
        String catNombre = t.getCategoria() != null ? t.getCategoria().getNombre().name() : "N/A";
        String prestNombre = t.getPrestador() != null ? t.getPrestador().getNombreComercial() : "N/A";
        return new TourDetalleDto(
                t.getIdTour(),
                t.getNombre(),
                t.getDescripcion(),
                t.getDuracionHoras(),
                t.getDificultad(),
                t.getEdadMinima(),
                t.getPrecioPersona(),
                t.getCategoria() != null ? t.getCategoria().getIdCategoria() : null,
                catNombre,
                t.getPrestador() != null ? t.getPrestador().getIdPrestador() : null,
                prestNombre
        );
    }
}
