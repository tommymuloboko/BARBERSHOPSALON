package com.knoxia.pos.controller;

import com.knoxia.pos.entity.Booking;
import com.knoxia.pos.repository.BookingRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository repo;
    public BookingController(BookingRepository repo) { this.repo = repo; }

    @PostMapping
    public Booking create(@RequestBody Booking b) {
        if (b.getStatus() == null) b.setStatus(Booking.BookingStatus.PENDING);
        return repo.save(b);
    }

    @GetMapping("/today")
    public List<Booking> today() { return repo.findByBookingDateOrderByStartTime(LocalDate.now()); }

    @GetMapping("/date/{date}")
    public List<Booking> byDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return repo.findByBookingDateOrderByStartTime(date);
    }

    @PutMapping("/{id}/confirm")
    public Booking confirm(@PathVariable Long id) { return setStatus(id, Booking.BookingStatus.CONFIRMED); }

    @PutMapping("/{id}/cancel")
    public Booking cancel(@PathVariable Long id) { return setStatus(id, Booking.BookingStatus.CANCELLED); }

    @PutMapping("/{id}/check-in")
    public Booking checkIn(@PathVariable Long id) { return setStatus(id, Booking.BookingStatus.CHECKED_IN); }

    private Booking setStatus(Long id, Booking.BookingStatus s) {
        Booking b = repo.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        b.setStatus(s);
        return repo.save(b);
    }
}
