package com.knoxia.pos.dto;

public class FeedbackRequest {
    private Long customerId;
    private Long barberId;
    private Long serviceId;
    private Long saleId;
    private Integer rating;
    private String comment;

    public Long getCustomerId() { return customerId; }
    public Long getBarberId() { return barberId; }
    public Long getServiceId() { return serviceId; }
    public Long getSaleId() { return saleId; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }

    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public void setBarberId(Long barberId) { this.barberId = barberId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public void setSaleId(Long saleId) { this.saleId = saleId; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
}
