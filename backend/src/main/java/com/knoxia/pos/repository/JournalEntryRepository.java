package com.knoxia.pos.repository;

import com.knoxia.pos.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByEntryDateBetweenOrderByEntryDateDescIdDesc(LocalDate from, LocalDate to);
    List<JournalEntry> findAllByOrderByEntryDateDescIdDesc();
}
