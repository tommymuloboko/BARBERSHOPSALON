package com.knoxia.pos.service;

import com.knoxia.pos.dto.PostJournalRequest;
import com.knoxia.pos.entity.*;
import com.knoxia.pos.repository.*;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class AccountingService {

    private final AccountRepository accountRepo;
    private final JournalEntryRepository journalRepo;
    private final JournalLineRepository lineRepo;

    public AccountingService(AccountRepository accountRepo,
                             JournalEntryRepository journalRepo,
                             JournalLineRepository lineRepo) {
        this.accountRepo = accountRepo;
        this.journalRepo = journalRepo;
        this.lineRepo = lineRepo;
    }

    @PostConstruct
    @Transactional
    public void seedChartOfAccounts() {
        Object[][] seed = {
                {"1000", "Cash on Hand", AccountType.ASSET},
                {"1100", "Bank", AccountType.ASSET},
                {"1200", "Accounts Receivable", AccountType.ASSET},
                {"1300", "Inventory", AccountType.ASSET},
                {"2000", "Accounts Payable", AccountType.LIABILITY},
                {"2100", "VAT Payable", AccountType.LIABILITY},
                {"3000", "Owner's Equity", AccountType.EQUITY},
                {"3100", "Retained Earnings", AccountType.EQUITY},
                {"4000", "Service Revenue", AccountType.REVENUE},
                {"4100", "Product Revenue", AccountType.REVENUE},
                {"4200", "Tips Received", AccountType.REVENUE},
                {"5000", "Cost of Goods Sold", AccountType.EXPENSE},
                {"6000", "Rent", AccountType.EXPENSE},
                {"6100", "Utilities", AccountType.EXPENSE},
                {"6200", "Salaries", AccountType.EXPENSE},
                {"6300", "Supplies", AccountType.EXPENSE},
                {"6400", "Maintenance", AccountType.EXPENSE},
                {"6500", "Marketing", AccountType.EXPENSE},
                {"6900", "Other Expenses", AccountType.EXPENSE}
        };
        for (Object[] row : seed) {
            String code = (String) row[0];
            if (accountRepo.findByCode(code).isEmpty()) {
                Account a = new Account();
                a.setCode(code);
                a.setName((String) row[1]);
                a.setType((AccountType) row[2]);
                accountRepo.save(a);
            }
        }
    }

    public List<Account> listAccounts() {
        List<Account> all = accountRepo.findAll();
        all.sort(Comparator.comparing(Account::getCode));
        return all;
    }

    public Account createAccount(Account a) {
        a.setId(null);
        return accountRepo.save(a);
    }

    public List<JournalEntry> listJournals() {
        return journalRepo.findAllByOrderByEntryDateDescIdDesc();
    }

    @Transactional
    public JournalEntry postJournal(PostJournalRequest req) {
        if (req.getLines() == null || req.getLines().size() < 2) {
            throw new RuntimeException("Journal must have at least two lines");
        }
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        for (PostJournalRequest.Line l : req.getLines()) {
            totalDebit = totalDebit.add(l.getDebit() == null ? BigDecimal.ZERO : l.getDebit());
            totalCredit = totalCredit.add(l.getCredit() == null ? BigDecimal.ZERO : l.getCredit());
        }
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new RuntimeException("Debits (" + totalDebit + ") must equal credits (" + totalCredit + ")");
        }
        if (totalDebit.signum() <= 0) {
            throw new RuntimeException("Journal totals must be greater than zero");
        }

        JournalEntry e = new JournalEntry();
        e.setEntryDate(req.getEntryDate() == null ? LocalDate.now() : req.getEntryDate());
        e.setReference(req.getReference());
        e.setDescription(req.getDescription());
        e.setSource("MANUAL");

        for (PostJournalRequest.Line l : req.getLines()) {
            Account acct = accountRepo.findByCode(l.getAccountCode())
                    .orElseThrow(() -> new RuntimeException("Account not found: " + l.getAccountCode()));
            JournalLine jl = new JournalLine();
            jl.setJournalEntry(e);
            jl.setAccount(acct);
            jl.setDebit(l.getDebit());
            jl.setCredit(l.getCredit());
            jl.setMemo(l.getMemo());
            e.getLines().add(jl);
        }
        return journalRepo.save(e);
    }

    @Transactional
    public void postSale(Sale sale, Payment payment) {
        if (sale == null || payment == null) return;
        BigDecimal total = sale.getTotal() == null ? BigDecimal.ZERO : sale.getTotal();
        if (total.signum() <= 0) return;

        BigDecimal subtotal = sale.getSubtotal() == null ? BigDecimal.ZERO : sale.getSubtotal();
        BigDecimal discount = sale.getDiscount() == null ? BigDecimal.ZERO : sale.getDiscount();
        BigDecimal tip = sale.getTip() == null ? BigDecimal.ZERO : sale.getTip();
        BigDecimal revenue = subtotal.subtract(discount);
        if (revenue.signum() < 0) revenue = BigDecimal.ZERO;

        String debitAccountCode;
        switch (payment.getMethod()) {
            case CASH -> debitAccountCode = "1000";
            case CARD, MOBILE_MONEY -> debitAccountCode = "1100";
            default -> debitAccountCode = "1000";
        }

        PostJournalRequest req = new PostJournalRequest();
        req.setEntryDate(LocalDate.now());
        req.setReference("SALE-" + sale.getId());
        req.setDescription("Sale to " + (sale.getCustomer() != null ? sale.getCustomer().getFullName() : "walk-in"));
        List<PostJournalRequest.Line> lines = new ArrayList<>();
        lines.add(line(debitAccountCode, total, BigDecimal.ZERO, "Payment received (" + payment.getMethod() + ")"));
        if (revenue.signum() > 0) {
            lines.add(line("4000", BigDecimal.ZERO, revenue, "Service revenue"));
        }
        if (tip.signum() > 0) {
            lines.add(line("4200", BigDecimal.ZERO, tip, "Barber tip"));
        }
        req.setLines(lines);
        JournalEntry je = postJournal(req);
        je.setSource("SALE");
        journalRepo.save(je);
    }

    @Transactional
    public void postExpense(Expense expense) {
        if (expense == null || expense.getAmount() == null || expense.getAmount().signum() <= 0) return;
        String expenseCode = switch (String.valueOf(expense.getCategory())) {
            case "Rent" -> "6000";
            case "Utilities" -> "6100";
            case "Salaries" -> "6200";
            case "Supplies" -> "6300";
            case "Maintenance" -> "6400";
            case "Marketing" -> "6500";
            default -> "6900";
        };
        PostJournalRequest req = new PostJournalRequest();
        req.setEntryDate(expense.getExpenseDate() == null ? LocalDate.now() : expense.getExpenseDate());
        req.setReference("EXP-" + expense.getId());
        req.setDescription(expense.getCategory() + (expense.getDescription() == null ? "" : " — " + expense.getDescription()));
        List<PostJournalRequest.Line> lines = new ArrayList<>();
        lines.add(line(expenseCode, expense.getAmount(), BigDecimal.ZERO, expense.getCategory()));
        lines.add(line("1000", BigDecimal.ZERO, expense.getAmount(), "Paid in cash"));
        req.setLines(lines);
        JournalEntry je = postJournal(req);
        je.setSource("EXPENSE");
        journalRepo.save(je);
    }

    private PostJournalRequest.Line line(String code, BigDecimal debit, BigDecimal credit, String memo) {
        PostJournalRequest.Line l = new PostJournalRequest.Line();
        l.setAccountCode(code);
        l.setDebit(debit);
        l.setCredit(credit);
        l.setMemo(memo);
        return l;
    }

    // ===== Reports =====

    public List<Map<String, Object>> trialBalance(LocalDate asOf) {
        LocalDate cutoff = asOf == null ? LocalDate.now() : asOf;
        List<JournalLine> lines = lineRepo.findByJournalEntry_EntryDateLessThanEqual(cutoff);
        Map<Long, BigDecimal[]> agg = new HashMap<>(); // [debit, credit]
        for (JournalLine l : lines) {
            BigDecimal[] cur = agg.computeIfAbsent(l.getAccount().getId(), k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            cur[0] = cur[0].add(l.getDebit());
            cur[1] = cur[1].add(l.getCredit());
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Account a : listAccounts()) {
            BigDecimal[] cur = agg.getOrDefault(a.getId(), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal net = cur[0].subtract(cur[1]);
            BigDecimal debitBal = BigDecimal.ZERO, creditBal = BigDecimal.ZERO;
            if (net.signum() > 0) debitBal = net; else if (net.signum() < 0) creditBal = net.abs();
            if (debitBal.signum() == 0 && creditBal.signum() == 0) continue;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("code", a.getCode());
            row.put("name", a.getName());
            row.put("type", a.getType());
            row.put("debit", debitBal);
            row.put("credit", creditBal);
            rows.add(row);
        }
        return rows;
    }

    public Map<String, Object> incomeStatement(LocalDate from, LocalDate to) {
        LocalDate start = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate end = to == null ? LocalDate.now() : to;
        List<JournalLine> lines = lineRepo.findByJournalEntry_EntryDateBetween(start, end);
        Map<Long, BigDecimal> agg = new HashMap<>();
        for (JournalLine l : lines) {
            // Revenue: credit increases; Expense: debit increases
            BigDecimal delta = l.getCredit().subtract(l.getDebit());
            agg.merge(l.getAccount().getId(), delta, BigDecimal::add);
        }
        List<Map<String, Object>> revenues = new ArrayList<>();
        List<Map<String, Object>> expenses = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        for (Account a : listAccounts()) {
            BigDecimal delta = agg.getOrDefault(a.getId(), BigDecimal.ZERO);
            if (a.getType() == AccountType.REVENUE) {
                BigDecimal amount = delta; // credits positive
                if (amount.signum() == 0) continue;
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("code", a.getCode()); r.put("name", a.getName()); r.put("amount", amount);
                revenues.add(r);
                totalRevenue = totalRevenue.add(amount);
            } else if (a.getType() == AccountType.EXPENSE) {
                BigDecimal amount = delta.negate(); // debits positive
                if (amount.signum() == 0) continue;
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("code", a.getCode()); r.put("name", a.getName()); r.put("amount", amount);
                expenses.add(r);
                totalExpense = totalExpense.add(amount);
            }
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("from", start);
        out.put("to", end);
        out.put("revenues", revenues);
        out.put("expenses", expenses);
        out.put("totalRevenue", totalRevenue);
        out.put("totalExpense", totalExpense);
        out.put("netIncome", totalRevenue.subtract(totalExpense));
        return out;
    }

    public Map<String, Object> balanceSheet(LocalDate asOf) {
        LocalDate cutoff = asOf == null ? LocalDate.now() : asOf;
        List<JournalLine> lines = lineRepo.findByJournalEntry_EntryDateLessThanEqual(cutoff);
        Map<Long, BigDecimal> agg = new HashMap<>();
        for (JournalLine l : lines) {
            BigDecimal delta = l.getDebit().subtract(l.getCredit());
            agg.merge(l.getAccount().getId(), delta, BigDecimal::add);
        }
        List<Map<String, Object>> assets = new ArrayList<>();
        List<Map<String, Object>> liabilities = new ArrayList<>();
        List<Map<String, Object>> equity = new ArrayList<>();
        BigDecimal totalAssets = BigDecimal.ZERO;
        BigDecimal totalLiabilities = BigDecimal.ZERO;
        BigDecimal totalEquity = BigDecimal.ZERO;
        BigDecimal netIncome = BigDecimal.ZERO;
        for (Account a : listAccounts()) {
            BigDecimal delta = agg.getOrDefault(a.getId(), BigDecimal.ZERO);
            switch (a.getType()) {
                case ASSET -> {
                    if (delta.signum() == 0) continue;
                    Map<String, Object> r = new LinkedHashMap<>();
                    r.put("code", a.getCode()); r.put("name", a.getName()); r.put("amount", delta);
                    assets.add(r);
                    totalAssets = totalAssets.add(delta);
                }
                case LIABILITY -> {
                    BigDecimal v = delta.negate();
                    if (v.signum() == 0) continue;
                    Map<String, Object> r = new LinkedHashMap<>();
                    r.put("code", a.getCode()); r.put("name", a.getName()); r.put("amount", v);
                    liabilities.add(r);
                    totalLiabilities = totalLiabilities.add(v);
                }
                case EQUITY -> {
                    BigDecimal v = delta.negate();
                    if (v.signum() == 0) continue;
                    Map<String, Object> r = new LinkedHashMap<>();
                    r.put("code", a.getCode()); r.put("name", a.getName()); r.put("amount", v);
                    equity.add(r);
                    totalEquity = totalEquity.add(v);
                }
                case REVENUE -> netIncome = netIncome.add(delta.negate());
                case EXPENSE -> netIncome = netIncome.subtract(delta);
            }
        }
        Map<String, Object> retained = new LinkedHashMap<>();
        retained.put("code", "RE");
        retained.put("name", "Net income (period)");
        retained.put("amount", netIncome);
        equity.add(retained);
        totalEquity = totalEquity.add(netIncome);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("asOf", cutoff);
        out.put("assets", assets);
        out.put("liabilities", liabilities);
        out.put("equity", equity);
        out.put("totalAssets", totalAssets);
        out.put("totalLiabilities", totalLiabilities);
        out.put("totalEquity", totalEquity);
        out.put("totalLiabilitiesAndEquity", totalLiabilities.add(totalEquity));
        return out;
    }
}
