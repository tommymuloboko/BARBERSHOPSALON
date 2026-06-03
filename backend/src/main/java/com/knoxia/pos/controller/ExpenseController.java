package com.knoxia.pos.controller;

import com.knoxia.pos.entity.Expense;
import com.knoxia.pos.repository.ExpenseRepository;
import com.knoxia.pos.service.AccountingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository repo;
    private final AccountingService accountingService;

    public ExpenseController(ExpenseRepository repo, AccountingService accountingService) {
        this.repo = repo;
        this.accountingService = accountingService;
    }

    @GetMapping
    public List<Expense> all() { return repo.findAll(); }

    @PostMapping
    public Expense create(@RequestBody Expense expense) {
        expense.setId(null);
        Expense saved = repo.save(expense);
        try { accountingService.postExpense(saved); } catch (Exception ignored) { }
        return saved;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
