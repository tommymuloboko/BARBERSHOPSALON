package com.knoxia.pos.controller;

import com.knoxia.pos.dto.FeedbackRequest;
import com.knoxia.pos.entity.*;
import com.knoxia.pos.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository repo;
    private final CustomerRepository customerRepo;
    private final BarberRepository barberRepo;
    private final ServiceRepository serviceRepo;
    private final SaleRepository saleRepo;

    public FeedbackController(FeedbackRepository repo,
                              CustomerRepository customerRepo,
                              BarberRepository barberRepo,
                              ServiceRepository serviceRepo,
                              SaleRepository saleRepo) {
        this.repo = repo;
        this.customerRepo = customerRepo;
        this.barberRepo = barberRepo;
        this.serviceRepo = serviceRepo;
        this.saleRepo = saleRepo;
    }

    @PostMapping
    public Feedback create(@RequestBody FeedbackRequest r) {
        Feedback f = new Feedback();
        if (r.getCustomerId() != null) f.setCustomer(customerRepo.findById(r.getCustomerId()).orElse(null));
        if (r.getBarberId() != null) f.setBarber(barberRepo.findById(r.getBarberId()).orElse(null));
        if (r.getServiceId() != null) f.setService(serviceRepo.findById(r.getServiceId()).orElse(null));
        if (r.getSaleId() != null) f.setSale(saleRepo.findById(r.getSaleId()).orElse(null));
        f.setRating(r.getRating());
        f.setComment(r.getComment());
        return repo.save(f);
    }

    @GetMapping("/barber/{barberId}")
    public List<Feedback> byBarber(@PathVariable Long barberId) {
        return repo.findByBarberId(barberId);
    }
}
