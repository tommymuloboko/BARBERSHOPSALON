package com.knoxia.pos.controller;

import com.knoxia.pos.entity.Barber;
import com.knoxia.pos.repository.BarberRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/barbers")
public class BarberController {

    private final BarberRepository repo;
    public BarberController(BarberRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Barber> all() { return repo.findByActiveTrue(); }

    @GetMapping("/available")
    public List<Barber> available() { return repo.findByStatus(Barber.BarberStatus.AVAILABLE); }

    @PostMapping
    public Barber create(@RequestBody Barber barber) { return repo.save(barber); }

    @PutMapping("/{id}/status")
    public Barber updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Barber b = repo.findById(id).orElseThrow(() -> new RuntimeException("Barber not found"));
        b.setStatus(Barber.BarberStatus.valueOf(body.get("status")));
        return repo.save(b);
    }

    @PutMapping("/{id}")
    public Barber update(@PathVariable Long id, @RequestBody Barber patch) {
        Barber b = repo.findById(id).orElseThrow(() -> new RuntimeException("Barber not found"));
        if (patch.getDisplayName() != null) b.setDisplayName(patch.getDisplayName());
        if (patch.getSpecialty() != null) b.setSpecialty(patch.getSpecialty());
        if (patch.getStatus() != null) b.setStatus(patch.getStatus());
        if (patch.getCommissionRate() != null) b.setCommissionRate(patch.getCommissionRate());
        if (patch.getActive() != null) b.setActive(patch.getActive());
        return repo.save(b);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Barber b = repo.findById(id).orElseThrow(() -> new RuntimeException("Barber not found"));
        b.setActive(false);
        repo.save(b);
    }
}
