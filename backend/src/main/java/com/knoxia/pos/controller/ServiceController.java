package com.knoxia.pos.controller;

import com.knoxia.pos.entity.ServiceItem;
import com.knoxia.pos.repository.ServiceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceRepository repo;
    public ServiceController(ServiceRepository repo) { this.repo = repo; }

    @GetMapping
    public List<ServiceItem> all() { return repo.findByActiveTrue(); }

    @PostMapping
    public ServiceItem create(@RequestBody ServiceItem s) { return repo.save(s); }

    @PutMapping("/{id}")
    public ServiceItem update(@PathVariable Long id, @RequestBody ServiceItem patch) {
        ServiceItem s = repo.findById(id).orElseThrow(() -> new RuntimeException("Service not found"));
        if (patch.getName() != null) s.setName(patch.getName());
        if (patch.getDescription() != null) s.setDescription(patch.getDescription());
        if (patch.getPrice() != null) s.setPrice(patch.getPrice());
        if (patch.getEstimatedMinutes() != null) s.setEstimatedMinutes(patch.getEstimatedMinutes());
        if (patch.getActive() != null) s.setActive(patch.getActive());
        return repo.save(s);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        ServiceItem s = repo.findById(id).orElseThrow(() -> new RuntimeException("Service not found"));
        s.setActive(false);
        repo.save(s);
    }
}
