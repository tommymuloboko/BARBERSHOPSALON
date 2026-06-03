package com.knoxia.pos.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 16)
    private String code;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private AccountType type;

    @Column(nullable = false)
    private boolean active = true;

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public AccountType getType() { return type; }
    public boolean isActive() { return active; }

    public void setId(Long id) { this.id = id; }
    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setType(AccountType type) { this.type = type; }
    public void setActive(boolean active) { this.active = active; }
}
