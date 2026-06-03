package com.knoxia.pos.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales")
public class Sale {

    public enum PaymentStatus { PENDING, PAID, PARTIAL, FAILED, REFUNDED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne @JoinColumn(name = "barber_id")
    private Barber barber;

    @ManyToOne @JoinColumn(name = "service_session_id")
    private ServiceSession serviceSession;

    @Column(nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal tip = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public Barber getBarber() { return barber; }
    public ServiceSession getServiceSession() { return serviceSession; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getDiscount() { return discount; }
    public BigDecimal getTip() { return tip; }
    public BigDecimal getTotal() { return total; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public void setBarber(Barber barber) { this.barber = barber; }
    public void setServiceSession(ServiceSession serviceSession) { this.serviceSession = serviceSession; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public void setTip(BigDecimal tip) { this.tip = tip; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
