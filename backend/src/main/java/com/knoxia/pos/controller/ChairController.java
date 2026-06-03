package com.knoxia.pos.controller;

import com.knoxia.pos.entity.Barber;
import com.knoxia.pos.entity.Chair;
import com.knoxia.pos.repository.BarberRepository;
import com.knoxia.pos.repository.ChairRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chairs")
public class ChairController {

    private final ChairRepository repo;
    private final BarberRepository barberRepo;
    public ChairController(ChairRepository repo, BarberRepository barberRepo) {
        this.repo = repo;
        this.barberRepo = barberRepo;
    }

    @GetMapping
    public List<Chair> all() { return repo.findByActiveTrue(); }

    @GetMapping("/available")
    public List<Chair> available() { return repo.findByStatus(Chair.ChairStatus.EMPTY); }

    @PostMapping
    public Chair create(@RequestBody Chair chair) { return repo.save(chair); }

    @PutMapping("/{id}/status")
    public Chair updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Chair c = repo.findById(id).orElseThrow(() -> new RuntimeException("Chair not found"));
        c.setStatus(Chair.ChairStatus.valueOf(body.get("status")));
        return repo.save(c);
    }

    @PutMapping("/{id}/assigned-barber")
    public Chair updateAssignedBarber(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Chair c = repo.findById(id).orElseThrow(() -> new RuntimeException("Chair not found"));
        Long barberId = body.get("barberId");
        if (barberId == null) {
            c.setAssignedBarber(null);
        } else {
            Barber b = barberRepo.findById(barberId).orElseThrow(() -> new RuntimeException("Barber not found"));
            c.setAssignedBarber(b);
        }
        return repo.save(c);
    }

    @PutMapping("/{id}")
    public Chair update(@PathVariable Long id, @RequestBody Chair patch) {
        Chair c = repo.findById(id).orElseThrow(() -> new RuntimeException("Chair not found"));
        if (patch.getChairNumber() != null) c.setChairNumber(patch.getChairNumber());
        if (patch.getName() != null) c.setName(patch.getName());
        if (patch.getStatus() != null) c.setStatus(patch.getStatus());
        if (patch.getActive() != null) c.setActive(patch.getActive());
        return repo.save(c);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Chair c = repo.findById(id).orElseThrow(() -> new RuntimeException("Chair not found"));
        c.setActive(false);
        c.setAssignedBarber(null);
        repo.save(c);
    }
}
