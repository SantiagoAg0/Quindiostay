package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.dto.tours.GuiaResumen;
import co.edu.uniquindio.quindiostay.dto.tours.IdiomaResumen;
import co.edu.uniquindio.quindiostay.dto.tours.TourResumen;
import co.edu.uniquindio.quindiostay.repository.GuiaIdiomaRepository;
import co.edu.uniquindio.quindiostay.repository.GuiaRepository;
import co.edu.uniquindio.quindiostay.repository.IdiomaRepository;
import co.edu.uniquindio.quindiostay.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogoService {

    private final TourRepository tourRepository;
    private final GuiaRepository guiaRepository;
    private final IdiomaRepository idiomaRepository;
    private final GuiaIdiomaRepository guiaIdiomaRepository;

    public List<TourResumen> listarTours() {
        return tourRepository.findAll().stream()
                .map(t -> new TourResumen(t.getIdTour(), t.getNombre(), t.getDuracionHoras(), t.getDificultad(), t.getPrecioPersona()))
                .toList();
    }

    public List<GuiaResumen> listarGuias() {
        return guiaRepository.findAll().stream()
                .map(g -> new GuiaResumen(g.getIdGuia(), g.getNombre()))
                .toList();
    }

    public List<IdiomaResumen> listarIdiomas() {
        return idiomaRepository.findAll().stream()
                .map(i -> new IdiomaResumen(i.getIdIdioma(), i.getNombre()))
                .toList();
    }

    public List<IdiomaResumen> listarIdiomasPorGuia(Long idGuia) {
        return guiaIdiomaRepository.findByGuiaId(idGuia).stream()
                .map(gi -> new IdiomaResumen(gi.getIdioma().getIdIdioma(), gi.getIdioma().getNombre()))
                .toList();
    }
}
