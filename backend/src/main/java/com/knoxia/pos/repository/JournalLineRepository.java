package com.knoxia.pos.repository;

import com.knoxia.pos.entity.JournalLine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JournalLineRepository extends JpaRepository<JournalLine, Long> {
    List<JournalLine> findByJournalEntry_EntryDateBetween(java.time.LocalDate from, java.time.LocalDate to);
    List<JournalLine> findByJournalEntry_EntryDateLessThanEqual(java.time.LocalDate asOf);
}
