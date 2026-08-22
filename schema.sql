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

-- ---------------------------------------------------------------------------
-- 1. Contact form
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_submissions (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50)      NULL,
  message     TEXT         NOT NULL,
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
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_career_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
