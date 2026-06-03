package com.knoxia.pos.dto;

public class CreateSaleRequest {
    private Long sessionId;
    private java.math.BigDecimal discount;
    private java.math.BigDecimal tip;

    public Long getSessionId() { return sessionId; }
    public java.math.BigDecimal getDiscount() { return discount; }
    public java.math.BigDecimal getTip() { return tip; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public void setDiscount(java.math.BigDecimal discount) { this.discount = discount; }
    public void setTip(java.math.BigDecimal tip) { this.tip = tip; }
}
