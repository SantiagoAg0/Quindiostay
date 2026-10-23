package co.edu.uniquindio.quindiostay.mapper;

import co.edu.uniquindio.quindiostay.domain.entity.tours.SalidaTour;
import co.edu.uniquindio.quindiostay.dto.tours.GuiaResumen;
import co.edu.uniquindio.quindiostay.dto.tours.IdiomaResumen;
import co.edu.uniquindio.quindiostay.dto.tours.SalidaTourResponse;
import co.edu.uniquindio.quindiostay.dto.tours.TourResumen;
import java.math.BigDecimal;
import java.time.LocalTime;

public final class SalidaTourMapper {

    private SalidaTourMapper() {}

    public static SalidaTourResponse aResponse(SalidaTour salida, long cuposOcupados) {
        if (salida == null) return null;

        var tour = salida.getTour();
        var guia = salida.getGuia();
        var idioma = salida.getIdioma();

        TourResumen tourResumen = tour != null ? new TourResumen(
                tour.getIdTour(),
                tour.getNombre(),
                tour.getDuracionHoras(),
                tour.getDificultad(),
                tour.getPrecioPersona()
        ) : null;

        GuiaResumen guiaResumen = guia != null ? new GuiaResumen(
                guia.getIdGuia(),
                guia.getNombre()
        ) : null;

        IdiomaResumen idiomaResumen = idioma != null ? new IdiomaResumen(
                idioma.getIdIdioma(),
                idioma.getNombre()
        ) : null;

        LocalTime horaFin = null;
        if (salida.getHoraInicio() != null && tour != null && tour.getDuracionHoras() != null) {
            BigDecimal horas = tour.getDuracionHoras();
            int minutos = (int) Math.round(horas.doubleValue() * 60);
            horaFin = salida.getHoraInicio().plusMinutes(minutos);
        }

        short cupoTotal = salida.getCupo() != null ? salida.getCupo() : 0;
        long disponibles = Math.max(0, cupoTotal - cuposOcupados);

        return new SalidaTourResponse(
                salida.getIdSalida(),
                tourResumen,
                guiaResumen,
                idiomaResumen,
                salida.getFecha(),
                salida.getHoraInicio(),
                horaFin,
                salida.getCupo(),
                cuposOcupados,
                disponibles,
                salida.getEstado()
        );
    }
}
