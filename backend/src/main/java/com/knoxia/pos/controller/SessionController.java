package com.knoxia.pos.controller;

import com.knoxia.pos.dto.AllocateCustomerRequest;
import com.knoxia.pos.entity.ServiceSession;
import com.knoxia.pos.repository.SessionRepository;
import com.knoxia.pos.service.AllocationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final AllocationService allocationService;
    private final SessionRepository sessionRepository;

    public SessionController(AllocationService allocationService, SessionRepository sessionRepository) {
        this.allocationService = allocationService;
        this.sessionRepository = sessionRepository;
    }

    @PostMapping("/allocate")
    public ServiceSession allocate(@RequestBody AllocateCustomerRequest request) {
        return allocationService.allocate(request);
    }

    @PutMapping("/{id}/start")
    public ServiceSession start(@PathVariable Long id) { return allocationService.startSession(id); }

    @PutMapping("/{id}/complete")
    public ServiceSession complete(@PathVariable Long id) { return allocationService.completeSession(id); }

    @GetMapping("/active")
    public List<ServiceSession> active() { return sessionRepository.findByStatus(ServiceSession.SessionStatus.ACTIVE); }
}
