# KNOXIA Salon & Barbershop POS

Monorepo containing:

- [backend/](backend/) — Java 21, Spring Boot 3, Spring Data JPA. Runs on H2 in dev, PostgreSQL in prod.
- [frontend/](frontend/) — React 18, TypeScript, Vite, Tailwind CSS.

## Quick start (dev)

### 1. Backend

Requires JDK 21 and Maven.

```powershell
cd backend
mvn spring-boot:run
```

- API: http://localhost:8080/api
- H2 console: http://localhost:8080/h2 (JDBC URL: `jdbc:h2:mem:knoxia`, user `sa`, no password)
- Seed data (chairs, barbers, services) is loaded automatically from [backend/src/main/resources/data.sql](backend/src/main/resources/data.sql).

### 2. Frontend

Requires Node.js 18+.

```powershell
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173
- Vite proxies `/api/*` to `http://localhost:8080`.

## Switching to PostgreSQL

1. Create database `knoxia_pos`.
2. Optionally run [backend/src/main/resources/schema-postgres.sql](backend/src/main/resources/schema-postgres.sql) (JPA will also auto-create tables).
3. Run with the `prod` profile:

```powershell
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "postgres"
mvn -f backend/pom.xml spring-boot:run
```

## Feature map → Code

| Feature | Backend | Frontend |
|---|---|---|
| Chair allocation | [SessionController.java](backend/src/main/java/com/knoxia/pos/controller/SessionController.java), [AllocationService.java](backend/src/main/java/com/knoxia/pos/service/AllocationService.java) | [POS.tsx](frontend/src/pages/POS.tsx), [ChairGrid.tsx](frontend/src/components/ChairGrid.tsx) |
| Bookings | [BookingController.java](backend/src/main/java/com/knoxia/pos/controller/BookingController.java) | [Bookings.tsx](frontend/src/pages/Bookings.tsx) |
| Sales / Payments | [SaleController.java](backend/src/main/java/com/knoxia/pos/controller/SaleController.java), [PaymentService.java](backend/src/main/java/com/knoxia/pos/service/PaymentService.java) | [ActiveSessions.tsx](frontend/src/pages/ActiveSessions.tsx) |
| Feedback | [FeedbackController.java](backend/src/main/java/com/knoxia/pos/controller/FeedbackController.java) | [ActiveSessions.tsx](frontend/src/pages/ActiveSessions.tsx) (PayModal) |
| Loyalty | [LoyaltyService.java](backend/src/main/java/com/knoxia/pos/service/LoyaltyService.java), [LoyaltyController.java](backend/src/main/java/com/knoxia/pos/controller/LoyaltyController.java) | [Customers.tsx](frontend/src/pages/Customers.tsx) |
| Reports | [ReportController.java](backend/src/main/java/com/knoxia/pos/controller/ReportController.java) | [Reports.tsx](frontend/src/pages/Reports.tsx) |

## MVP flow

1. Open POS → pick chair → pick barber → pick service → Allocate Customer.
2. Open Active → Complete & Pay → choose method → record feedback.
3. Customer's loyalty points update automatically (1 point per ZMW 10).
4. Open Dashboard / Reports to see today's totals.

## Auth

Stubbed for the MVP. There is a `users` table and `User` entity, but no JWT/login yet. Add Spring Security later when ready.

## Roadmap

See blueprint section 20. Phase 1 (Core POS) is implemented. Phase 2 bookings are also wired. Phases 3–5 (rich loyalty UI, SMS, mobile money APIs, printer integration) are scaffolded but need real integrations.
