-- Removes project rows whose photo no longer exists.
--
-- Before the move to Cloudflare R2, uploaded photos were written to
-- public/uploads/projects/ on the server's disk and the bare filename was
-- stored in image_filename. Hostinger rebuilds into a fresh directory on every
-- deploy, so those files were deleted and cannot be recovered — the rows are
-- left pointing at nothing and render as broken images.
--
-- After the migration, every valid row's image_filename is an absolute URL:
-- either the seeded Pexels stock photography or an R2 public URL. So a row
-- whose value is NOT a URL is, by definition, one of these orphans.
--
-- Paste into phpMyAdmin's SQL tab, or:
--     mysql -h localhost -u <user> -p <database> < scripts/cleanup-orphaned-projects.sql

-- Look first. These are the rows the DELETE below will remove.
SELECT id, title, image_filename, created_at
  FROM projects
 WHERE image_filename IS NULL
    OR image_filename NOT LIKE 'http%';

-- Then remove them.
DELETE FROM projects
 WHERE image_filename IS NULL
    OR image_filename NOT LIKE 'http%';

-- Confirm what remains: every row should now be an absolute URL.
SELECT COUNT(*) AS remaining_projects,
       SUM(image_filename LIKE 'http%') AS with_valid_url
  FROM projects;
