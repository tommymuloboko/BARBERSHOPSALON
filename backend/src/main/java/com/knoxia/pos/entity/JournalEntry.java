package com.knoxia.pos.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "journal_entries")
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate entryDate = LocalDate.now();

    private String reference;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 32)
    private String source = "MANUAL";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<JournalLine> lines = new ArrayList<>();

    public Long getId() { return id; }
    public LocalDate getEntryDate() { return entryDate; }
    public String getReference() { return reference; }
    public String getDescription() { return description; }
    public String getSource() { return source; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<JournalLine> getLines() { return lines; }

    public void setId(Long id) { this.id = id; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }
    public void setReference(String reference) { this.reference = reference; }
    public void setDescription(String description) { this.description = description; }
    public void setSource(String source) { this.source = source; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setLines(List<JournalLine> lines) { this.lines = lines; }
}
