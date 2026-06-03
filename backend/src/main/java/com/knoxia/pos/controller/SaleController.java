package com.knoxia.pos.controller;

import com.knoxia.pos.dto.CreateSaleRequest;
import com.knoxia.pos.dto.PaymentRequest;
import com.knoxia.pos.entity.Payment;
import com.knoxia.pos.entity.Sale;
import com.knoxia.pos.repository.PaymentRepository;
import com.knoxia.pos.repository.SaleRepository;
import com.knoxia.pos.service.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SaleController {

    private final PaymentService paymentService;
    private final SaleRepository saleRepo;
    private final PaymentRepository paymentRepo;

    public SaleController(PaymentService paymentService, SaleRepository saleRepo, PaymentRepository paymentRepo) {
        this.paymentService = paymentService;
        this.saleRepo = saleRepo;
        this.paymentRepo = paymentRepo;
    }

    @PostMapping("/sales")
    public Sale createSale(@RequestBody CreateSaleRequest request) {
        return paymentService.createSale(request);
    }

    @PostMapping("/payments")
    public Payment pay(@RequestBody PaymentRequest request) {
        return paymentService.pay(request);
    }

    @GetMapping("/sales/today")
    public List<Sale> today() {
        LocalDate today = LocalDate.now();
        return saleRepo.findByCreatedAtBetween(today.atStartOfDay(), today.atTime(LocalTime.MAX));
    }

    @GetMapping("/sales/{id}/receipt")
    public Map<String, Object> receipt(@PathVariable Long id) {
        Sale sale = saleRepo.findById(id).orElseThrow(() -> new RuntimeException("Sale not found"));
        return Map.of(
                "sale", sale,
                "payments", paymentRepo.findBySaleId(id),
                "generatedAt", LocalDateTime.now()
        );
    }
}
