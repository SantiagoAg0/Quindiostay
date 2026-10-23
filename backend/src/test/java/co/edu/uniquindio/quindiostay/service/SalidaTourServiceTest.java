package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.tours.*;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoSalida;
import co.edu.uniquindio.quindiostay.dto.tours.SalidaTourRequest;
import co.edu.uniquindio.quindiostay.exception.ConflictoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.GuiaIdiomaRepository;
import co.edu.uniquindio.quindiostay.repository.SalidaTourRepository;
import co.edu.uniquindio.quindiostay.repository.TourRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalidaTourServiceTest {

    @Mock
    private SalidaTourRepository salidaTourRepository;

    @Mock
    private TourRepository tourRepository;

    @Mock
    private GuiaIdiomaRepository guiaIdiomaRepository;

    @InjectMocks
    private SalidaTourService salidaTourService;

    private Tour tour;
    private Guia guia;
    private Idioma idioma;
    private GuiaIdioma guiaIdioma;

    @BeforeEach
    void setUp() {
        tour = new Tour();
        tour.setIdTour(1L);
        tour.setNombre("Tour Cafetero");
        tour.setDuracionHoras(new BigDecimal("3.0"));

        guia = new Guia();
        guia.setIdGuia(1L);
        guia.setNombre("Carlos Guía");

        idioma = new Idioma();
        idioma.setIdIdioma(1L);

        guiaIdioma = new GuiaIdioma(guia, idioma);
    }

    @Test
    void crearSalida_GuiaNoHablaIdioma_LanzaReglaNegocioException() {
        var req = new SalidaTourRequest(1L, LocalDate.now().plusDays(2), LocalTime.of(9, 0), 1L, 99L, (short) 10, EstadoSalida.PROGRAMADA);

        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));
        when(guiaIdiomaRepository.findById(any())).thenReturn(Optional.empty());

        ReglaNegocioException ex = assertThrows(ReglaNegocioException.class, () -> salidaTourService.crear(req));
        assertEquals("El guía no habla el idioma seleccionado", ex.getMessage());
    }

    @Test
    void eliminarSalida_ConReservas_LanzaConflictoException() {
        SalidaTour salida = new SalidaTour();
        salida.setIdSalida(10L);

        when(salidaTourRepository.findById(10L)).thenReturn(Optional.of(salida));
        when(salidaTourRepository.contarReservas(10L)).thenReturn(2L);

        ConflictoException ex = assertThrows(ConflictoException.class, () -> salidaTourService.eliminar(10L));
        assertTrue(ex.getMessage().contains("La salida tiene reservas"));
        verify(salidaTourRepository, never()).delete(any());
    }

    @Test
    void crearSalida_CruceHorario_LanzaReglaNegocioException() {
        var req = new SalidaTourRequest(1L, LocalDate.now().plusDays(2), LocalTime.of(9, 0), 1L, 1L, (short) 10, EstadoSalida.PROGRAMADA);

        when(salidaTourRepository.existeCruceExacto(eq(1L), any(), any(), isNull())).thenReturn(true);

        ReglaNegocioException ex = assertThrows(ReglaNegocioException.class, () -> salidaTourService.crear(req));
        assertTrue(ex.getMessage().contains("El guía ya tiene una salida asignada"));
    }
}
