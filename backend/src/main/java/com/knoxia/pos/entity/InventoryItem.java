package com.knoxia.pos.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String sku;

    private String unit;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(nullable = false)
    private Integer reorderLevel = 0;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(nullable = false, length = 16)
    private String itemClass = "RESELL";

    private String invoiceNumber;

    private LocalDate invoiceDate;

    private String supplierName;

    private String supplierContact;

    private String supplierTaxId;

    @Column(precision = 12, scale = 2)
    private BigDecimal vatAmount = BigDecimal.ZERO;

    private String poNumber;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSku() { return sku; }
    public String getUnit() { return unit; }
    public Integer getQuantity() { return quantity; }
    public Integer getReorderLevel() { return reorderLevel; }
    public BigDecimal getUnitCost() { return unitCost; }
    public String getItemClass() { return itemClass; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public String getSupplierName() { return supplierName; }
    public String getSupplierContact() { return supplierContact; }
    public String getSupplierTaxId() { return supplierTaxId; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public String getPoNumber() { return poNumber; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSku(String sku) { this.sku = sku; }
    public void setUnit(String unit) { this.unit = unit; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public void setItemClass(String itemClass) { this.itemClass = itemClass; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public void setSupplierContact(String supplierContact) { this.supplierContact = supplierContact; }
    public void setSupplierTaxId(String supplierTaxId) { this.supplierTaxId = supplierTaxId; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
