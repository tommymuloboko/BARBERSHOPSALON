package com.knoxia.pos.service;

import com.knoxia.pos.entity.*;
import com.knoxia.pos.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class LoyaltyService {

    private final LoyaltyTransactionRepository loyaltyRepo;
    private final CustomerRepository customerRepo;

    @Value("${knoxia.loyalty.points-per-amount:10}")
    private int pointsPerAmount;

    public LoyaltyService(LoyaltyTransactionRepository loyaltyRepo, CustomerRepository customerRepo) {
        this.loyaltyRepo = loyaltyRepo;
        this.customerRepo = customerRepo;
    }

    @Transactional
    public LoyaltyTransaction earnFromSale(Sale sale) {
        int earned = sale.getTotal().divide(BigDecimal.valueOf(pointsPerAmount), 0, RoundingMode.FLOOR).intValue();
        if (earned <= 0) return null;

        Customer c = sale.getCustomer();
        c.setLoyaltyPoints(c.getLoyaltyPoints() + earned);
        customerRepo.save(c);

        LoyaltyTransaction t = new LoyaltyTransaction();
        t.setCustomer(c);
        t.setSale(sale);
        t.setPoints(earned);
        t.setType(LoyaltyTransaction.Type.EARNED);
        t.setDescription("Earned from sale #" + sale.getId());
        return loyaltyRepo.save(t);
    }

    @Transactional
    public LoyaltyTransaction redeem(Long customerId, int points) {
        Customer c = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        if (c.getLoyaltyPoints() < points) throw new RuntimeException("Insufficient points");
        c.setLoyaltyPoints(c.getLoyaltyPoints() - points);
        customerRepo.save(c);

        LoyaltyTransaction t = new LoyaltyTransaction();
        t.setCustomer(c);
        t.setPoints(points);
        t.setType(LoyaltyTransaction.Type.REDEEMED);
        t.setDescription("Redeemed " + points + " points");
        return loyaltyRepo.save(t);
    }
}
