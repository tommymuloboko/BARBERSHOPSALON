package com.knoxia.pos.controller;

import com.knoxia.pos.entity.Customer;
import com.knoxia.pos.entity.LoyaltyTransaction;
import com.knoxia.pos.repository.CustomerRepository;
import com.knoxia.pos.repository.LoyaltyTransactionRepository;
import com.knoxia.pos.service.LoyaltyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository repo;
    private final LoyaltyTransactionRepository loyaltyRepo;
    private final LoyaltyService loyaltyService;

    public CustomerController(CustomerRepository repo,
                              LoyaltyTransactionRepository loyaltyRepo,
                              LoyaltyService loyaltyService) {
        this.repo = repo;
        this.loyaltyRepo = loyaltyRepo;
        this.loyaltyService = loyaltyService;
    }

    @GetMapping
    public List<Customer> all() { return repo.findAll(); }

    @PostMapping
    public Customer create(@RequestBody Customer customer) { return repo.save(customer); }

    @GetMapping("/search")
    public List<Customer> search(@RequestParam String phone) { return repo.findByPhoneContaining(phone); }

    @GetMapping("/{id}/loyalty")
    public Map<String, Object> loyalty(@PathVariable Long id) {
        Customer c = repo.findById(id).orElseThrow(() -> new RuntimeException("Customer not found"));
        List<LoyaltyTransaction> history = loyaltyRepo.findByCustomerIdOrderByCreatedAtDesc(id);
        return Map.of("customer", c, "points", c.getLoyaltyPoints(), "history", history);
    }
}
