-- ============================================================
-- MedicoAI Database Schema
-- Database: medicoai_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS medicoai_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medicoai_db;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100)        NOT NULL,
  email         VARCHAR(150)        NOT NULL UNIQUE,
  password      VARCHAR(255)        NOT NULL,
  phone         VARCHAR(20),
  role          ENUM('ADMIN','DOCTOR','PATIENT') NOT NULL DEFAULT 'PATIENT',
  is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
  profile_image VARCHAR(255),
  created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: doctors
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT          NOT NULL UNIQUE,
  specialization    VARCHAR(100)    NOT NULL,
  qualification     VARCHAR(200),
  experience_years  INT             DEFAULT 0,
  license_number    VARCHAR(50)     UNIQUE,
  consultation_fee  DECIMAL(10,2)   DEFAULT 0.00,
  available_days    VARCHAR(100),
  available_time    VARCHAR(100),
  bio               TEXT,
  rating            DECIMAL(3,2)    DEFAULT 0.00,
  total_reviews     INT             DEFAULT 0,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: patients
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT          NOT NULL UNIQUE,
  date_of_birth   DATE,
  gender          ENUM('MALE','FEMALE','OTHER'),
  blood_group     VARCHAR(5),
  address         TEXT,
  emergency_contact VARCHAR(20),
  allergies       TEXT,
  chronic_diseases TEXT,
  insurance_id    VARCHAR(100),
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id      BIGINT          NOT NULL,
  doctor_id       BIGINT          NOT NULL,
  appointment_date DATE           NOT NULL,
  appointment_time TIME           NOT NULL,
  status          ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED','RESCHEDULED')
                                  NOT NULL DEFAULT 'PENDING',
  type            ENUM('IN_PERSON','ONLINE')  NOT NULL DEFAULT 'IN_PERSON',
  reason          TEXT,
  notes           TEXT,
  cancellation_reason TEXT,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors(id)
);

-- ============================================================
-- TABLE: prescriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  appointment_id  BIGINT          NOT NULL,
  doctor_id       BIGINT          NOT NULL,
  patient_id      BIGINT          NOT NULL,
  diagnosis       TEXT,
  medicines       TEXT            NOT NULL,
  instructions    TEXT,
  follow_up_date  DATE,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_presc_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  CONSTRAINT fk_presc_doctor      FOREIGN KEY (doctor_id)      REFERENCES doctors(id),
  CONSTRAINT fk_presc_patient     FOREIGN KEY (patient_id)     REFERENCES patients(id)
);

-- ============================================================
-- TABLE: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id      BIGINT          NOT NULL,
  doctor_id       BIGINT,
  appointment_id  BIGINT,
  report_name     VARCHAR(200)    NOT NULL,
  report_type     VARCHAR(100),
  file_path       VARCHAR(500)    NOT NULL,
  file_size       BIGINT,
  description     TEXT,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_report_patient     FOREIGN KEY (patient_id)     REFERENCES patients(id),
  CONSTRAINT fk_report_doctor      FOREIGN KEY (doctor_id)      REFERENCES doctors(id),
  CONSTRAINT fk_report_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
  appointment_id      BIGINT          NOT NULL UNIQUE,
  patient_id          BIGINT          NOT NULL,
  amount              DECIMAL(10,2)   NOT NULL,
  currency            VARCHAR(5)      NOT NULL DEFAULT 'INR',
  payment_method      ENUM('CARD','UPI','NET_BANKING','WALLET','CASH') NOT NULL,
  payment_status      ENUM('PENDING','SUCCESS','FAILED','REFUNDED')    NOT NULL DEFAULT 'PENDING',
  transaction_id      VARCHAR(200)    UNIQUE,
  gateway_response    TEXT,
  paid_at             TIMESTAMP,
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  CONSTRAINT fk_payment_patient     FOREIGN KEY (patient_id)     REFERENCES patients(id)
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT          NOT NULL,
  title           VARCHAR(200)    NOT NULL,
  message         TEXT            NOT NULL,
  type            ENUM('APPOINTMENT','PRESCRIPTION','PAYMENT','SYSTEM','REMINDER') NOT NULL,
  is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: ai_chat_history
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT          NOT NULL,
  user_message    TEXT            NOT NULL,
  ai_response     TEXT            NOT NULL,
  session_id      VARCHAR(100),
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_appointments_patient   ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor    ON appointments(doctor_id);
CREATE INDEX idx_appointments_date      ON appointments(appointment_date);
CREATE INDEX idx_appointments_status    ON appointments(status);
CREATE INDEX idx_prescriptions_patient  ON prescriptions(patient_id);
CREATE INDEX idx_payments_patient       ON payments(patient_id);
CREATE INDEX idx_notifications_user     ON notifications(user_id);
CREATE INDEX idx_notifications_read     ON notifications(is_read);

-- ============================================================
-- SEED: Default Admin User
-- Password: Admin@123 (BCrypt encoded)
-- ============================================================
INSERT INTO users (full_name, email, password, phone, role, is_active)
VALUES (
  'System Admin',
  'admin@medicoai.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.',
  '9999999999',
  'ADMIN',
  TRUE
);
