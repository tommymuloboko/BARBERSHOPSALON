package com.knoxia.pos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_sessions")
public class ServiceSession {

    public enum SessionStatus { PENDING, ACTIVE, COMPLETED, CANCELLED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(optional = false) @JoinColumn(name = "barber_id")
    private Barber barber;

    @ManyToOne(optional = false) @JoinColumn(name = "chair_id")
    private Chair chair;

    @ManyToOne(optional = false) @JoinColumn(name = "service_id")
    private ServiceItem serviceItem;

    @ManyToOne @JoinColumn(name = "booking_id")
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.PENDING;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public Barber getBarber() { return barber; }
    public Chair getChair() { return chair; }
    public ServiceItem getServiceItem() { return serviceItem; }
    public Booking getBooking() { return booking; }
    public SessionStatus getStatus() { return status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }

    public void setId(Long id) { this.id = id; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public void setBarber(Barber barber) { this.barber = barber; }
    public void setChair(Chair chair) { this.chair = chair; }
    public void setServiceItem(ServiceItem serviceItem) { this.serviceItem = serviceItem; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public void setStatus(SessionStatus status) { this.status = status; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
