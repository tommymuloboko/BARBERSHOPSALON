package com.knoxia.pos.controller;

import com.knoxia.pos.dto.PostJournalRequest;
import com.knoxia.pos.entity.Account;
import com.knoxia.pos.entity.JournalEntry;
import com.knoxia.pos.service.AccountingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounting")
public class AccountingController {

    private final AccountingService service;

    public AccountingController(AccountingService service) {
        this.service = service;
    }

    @GetMapping("/accounts")
    public List<Account> accounts() { return service.listAccounts(); }

    @PostMapping("/accounts")
    public Account createAccount(@RequestBody Account a) { return service.createAccount(a); }

    @GetMapping("/journals")
    public List<JournalEntry> journals() { return service.listJournals(); }

    @PostMapping("/journals")
    public JournalEntry postJournal(@RequestBody PostJournalRequest req) { return service.postJournal(req); }

    @GetMapping("/reports/trial-balance")
    public List<Map<String, Object>> trialBalance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOf) {
        return service.trialBalance(asOf);
    }

    @GetMapping("/reports/income-statement")
    public Map<String, Object> incomeStatement(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.incomeStatement(from, to);
    }

    @GetMapping("/reports/balance-sheet")
    public Map<String, Object> balanceSheet(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOf) {
        return service.balanceSheet(asOf);
    }
}
