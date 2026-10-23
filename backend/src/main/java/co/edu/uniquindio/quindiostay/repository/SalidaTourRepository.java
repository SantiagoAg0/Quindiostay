package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.tours.SalidaTour;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoSalida;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface SalidaTourRepository extends JpaRepository<SalidaTour, Long> {

    @Query(value = "SELECT s FROM SalidaTour s " +
           "JOIN FETCH s.tour t " +
           "JOIN FETCH s.guiaIdioma gi " +
           "JOIN FETCH gi.guia g " +
           "JOIN FETCH gi.idioma i " +
           "WHERE (:idTour IS NULL OR t.idTour = :idTour) " +
           "AND (:estado IS NULL OR s.estado = :estado) " +
           "AND (:fecha IS NULL OR s.fecha = :fecha) " +
           "AND (:texto IS NULL OR LOWER(t.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) " +
           "     OR LOWER(g.nombre) LIKE LOWER(CONCAT('%', :texto, '%')))",
           countQuery = "SELECT COUNT(s) FROM SalidaTour s " +
           "JOIN s.tour t " +
           "JOIN s.guiaIdioma gi " +
           "JOIN gi.guia g " +
           "WHERE (:idTour IS NULL OR t.idTour = :idTour) " +
           "AND (:estado IS NULL OR s.estado = :estado) " +
           "AND (:fecha IS NULL OR s.fecha = :fecha) " +
           "AND (:texto IS NULL OR LOWER(t.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) " +
           "     OR LOWER(g.nombre) LIKE LOWER(CONCAT('%', :texto, '%')))")
    Page<SalidaTour> buscar(
            @Param("idTour") Long idTour,
            @Param("estado") EstadoSalida estado,
            @Param("fecha") LocalDate fecha,
            @Param("texto") String texto,
            Pageable pageable
    );

    @Query("SELECT COUNT(p) FROM Participante p WHERE p.reservaTour.salida.idSalida = :idSalida")
    long contarParticipantes(@Param("idSalida") Long idSalida);

    @Query("SELECT COUNT(rt) FROM ReservaTour rt WHERE rt.salida.idSalida = :idSalida")
    long contarReservas(@Param("idSalida") Long idSalida);

    @Query("SELECT COUNT(s) > 0 FROM SalidaTour s " +
           "WHERE s.guiaIdioma.guia.idGuia = :idGuia " +
           "AND s.fecha = :fecha " +
           "AND s.horaInicio = :horaInicio " +
           "AND (:idSalida IS NULL OR s.idSalida != :idSalida)")
    boolean existeCruceExacto(
            @Param("idGuia") Long idGuia,
            @Param("fecha") LocalDate fecha,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("idSalida") Long idSalida
    );

    @Query("SELECT s FROM SalidaTour s " +
           "WHERE s.guiaIdioma.guia.idGuia = :idGuia " +
           "AND s.fecha = :fecha " +
           "AND s.estado != 'CANCELADA' " +
           "AND (:idSalida IS NULL OR s.idSalida != :idSalida)")
    List<SalidaTour> findSalidasGuiaEnFecha(
            @Param("idGuia") Long idGuia,
            @Param("fecha") LocalDate fecha,
            @Param("idSalida") Long idSalida
    );

    @Query("SELECT s FROM SalidaTour s " +
           "WHERE s.estado = 'REALIZADA' " +
           "AND (:desde IS NULL OR s.fecha >= :desde) " +
           "AND (:hasta IS NULL OR s.fecha <= :hasta)")
    List<SalidaTour> findRealizadasEnRango(
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}
