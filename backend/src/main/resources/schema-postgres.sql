-- PostgreSQL schema for KNOXIA Salon & Barbershop POS
-- For prod profile run manually or via migration tool. JPA's ddl-auto=update will also create tables.

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    loyalty_points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS barbers (
    id BIGSERIAL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    commission_rate NUMERIC(5,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS chairs (
    id BIGSERIAL PRIMARY KEY,
    chair_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'EMPTY',
    active BOOLEAN DEFAULT TRUE,
    assigned_barber_id BIGINT UNIQUE REFERENCES barbers(id)
);

CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    estimated_minutes INT DEFAULT 30,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    barber_id BIGINT REFERENCES barbers(id),
    service_id BIGINT REFERENCES services(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT
);

CREATE TABLE IF NOT EXISTS service_sessions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    barber_id BIGINT REFERENCES barbers(id),
    chair_id BIGINT REFERENCES chairs(id),
    service_id BIGINT REFERENCES services(id),
    booking_id BIGINT REFERENCES bookings(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    barber_id BIGINT REFERENCES barbers(id),
    service_session_id BIGINT REFERENCES service_sessions(id),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT REFERENCES sales(id),
    method VARCHAR(20) NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    reference VARCHAR(255),
    provider VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PAID',
    paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    barber_id BIGINT REFERENCES barbers(id),
    service_id BIGINT REFERENCES services(id),
    sale_id BIGINT REFERENCES sales(id),
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    sale_id BIGINT REFERENCES sales(id),
    points INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
