package com.knoxia.pos.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chairs")
public class Chair {

    public enum ChairStatus { EMPTY, OCCUPIED, RESERVED, CLEANING, DISABLED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String chairNumber;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChairStatus status = ChairStatus.EMPTY;

    private Boolean active = true;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_barber_id", unique = true)
    private Barber assignedBarber;

    public Long getId() { return id; }
    public String getChairNumber() { return chairNumber; }
    public String getName() { return name; }
    public ChairStatus getStatus() { return status; }
    public Boolean getActive() { return active; }
    public Barber getAssignedBarber() { return assignedBarber; }

    public void setId(Long id) { this.id = id; }
    public void setChairNumber(String chairNumber) { this.chairNumber = chairNumber; }
    public void setName(String name) { this.name = name; }
    public void setStatus(ChairStatus status) { this.status = status; }
    public void setActive(Boolean active) { this.active = active; }
    public void setAssignedBarber(Barber assignedBarber) { this.assignedBarber = assignedBarber; }
}
