package com.knoxia.pos.dto;

public class AllocateCustomerRequest {
    private String customerName;
    private String phone;
    private Long customerId;
    private Long chairId;
    private Long barberId;
    private Long serviceId;
    private Long bookingId;

    public String getCustomerName() { return customerName; }
    public String getPhone() { return phone; }
    public Long getCustomerId() { return customerId; }
    public Long getChairId() { return chairId; }
    public Long getBarberId() { return barberId; }
    public Long getServiceId() { return serviceId; }
    public Long getBookingId() { return bookingId; }

    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public void setChairId(Long chairId) { this.chairId = chairId; }
    public void setBarberId(Long barberId) { this.barberId = barberId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
}
