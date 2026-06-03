package com.knoxia.pos.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    public enum PaymentMethod { CASH, CARD, MOBILE_MONEY }
    public enum PaymentStatus { PENDING, PAID, FAILED, REFUNDED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "sale_id")
    private Sale sale;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Column(nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;

    private String reference;
    private String provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PAID;

    @Column(nullable = false)
    private LocalDateTime paidAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Sale getSale() { return sale; }
    public PaymentMethod getMethod() { return method; }
    public BigDecimal getAmount() { return amount; }
    public String getReference() { return reference; }
    public String getProvider() { return provider; }
    public PaymentStatus getStatus() { return status; }
    public LocalDateTime getPaidAt() { return paidAt; }

    public void setId(Long id) { this.id = id; }
    public void setSale(Sale sale) { this.sale = sale; }
    public void setMethod(PaymentMethod method) { this.method = method; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setReference(String reference) { this.reference = reference; }
    public void setProvider(String provider) { this.provider = provider; }
    public void setStatus(PaymentStatus status) { this.status = status; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}
