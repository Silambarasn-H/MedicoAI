-- ============================================================
-- MedicoAI – Migration: Add password reset token columns
-- Run this against your medicoai database if login returns 500
-- after the forgot-password feature was added.
--
-- Usage:
--   mysql -u root -p medicoai < migrate_add_reset_token.sql
-- ============================================================

USE medicoai;

-- Add reset_token column (nullable, unique)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL UNIQUE;

-- Add reset_token_expiry column (nullable datetime)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token_expiry DATETIME NULL;

-- Verify columns were added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'medicoai'
  AND TABLE_NAME   = 'users'
  AND COLUMN_NAME IN ('reset_token', 'reset_token_expiry');

-- ============================================================
-- OPTIONAL: Reset admin password back to Admin@123
-- Uncomment if admin password was changed via reset flow
-- ============================================================
-- UPDATE users
-- SET password            = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.',
--     reset_token         = NULL,
--     reset_token_expiry  = NULL
-- WHERE email = 'admin@medicoai.com';
