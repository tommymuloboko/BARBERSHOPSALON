package com.knoxia.pos.service;

import com.knoxia.pos.dto.AllocateCustomerRequest;
import com.knoxia.pos.entity.*;
import com.knoxia.pos.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class AllocationService {

    private final ChairRepository chairRepository;
    private final BarberRepository barberRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRepository serviceRepository;
    private final SessionRepository sessionRepository;
    private final BookingRepository bookingRepository;

    public AllocationService(ChairRepository chairRepository,
                             BarberRepository barberRepository,
                             CustomerRepository customerRepository,
                             ServiceRepository serviceRepository,
                             SessionRepository sessionRepository,
                             BookingRepository bookingRepository) {
        this.chairRepository = chairRepository;
        this.barberRepository = barberRepository;
        this.customerRepository = customerRepository;
        this.serviceRepository = serviceRepository;
        this.sessionRepository = sessionRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public ServiceSession allocate(AllocateCustomerRequest request) {
        Chair chair = chairRepository.findById(request.getChairId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chair not found"));
        if (chair.getStatus() != Chair.ChairStatus.EMPTY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Chair " + chair.getChairNumber() + " is already " + chair.getStatus().name().toLowerCase());
        }

        if (chair.getAssignedBarber() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Chair " + chair.getChairNumber() + " has no assigned barber");
        }
        if (!chair.getAssignedBarber().getId().equals(request.getBarberId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Chair " + chair.getChairNumber() + " is assigned to "
                            + chair.getAssignedBarber().getDisplayName() + " only");
        }

        Barber barber = barberRepository.findById(request.getBarberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Barberman not found"));
        if (barber.getStatus() != Barber.BarberStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Barberman " + barber.getDisplayName() + " is currently " + barber.getStatus().name().toLowerCase());
        }

        Customer customer;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        } else if (request.getPhone() != null && !request.getPhone().isBlank()) {
            customer = customerRepository.findByPhone(request.getPhone())
                    .orElseGet(() -> createCustomer(request));
        } else {
            customer = createCustomer(request);
        }

        ServiceItem service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));

        ServiceSession session = new ServiceSession();
        session.setCustomer(customer);
        session.setChair(chair);
        session.setBarber(barber);
        session.setServiceItem(service);
        session.setStatus(ServiceSession.SessionStatus.ACTIVE);
        session.setStartedAt(LocalDateTime.now());

        if (request.getBookingId() != null) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
            booking.setStatus(Booking.BookingStatus.CHECKED_IN);
            bookingRepository.save(booking);
            session.setBooking(booking);
        }

        chair.setStatus(Chair.ChairStatus.OCCUPIED);
        barber.setStatus(Barber.BarberStatus.BUSY);
        chairRepository.save(chair);
        barberRepository.save(barber);

        return sessionRepository.save(session);
    }

    private Customer createCustomer(AllocateCustomerRequest request) {
        Customer c = new Customer();
        c.setFullName(request.getCustomerName() == null ? "Walk-in Customer" : request.getCustomerName());
        c.setPhone(request.getPhone());
        c.setLoyaltyPoints(0);
        return customerRepository.save(c);
    }

    @Transactional
    public ServiceSession startSession(Long id) {
        ServiceSession s = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        s.setStatus(ServiceSession.SessionStatus.ACTIVE);
        if (s.getStartedAt() == null) s.setStartedAt(LocalDateTime.now());
        return sessionRepository.save(s);
    }

    @Transactional
    public ServiceSession completeSession(Long id) {
        ServiceSession s = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        s.setStatus(ServiceSession.SessionStatus.COMPLETED);
        s.setCompletedAt(LocalDateTime.now());

        Chair chair = s.getChair();
        chair.setStatus(Chair.ChairStatus.EMPTY);
        chairRepository.save(chair);

        Barber barber = s.getBarber();
        barber.setStatus(Barber.BarberStatus.AVAILABLE);
        barberRepository.save(barber);

        return sessionRepository.save(s);
    }
}
