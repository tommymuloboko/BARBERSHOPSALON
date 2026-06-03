package com.knoxia.pos.service;

import com.knoxia.pos.dto.CreateSaleRequest;
import com.knoxia.pos.dto.PaymentRequest;
import com.knoxia.pos.entity.*;
import com.knoxia.pos.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PaymentService {

    private final SaleRepository saleRepo;
    private final PaymentRepository paymentRepo;
    private final SessionRepository sessionRepo;
    private final AllocationService allocationService;
    private final LoyaltyService loyaltyService;
    private final AccountingService accountingService;

    public PaymentService(SaleRepository saleRepo,
                          PaymentRepository paymentRepo,
                          SessionRepository sessionRepo,
                          AllocationService allocationService,
                          LoyaltyService loyaltyService,
                          AccountingService accountingService) {
        this.saleRepo = saleRepo;
        this.paymentRepo = paymentRepo;
        this.sessionRepo = sessionRepo;
        this.allocationService = allocationService;
        this.loyaltyService = loyaltyService;
        this.accountingService = accountingService;
    }

    @Transactional
    public Sale createSale(CreateSaleRequest request) {
        ServiceSession session = sessionRepo.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        BigDecimal subtotal = session.getServiceItem().getPrice();
        BigDecimal discount = request.getDiscount() == null ? BigDecimal.ZERO : request.getDiscount();
        BigDecimal tip = request.getTip() == null ? BigDecimal.ZERO : request.getTip();
        BigDecimal total = subtotal.subtract(discount).add(tip);
        if (total.signum() < 0) total = BigDecimal.ZERO;

        Sale sale = new Sale();
        sale.setCustomer(session.getCustomer());
        sale.setBarber(session.getBarber());
        sale.setServiceSession(session);
        sale.setSubtotal(subtotal);
        sale.setDiscount(discount);
        sale.setTip(tip);
        sale.setTotal(total);
        sale.setPaymentStatus(Sale.PaymentStatus.PENDING);
        return saleRepo.save(sale);
    }

    @Transactional
    public Payment pay(PaymentRequest request) {
        Sale sale = saleRepo.findById(request.getSaleId())
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        Payment p = new Payment();
        p.setSale(sale);
        p.setMethod(request.getMethod());
        p.setAmount(request.getAmount());
        p.setReference(request.getReference());
        p.setProvider(request.getProvider());
        p.setStatus(Payment.PaymentStatus.PAID);
        paymentRepo.save(p);

        sale.setPaymentStatus(Sale.PaymentStatus.PAID);
        saleRepo.save(sale);

        if (sale.getServiceSession() != null
                && sale.getServiceSession().getStatus() != ServiceSession.SessionStatus.COMPLETED) {
            allocationService.completeSession(sale.getServiceSession().getId());
        }

        loyaltyService.earnFromSale(sale);
        try { accountingService.postSale(sale, p); } catch (Exception ignored) { }
        return p;
    }
}
