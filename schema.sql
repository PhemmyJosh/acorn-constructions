-- Acorn Construction: form submission schema
--
-- Safe to run against local MySQL now and Hostinger's MySQL later without
-- changes. Notes on portability:
--   * No CREATE DATABASE / USE statement, because shared hosts (Hostinger,
--     cPanel) create the database for you and only grant rights on it. Select
--     the database first, e.g.  mysql -u root -p acorn_construction < schema.sql
--   * CREATE TABLE IF NOT EXISTS makes the file safe to re-run.
--   * utf8mb4 so names, addresses and emoji survive intact.
--   * TIMESTAMP DEFAULT CURRENT_TIMESTAMP works on MySQL 5.7 and 8.x, which
--     covers every current shared-hosting version.
--   * The MIGRATIONS section at the bottom brings an ALREADY-EXISTING database
--     up to date without touching its rows, so this one file is the only thing
--     you ever need to run. Existing data is preserved.

-- ---------------------------------------------------------------------------
-- 1. Contact form
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_submissions (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50)      NULL,
  message     TEXT         NOT NULL,
  is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
  read_at     DATETIME         NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contact_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. Free estimate requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estimate_requests (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name                VARCHAR(255) NOT NULL,
  email               VARCHAR(255) NOT NULL,
  phone               VARCHAR(50)      NULL,
  mailing_address     VARCHAR(255)     NULL,
  city                VARCHAR(120)     NULL,
  province            VARCHAR(120)     NULL,
  postal_code         VARCHAR(30)      NULL,
  country             VARCHAR(120)     NULL,
  building_type       VARCHAR(60)      NULL,
  building_location   VARCHAR(255)     NULL,
  -- Nullable DATE: the field is optional on the form, and an empty string is
  -- stored as NULL rather than MySQL's '0000-00-00'.
  proposed_start_date DATE             NULL,
  building_size_sqft  INT UNSIGNED     NULL,
  description         TEXT             NULL,
  comments            TEXT             NULL,
  is_read             BOOLEAN      NOT NULL DEFAULT FALSE,
  read_at             DATETIME         NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_estimate_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. Career applications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS career_applications (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name             VARCHAR(255) NOT NULL,
  email            VARCHAR(255) NOT NULL,
  phone            VARCHAR(50)  NOT NULL,
  years_experience VARCHAR(60)      NULL,
  start_date       VARCHAR(120)     NULL,
  expected_wage    VARCHAR(120)     NULL,
  -- Stored as a JSON array of strings. Declared LONGTEXT rather than the JSON
  -- type so the file also works on MySQL 5.6/MariaDB builds still found on
  -- some shared hosts; reads go through JSON.parse either way.
  proficiencies    LONGTEXT         NULL,
  comments         TEXT             NULL,
  resume_filename  VARCHAR(255)     NULL,
  resume_mimetype  VARCHAR(120)     NULL,
  -- LONGBLOB holds up to 4GB; the upload route caps uploads at 2.4MB to match
  -- the limit shown on the form.
  resume_data      LONGBLOB         NULL,
  is_read          BOOLEAN      NOT NULL DEFAULT FALSE,
  read_at          DATETIME         NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_career_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- MIGRATIONS
-- ---------------------------------------------------------------------------
-- Everything above is CREATE TABLE IF NOT EXISTS, which is a no-op against a
-- database whose tables already exist -- so new columns have to be added
-- separately for existing installs.
--
-- MySQL 8 has no "ALTER TABLE ... ADD COLUMN IF NOT EXISTS" (that is a MariaDB
-- extension), so each step checks information_schema first and builds the
-- statement dynamically. The result is safe to run repeatedly: on a database
-- that already has the column, the ALTER is replaced with a harmless "DO 0".
-- No rows are read, written or deleted by any of this.

-- 2026-08: read/unread tracking for the admin dashboard.
--
-- The plain equivalent of the six guarded steps below, if you would rather
-- paste them straight into phpMyAdmin on a database you know has not had them
-- applied yet (these will error with "Duplicate column name" if re-run, which
-- is exactly why the guarded versions exist):
--
--   ALTER TABLE contact_submissions
--     ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE,
--     ADD COLUMN read_at DATETIME NULL;
--   ALTER TABLE estimate_requests
--     ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE,
--     ADD COLUMN read_at DATETIME NULL;
--   ALTER TABLE career_applications
--     ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE,
--     ADD COLUMN read_at DATETIME NULL;
--
-- Existing rows land on is_read = FALSE, i.e. everything already in the table
-- shows up as unread the first time the dashboard is opened.

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'contact_submissions'
      AND COLUMN_NAME = 'is_read') = 0,
  'ALTER TABLE contact_submissions ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE',
  'DO 0'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'contact_submissions'
      AND COLUMN_NAME = 'read_at') = 0,
  'ALTER TABLE contact_submissions ADD COLUMN read_at DATETIME NULL',
  'DO 0'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'estimate_requests'
      AND COLUMN_NAME = 'is_read') = 0,
  'ALTER TABLE estimate_requests ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE',
  'DO 0'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'estimate_requests'
      AND COLUMN_NAME = 'read_at') = 0,
  'ALTER TABLE estimate_requests ADD COLUMN read_at DATETIME NULL',
  'DO 0'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'career_applications'
      AND COLUMN_NAME = 'is_read') = 0,
  'ALTER TABLE career_applications ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE',
  'DO 0'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'career_applications'
      AND COLUMN_NAME = 'read_at') = 0,
  'ALTER TABLE career_applications ADD COLUMN read_at DATETIME NULL',
  'DO 0'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
