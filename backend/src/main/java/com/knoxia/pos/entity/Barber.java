package com.knoxia.pos.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "barbers")
public class Barber {

    public enum BarberStatus { AVAILABLE, BUSY, ON_BREAK, OFF_DUTY }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String displayName;

    private String specialty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BarberStatus status = BarberStatus.AVAILABLE;

    private BigDecimal commissionRate = BigDecimal.ZERO;

    private Boolean active = true;

    public Long getId() { return id; }
    public String getDisplayName() { return displayName; }
    public String getSpecialty() { return specialty; }
    public BarberStatus getStatus() { return status; }
    public BigDecimal getCommissionRate() { return commissionRate; }
    public Boolean getActive() { return active; }

    public void setId(Long id) { this.id = id; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public void setStatus(BarberStatus status) { this.status = status; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }
    public void setActive(Boolean active) { this.active = active; }
}
