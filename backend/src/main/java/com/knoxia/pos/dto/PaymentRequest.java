package com.knoxia.pos.dto;

import com.knoxia.pos.entity.Payment;
import java.math.BigDecimal;

public class PaymentRequest {
    private Long saleId;
    private Payment.PaymentMethod method;
    private BigDecimal amount;
    private String reference;
    private String provider;

    public Long getSaleId() { return saleId; }
    public Payment.PaymentMethod getMethod() { return method; }
    public BigDecimal getAmount() { return amount; }
    public String getReference() { return reference; }
    public String getProvider() { return provider; }

    public void setSaleId(Long saleId) { this.saleId = saleId; }
    public void setMethod(Payment.PaymentMethod method) { this.method = method; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setReference(String reference) { this.reference = reference; }
    public void setProvider(String provider) { this.provider = provider; }
}
