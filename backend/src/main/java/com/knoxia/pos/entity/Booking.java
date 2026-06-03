package com.knoxia.pos.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
public class Booking {

    public enum BookingStatus { PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne @JoinColumn(name = "barber_id")
    private Barber barber;

    @ManyToOne(optional = false) @JoinColumn(name = "service_id")
    private ServiceItem service;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    private LocalTime startTime;

    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    private String notes;

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public Barber getBarber() { return barber; }
    public ServiceItem getService() { return service; }
    public LocalDate getBookingDate() { return bookingDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public BookingStatus getStatus() { return status; }
    public String getNotes() { return notes; }

    public void setId(Long id) { this.id = id; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public void setBarber(Barber barber) { this.barber = barber; }
    public void setService(ServiceItem service) { this.service = service; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public void setNotes(String notes) { this.notes = notes; }
}
