package com.knoxia.pos.repository;

import com.knoxia.pos.entity.Barber;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BarberRepository extends JpaRepository<Barber, Long> {
    List<Barber> findByStatus(Barber.BarberStatus status);
    List<Barber> findByActiveTrue();
}
