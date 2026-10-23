package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.tours.GuiaIdioma;
import co.edu.uniquindio.quindiostay.domain.entity.tours.GuiaIdiomaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface GuiaIdiomaRepository extends JpaRepository<GuiaIdioma, GuiaIdiomaId> {
    List<GuiaIdioma> findByIdIdGuia(Long idGuia);

    @Query("SELECT gi FROM GuiaIdioma gi WHERE gi.guia.idGuia = :idGuia")
    List<GuiaIdioma> findByGuiaId(@Param("idGuia") Long idGuia);
}
