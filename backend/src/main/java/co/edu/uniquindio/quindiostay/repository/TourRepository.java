package co.edu.uniquindio.quindiostay.repository;

import co.edu.uniquindio.quindiostay.domain.entity.tours.Tour;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TourRepository extends JpaRepository<Tour, Long> {
}
