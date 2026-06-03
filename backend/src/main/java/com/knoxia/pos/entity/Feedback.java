package com.knoxia.pos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne @JoinColumn(name = "barber_id")
    private Barber barber;

    @ManyToOne @JoinColumn(name = "service_id")
    private ServiceItem service;

    @ManyToOne @JoinColumn(name = "sale_id")
    private Sale sale;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public Barber getBarber() { return barber; }
    public ServiceItem getService() { return service; }
    public Sale getSale() { return sale; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public void setBarber(Barber barber) { this.barber = barber; }
    public void setService(ServiceItem service) { this.service = service; }
    public void setSale(Sale sale) { this.sale = sale; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
