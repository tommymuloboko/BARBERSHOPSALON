package com.knoxia.pos.controller;

import com.knoxia.pos.entity.InventoryItem;
import com.knoxia.pos.repository.InventoryItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryItemRepository repo;

    public InventoryController(InventoryItemRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<InventoryItem> all() { return repo.findAll(); }

    @PostMapping
    public InventoryItem create(@RequestBody InventoryItem item) {
        item.setId(null);
        return repo.save(item);
    }

    @PutMapping("/{id}")
    public InventoryItem update(@PathVariable Long id, @RequestBody InventoryItem patch) {
        InventoryItem existing = repo.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getSku() != null) existing.setSku(patch.getSku());
        if (patch.getUnit() != null) existing.setUnit(patch.getUnit());
        if (patch.getQuantity() != null) existing.setQuantity(patch.getQuantity());
        if (patch.getReorderLevel() != null) existing.setReorderLevel(patch.getReorderLevel());
        if (patch.getUnitCost() != null) existing.setUnitCost(patch.getUnitCost());
        if (patch.getItemClass() != null) existing.setItemClass(patch.getItemClass());
        if (patch.getInvoiceNumber() != null) existing.setInvoiceNumber(patch.getInvoiceNumber());
        if (patch.getInvoiceDate() != null) existing.setInvoiceDate(patch.getInvoiceDate());
        if (patch.getSupplierName() != null) existing.setSupplierName(patch.getSupplierName());
        if (patch.getSupplierContact() != null) existing.setSupplierContact(patch.getSupplierContact());
        if (patch.getSupplierTaxId() != null) existing.setSupplierTaxId(patch.getSupplierTaxId());
        if (patch.getVatAmount() != null) existing.setVatAmount(patch.getVatAmount());
        if (patch.getPoNumber() != null) existing.setPoNumber(patch.getPoNumber());
        return repo.save(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
