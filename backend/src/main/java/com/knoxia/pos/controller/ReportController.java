package com.knoxia.pos.controller;

import com.knoxia.pos.entity.*;
import com.knoxia.pos.repository.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final SaleRepository saleRepo;
    private final PaymentRepository paymentRepo;
    private final ExpenseRepository expenseRepo;

    public ReportController(SaleRepository saleRepo, PaymentRepository paymentRepo, ExpenseRepository expenseRepo) {
        this.saleRepo = saleRepo;
        this.paymentRepo = paymentRepo;
        this.expenseRepo = expenseRepo;
    }

    @GetMapping("/daily")
    public Map<String, Object> daily(@RequestParam(required = false) String date) {
        LocalDate d = (date == null || date.isBlank()) ? LocalDate.now() : LocalDate.parse(date);
        return buildSummary(d, d, "DAILY");
    }

    @GetMapping("/weekly")
    public Map<String, Object> weekly(@RequestParam(required = false) String date) {
        LocalDate d = (date == null || date.isBlank()) ? LocalDate.now() : LocalDate.parse(date);
        LocalDate from = d.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate to = from.plusDays(6);
        return buildSummary(from, to, "WEEKLY");
    }

    @GetMapping("/monthly")
    public Map<String, Object> monthly(@RequestParam(required = false) String date) {
        LocalDate d = (date == null || date.isBlank()) ? LocalDate.now() : LocalDate.parse(date);
        LocalDate from = d.withDayOfMonth(1);
        LocalDate to = d.with(TemporalAdjusters.lastDayOfMonth());
        return buildSummary(from, to, "MONTHLY");
    }

    @GetMapping("/range")
    public Map<String, Object> range(@RequestParam String from, @RequestParam String to) {
        return buildSummary(LocalDate.parse(from), LocalDate.parse(to), "CUSTOM");
    }

    @GetMapping("/end-of-day")
    public Map<String, Object> endOfDay(@RequestParam(required = false) String date) {
        LocalDate d = (date == null || date.isBlank()) ? LocalDate.now() : LocalDate.parse(date);
        Map<String, Object> base = buildSummary(d, d, "END_OF_DAY");

        List<Sale> sales = saleRepo.findByCreatedAtBetween(d.atStartOfDay(), d.atTime(LocalTime.MAX));
        long paidCount = sales.stream().filter(s -> s.getPaymentStatus() == Sale.PaymentStatus.PAID).count();
        long pendingCount = sales.stream().filter(s -> s.getPaymentStatus() == Sale.PaymentStatus.PENDING).count();
        long refundedCount = sales.stream().filter(s -> s.getPaymentStatus() == Sale.PaymentStatus.REFUNDED).count();

        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> byMethod = (Map<String, BigDecimal>) base.get("byMethod");
        BigDecimal cashTotal = byMethod.getOrDefault("CASH", BigDecimal.ZERO);

        Map<String, Object> eod = new LinkedHashMap<>(base);
        eod.put("paidCount", paidCount);
        eod.put("pendingCount", pendingCount);
        eod.put("refundedCount", refundedCount);
        eod.put("expectedCashOnHand", cashTotal);
        return eod;
    }

    private Map<String, Object> buildSummary(LocalDate from, LocalDate to, String kind) {
        List<Sale> sales = saleRepo.findByCreatedAtBetween(from.atStartOfDay(), to.atTime(LocalTime.MAX));
        List<Sale> paidSales = sales.stream()
                .filter(s -> s.getPaymentStatus() == Sale.PaymentStatus.PAID)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = paidSales.stream()
                .map(Sale::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> byMethod = new LinkedHashMap<>();
        for (Payment.PaymentMethod m : Payment.PaymentMethod.values()) byMethod.put(m.name(), BigDecimal.ZERO);
        for (Sale s : sales) {
            for (Payment p : paymentRepo.findBySaleId(s.getId())) {
                if (p.getStatus() == Payment.PaymentStatus.PAID) {
                    byMethod.merge(p.getMethod().name(), p.getAmount(), BigDecimal::add);
                }
            }
        }

        Map<Long, Map<String, Object>> byBarberMap = new LinkedHashMap<>();
        for (Sale s : paidSales) {
            Barber b = s.getBarber();
            Long key = b == null ? -1L : b.getId();
            String name = b == null ? "Unassigned" : b.getDisplayName();
            Map<String, Object> row = byBarberMap.computeIfAbsent(key, k -> {
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("barberId", k < 0 ? null : k);
                r.put("name", name);
                r.put("count", 0L);
                r.put("revenue", BigDecimal.ZERO);
                return r;
            });
            row.put("count", ((Long) row.get("count")) + 1);
            row.put("revenue", ((BigDecimal) row.get("revenue")).add(s.getTotal()));
        }
        List<Map<String, Object>> byBarber = new ArrayList<>(byBarberMap.values());
        byBarber.sort((a, b) -> ((BigDecimal) b.get("revenue")).compareTo((BigDecimal) a.get("revenue")));

        Map<LocalDate, BigDecimal> revenueByDay = new TreeMap<>();
        Map<LocalDate, Set<Long>> custByDay = new TreeMap<>();
        LocalDate cur = from;
        while (!cur.isAfter(to)) {
            revenueByDay.put(cur, BigDecimal.ZERO);
            custByDay.put(cur, new HashSet<>());
            cur = cur.plusDays(1);
        }
        for (Sale s : paidSales) {
            LocalDate day = s.getCreatedAt().toLocalDate();
            revenueByDay.merge(day, s.getTotal(), BigDecimal::add);
            if (s.getCustomer() != null) custByDay.computeIfAbsent(day, k -> new HashSet<>()).add(s.getCustomer().getId());
        }
        List<Map<String, Object>> byDay = new ArrayList<>();
        for (Map.Entry<LocalDate, BigDecimal> e : revenueByDay.entrySet()) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("date", e.getKey().toString());
            r.put("revenue", e.getValue());
            r.put("customers", custByDay.get(e.getKey()).size());
            byDay.add(r);
        }

        Map<String, Long> topServices = paidSales.stream()
                .filter(s -> s.getServiceSession() != null && s.getServiceSession().getServiceItem() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getServiceSession().getServiceItem().getName(),
                        Collectors.counting()));

        List<Expense> expenses = expenseRepo.findByExpenseDateBetween(from, to);
        BigDecimal totalExpenses = expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> expensesByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        LinkedHashMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));

        BigDecimal net = totalRevenue.subtract(totalExpenses);
        boolean salesLessThanExpenses = totalRevenue.compareTo(totalExpenses) < 0;

        long customers = paidSales.stream()
                .map(Sale::getCustomer).filter(Objects::nonNull)
                .map(Customer::getId).distinct().count();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("kind", kind);
        out.put("from", from.toString());
        out.put("to", to.toString());
        out.put("date", from.toString());
        out.put("transactions", paidSales.size());
        out.put("customers", customers);
        out.put("totalRevenue", totalRevenue);
        out.put("totalExpenses", totalExpenses);
        out.put("net", net);
        out.put("salesLessThanExpenses", salesLessThanExpenses);
        out.put("byMethod", byMethod);
        out.put("byBarber", byBarber);
        out.put("byDay", byDay);
        out.put("topServices", topServices);
        out.put("expensesByCategory", expensesByCategory);
        return out;
    }
}
