package com.knoxia.pos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PostJournalRequest {
    private LocalDate entryDate;
    private String reference;
    private String description;
    private List<Line> lines;

    public LocalDate getEntryDate() { return entryDate; }
    public String getReference() { return reference; }
    public String getDescription() { return description; }
    public List<Line> getLines() { return lines; }

    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }
    public void setReference(String reference) { this.reference = reference; }
    public void setDescription(String description) { this.description = description; }
    public void setLines(List<Line> lines) { this.lines = lines; }

    public static class Line {
        private String accountCode;
        private BigDecimal debit;
        private BigDecimal credit;
        private String memo;

        public String getAccountCode() { return accountCode; }
        public BigDecimal getDebit() { return debit; }
        public BigDecimal getCredit() { return credit; }
        public String getMemo() { return memo; }

        public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
        public void setDebit(BigDecimal debit) { this.debit = debit; }
        public void setCredit(BigDecimal credit) { this.credit = credit; }
        public void setMemo(String memo) { this.memo = memo; }
    }
}
