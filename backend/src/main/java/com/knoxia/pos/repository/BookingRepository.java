package com.knoxia.pos.repository;

import com.knoxia.pos.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByBookingDate(LocalDate date);
    List<Booking> findByBookingDateOrderByStartTime(LocalDate date);
}
