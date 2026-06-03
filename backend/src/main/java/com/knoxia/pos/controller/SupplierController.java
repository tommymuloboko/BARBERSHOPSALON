package com.knoxia.pos.controller;

import com.knoxia.pos.entity.Supplier;
import com.knoxia.pos.repository.SupplierRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierRepository repo;

    public SupplierController(SupplierRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Supplier> all() { return repo.findAll(); }

    @PostMapping
    public Supplier create(@RequestBody Supplier supplier) {
        supplier.setId(null);
        return repo.save(supplier);
    }

    @PutMapping("/{id}")
    public Supplier update(@PathVariable Long id, @RequestBody Supplier patch) {
        Supplier existing = repo.findById(id).orElseThrow(() -> new RuntimeException("Supplier not found"));
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getContact() != null) existing.setContact(patch.getContact());
        if (patch.getTaxId() != null) existing.setTaxId(patch.getTaxId());
        if (patch.getAddress() != null) existing.setAddress(patch.getAddress());
        if (patch.getNotes() != null) existing.setNotes(patch.getNotes());
        return repo.save(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
