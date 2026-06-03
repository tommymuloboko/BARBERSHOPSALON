-- Seed data for dev/H2 profile
INSERT INTO barbers (display_name, specialty, status, commission_rate, active) VALUES ('John Mwale', 'Fades', 'AVAILABLE', 0.30, TRUE);
INSERT INTO barbers (display_name, specialty, status, commission_rate, active) VALUES ('Peter Banda', 'Beard Trim', 'AVAILABLE', 0.30, TRUE);
INSERT INTO barbers (display_name, specialty, status, commission_rate, active) VALUES ('Mary Phiri', 'Hair Styling', 'AVAILABLE', 0.35, TRUE);
INSERT INTO barbers (display_name, specialty, status, commission_rate, active) VALUES ('Grace Tembo', 'VIP Styling', 'AVAILABLE', 0.40, TRUE);

INSERT INTO chairs (chair_number, name, status, active, assigned_barber_id) VALUES ('1', 'Window Seat', 'EMPTY', TRUE, 1);
INSERT INTO chairs (chair_number, name, status, active, assigned_barber_id) VALUES ('2', 'Main Chair', 'EMPTY', TRUE, 2);
INSERT INTO chairs (chair_number, name, status, active, assigned_barber_id) VALUES ('3', 'Corner Chair', 'EMPTY', TRUE, 3);
INSERT INTO chairs (chair_number, name, status, active, assigned_barber_id) VALUES ('4', 'VIP Chair', 'EMPTY', TRUE, 4);

INSERT INTO services (name, description, price, estimated_minutes, active) VALUES ('Haircut', 'Standard haircut', 80.00, 30, TRUE);
INSERT INTO services (name, description, price, estimated_minutes, active) VALUES ('Shave', 'Clean shave', 40.00, 20, TRUE);
INSERT INTO services (name, description, price, estimated_minutes, active) VALUES ('Beard Trim', 'Beard shape & trim', 50.00, 20, TRUE);
INSERT INTO services (name, description, price, estimated_minutes, active) VALUES ('Hair Wash', 'Wash & condition', 60.00, 25, TRUE);
INSERT INTO services (name, description, price, estimated_minutes, active) VALUES ('Dye', 'Hair colouring', 250.00, 90, TRUE);
INSERT INTO services (name, description, price, estimated_minutes, active) VALUES ('Facial', 'Facial treatment', 150.00, 45, TRUE);

INSERT INTO users (full_name, username, password_hash, role, active, created_at) VALUES ('Admin', 'admin', 'stub', 'ADMIN', TRUE, CURRENT_TIMESTAMP);
INSERT INTO users (full_name, username, password_hash, role, active, created_at) VALUES ('Cashier', 'cashier', 'stub', 'CASHIER', TRUE, CURRENT_TIMESTAMP);
