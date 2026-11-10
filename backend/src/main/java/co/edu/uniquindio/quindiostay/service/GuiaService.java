package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.tours.Guia;
import co.edu.uniquindio.quindiostay.domain.entity.tours.GuiaIdioma;
import co.edu.uniquindio.quindiostay.domain.entity.tours.Idioma;
import co.edu.uniquindio.quindiostay.dto.tours.CrearGuiaRequest;
import co.edu.uniquindio.quindiostay.dto.tours.GuiaDetalleDto;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.GuiaIdiomaRepository;
import co.edu.uniquindio.quindiostay.repository.GuiaRepository;
import co.edu.uniquindio.quindiostay.repository.IdiomaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuiaService {

    private final GuiaRepository guiaRepository;
    private final GuiaIdiomaRepository guiaIdiomaRepository;
    private final IdiomaRepository idiomaRepository;

    @Transactional(readOnly = true)
    public List<GuiaDetalleDto> listarTodos() {
        return guiaRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
    }

    @Transactional(readOnly = true)
    public GuiaDetalleDto obtenerPorId(Long id) {
        Guia guia = guiaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Guia", id));
        return convertirADto(guia);
    }

    @Transactional
    public GuiaDetalleDto crear(CrearGuiaRequest request) {
        if (request.idiomasIds() == null || request.idiomasIds().isEmpty()) {
            throw new ReglaNegocioException("RN08: Todo guía debe hablar al menos un idioma");
        }

        Guia guia = new Guia();
        guia.setNombre(request.nombre());
        guia.setDocumento(request.documento());
        guia.setTarjetaProfesional(request.tarjetaProfesional());
        guia = guiaRepository.save(guia);

        for (Long idIdioma : request.idiomasIds()) {
            Idioma idioma = idiomaRepository.findById(idIdioma)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Idioma", idIdioma));
            guiaIdiomaRepository.save(new GuiaIdioma(guia, idioma));
        }

        return convertirADto(guia);
    }

    @Transactional
    public GuiaDetalleDto actualizar(Long id, CrearGuiaRequest request) {
        Guia guia = guiaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Guia", id));

        if (request.idiomasIds() == null || request.idiomasIds().isEmpty()) {
            throw new ReglaNegocioException("RN08: Todo guía debe hablar al menos un idioma");
        }

        guia.setNombre(request.nombre());
        guia.setDocumento(request.documento());
        guia.setTarjetaProfesional(request.tarjetaProfesional());
        guia = guiaRepository.save(guia);

        // Actualizar idiomas asociados
        List<GuiaIdioma> actuales = guiaIdiomaRepository.findByGuiaId(id);
        guiaIdiomaRepository.deleteAll(actuales);

        for (Long idIdioma : request.idiomasIds()) {
            Idioma idioma = idiomaRepository.findById(idIdioma)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Idioma", idIdioma));
            guiaIdiomaRepository.save(new GuiaIdioma(guia, idioma));
        }

        return convertirADto(guia);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!guiaRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Guia", id);
        }
        List<GuiaIdioma> actuales = guiaIdiomaRepository.findByGuiaId(id);
        guiaIdiomaRepository.deleteAll(actuales);
        guiaRepository.deleteById(id);
    }

    private GuiaDetalleDto convertirADto(Guia g) {
        List<GuiaIdioma> gis = guiaIdiomaRepository.findByGuiaId(g.getIdGuia());
        List<Long> ids = new ArrayList<>();
        List<String> nombres = new ArrayList<>();
        for (GuiaIdioma gi : gis) {
            ids.add(gi.getIdioma().getIdIdioma());
            nombres.add(gi.getIdioma().getNombre().name());
        }
        return new GuiaDetalleDto(g.getIdGuia(), g.getNombre(), g.getDocumento(), g.getTarjetaProfesional(), ids, nombres);
    }
}
