package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Pago;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Prestador;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Reserva;
import co.edu.uniquindio.quindiostay.domain.entity.tours.*;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoPago;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoPrestador;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoReserva;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoSalida;
import co.edu.uniquindio.quindiostay.domain.enums.NombreIdioma;
import co.edu.uniquindio.quindiostay.dto.tours.SalidaTourRequest;
import co.edu.uniquindio.quindiostay.exception.ConflictoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
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

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private NotificacionRepository notificacionRepository;

    @InjectMocks
    private SalidaTourService salidaTourService;

    private Tour tour;
    private Prestador prestador;
    private Guia guia;
    private Idioma idioma;
    private GuiaIdioma guiaIdioma;

    @BeforeEach
    void setUp() {
        prestador = new Prestador();
        prestador.setIdPrestador(1L);
        prestador.setNombreComercial("Quindío Aventura");
        prestador.setEstado(EstadoPrestador.ACTIVO);

        tour = new Tour();
        tour.setIdTour(1L);
        tour.setNombre("Tour Cafetero");
        tour.setDuracionHoras(new BigDecimal("3.0"));
        tour.setPrestador(prestador);

        guia = new Guia();
        guia.setIdGuia(1L);
        guia.setNombre("Carlos Guía");

        idioma = new Idioma();
        idioma.setIdIdioma(1L);
        idioma.setNombre(NombreIdioma.ESPAÑOL);

        guiaIdioma = new GuiaIdioma(guia, idioma);
    }

    @Test
    void crearSalida_GuiaNoHablaIdioma_LanzaReglaNegocioException() {
        var req = new SalidaTourRequest(1L, LocalDate.now().plusDays(2), LocalTime.of(9, 0), 1L, 99L, (short) 10, EstadoSalida.PROGRAMADA);

        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));
        when(guiaIdiomaRepository.findById(any())).thenReturn(Optional.empty());

        ReglaNegocioException ex = assertThrows(ReglaNegocioException.class, () -> salidaTourService.crear(req));
        assertTrue(ex.getMessage().contains("El guia no habla el idioma seleccionado"));
    }

    @Test
    void eliminarSalida_ConReservas_LanzaConflictoException() {
        SalidaTour salida = new SalidaTour();
        salida.setIdSalida(10L);
        salida.setTour(tour);

        when(salidaTourRepository.findById(10L)).thenReturn(Optional.of(salida));
        when(salidaTourRepository.contarReservas(10L)).thenReturn(2L);

        ConflictoException ex = assertThrows(ConflictoException.class, () -> salidaTourService.eliminar(10L));
        assertTrue(ex.getMessage().contains("La salida tiene reservas"));
        verify(salidaTourRepository, never()).delete(any());
    }

    @Test
    void crearSalida_CruceHorario_LanzaReglaNegocioException() {
        var req = new SalidaTourRequest(1L, LocalDate.now().plusDays(2), LocalTime.of(9, 0), 1L, 1L, (short) 10, EstadoSalida.PROGRAMADA);

        SalidaTour existente = new SalidaTour();
        existente.setIdSalida(20L);
        existente.setTour(tour);
        existente.setFecha(req.fecha());
        existente.setHoraInicio(LocalTime.of(8, 0)); // 8:00 a 11:00 se cruza con 9:00 a 12:00

        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));
        when(guiaIdiomaRepository.findById(any())).thenReturn(Optional.of(guiaIdioma));
        when(salidaTourRepository.findSalidasGuiaEnFecha(eq(1L), eq(req.fecha()), isNull()))
                .thenReturn(List.of(existente));

        ReglaNegocioException ex = assertThrows(ReglaNegocioException.class, () -> salidaTourService.crear(req));
        assertTrue(ex.getMessage().contains("RN04: El guia ya tiene asignada la salida"));
    }

    @Test
    void crearSalida_PrestadorInactivo_LanzaReglaNegocioException() {
        prestador.setEstado(EstadoPrestador.SUSPENDIDO);
        var req = new SalidaTourRequest(1L, LocalDate.now().plusDays(2), LocalTime.of(9, 0), 1L, 1L, (short) 10, EstadoSalida.PROGRAMADA);

        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));

        ReglaNegocioException ex = assertThrows(ReglaNegocioException.class, () -> salidaTourService.crear(req));
        assertTrue(ex.getMessage().contains("D07:"));
    }

    @Test
    void modificarSalida_EstadoCanceladaNoPermitido_LanzaExcepcion() {
        SalidaTour salida = new SalidaTour();
        salida.setIdSalida(10L);
        salida.setTour(tour);
        salida.setEstado(EstadoSalida.PROGRAMADA);

        var req = new SalidaTourRequest(1L, LocalDate.now().plusDays(2), LocalTime.of(9, 0), 1L, 1L, (short) 10, EstadoSalida.CANCELADA);

        when(salidaTourRepository.findById(10L)).thenReturn(Optional.of(salida));
        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));

        ReglaNegocioException ex = assertThrows(ReglaNegocioException.class, () -> salidaTourService.modificar(10L, req));
        assertTrue(ex.getMessage().contains("D05:"));
    }

    @Test
    void modificarSalida_RealizadaSoloDesdeProgramada() {
        SalidaTour salida = new SalidaTour();
        salida.setIdSalida(10L);
        salida.setTour(tour);
        salida.setEstado(EstadoSalida.CANCELADA);

        var req = new SalidaTourRequest(1L, LocalDate.now().minusDays(1), LocalTime.of(9, 0), 1L, 1L, (short) 10, EstadoSalida.REALIZADA);

        when(salidaTourRepository.findById(10L)).thenReturn(Optional.of(salida));

        ReglaNegocioException ex = assertThrows(ReglaNegocioException.class, () -> salidaTourService.modificar(10L, req));
        assertTrue(ex.getMessage().contains("D06:"));
    }

    @Test
    void cancelarSalida_Reembolsa100Porciento() {
        SalidaTour salida = new SalidaTour();
        salida.setIdSalida(10L);
        salida.setTour(tour);
        salida.setEstado(EstadoSalida.PROGRAMADA);

        Reserva reserva = new Reserva();
        reserva.setIdReserva(50L);
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setValorTotal(new BigDecimal("150000.00"));

        when(salidaTourRepository.findById(10L)).thenReturn(Optional.of(salida));
        when(salidaTourRepository.save(any(SalidaTour.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reservaRepository.findBySalidaId(10L)).thenReturn(List.of(reserva));
        when(pagoRepository.sumExitososPorReserva(50L)).thenReturn(new BigDecimal("150000.00"));
        when(pagoRepository.sumReembolsadosPorReserva(50L)).thenReturn(BigDecimal.ZERO);
        when(salidaTourRepository.contarParticipantes(10L)).thenReturn(0L);

        var resp = salidaTourService.cancelar(10L);

        assertEquals(EstadoSalida.CANCELADA, resp.estado());
        assertEquals(EstadoReserva.CANCELADA, reserva.getEstado());
        verify(pagoRepository).save(argThat(pago ->
                pago.getEstado() == EstadoPago.REEMBOLSADO &&
                pago.getMonto().compareTo(new BigDecimal("150000.00")) == 0
        ));
    }
}
