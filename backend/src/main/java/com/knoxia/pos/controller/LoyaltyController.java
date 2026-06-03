package com.knoxia.pos.controller;

import com.knoxia.pos.entity.LoyaltyTransaction;
import com.knoxia.pos.service.LoyaltyService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    public LoyaltyController(LoyaltyService loyaltyService) { this.loyaltyService = loyaltyService; }

    @PostMapping("/redeem")
    public LoyaltyTransaction redeem(@RequestBody Map<String, Object> body) {
        Long customerId = Long.valueOf(body.get("customerId").toString());
        int points = Integer.parseInt(body.get("points").toString());
        return loyaltyService.redeem(customerId, points);
    }
}
