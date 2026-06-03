package com.knoxia.pos.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "journal_lines")
public class JournalLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_entry_id")
    @JsonBackReference
    private JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal debit = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal credit = BigDecimal.ZERO;

    @Column(length = 250)
    private String memo;

    public Long getId() { return id; }
    public JournalEntry getJournalEntry() { return journalEntry; }
    public Account getAccount() { return account; }
    public BigDecimal getDebit() { return debit; }
    public BigDecimal getCredit() { return credit; }
    public String getMemo() { return memo; }

    public void setId(Long id) { this.id = id; }
    public void setJournalEntry(JournalEntry journalEntry) { this.journalEntry = journalEntry; }
    public void setAccount(Account account) { this.account = account; }
    public void setDebit(BigDecimal debit) { this.debit = debit == null ? BigDecimal.ZERO : debit; }
    public void setCredit(BigDecimal credit) { this.credit = credit == null ? BigDecimal.ZERO : credit; }
    public void setMemo(String memo) { this.memo = memo; }
}
