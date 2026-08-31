-- Acorn Construction: one-time content seed (plain SQL)
--
-- Paste this into phpMyAdmin's SQL tab, or run it from the command line:
--     mysql -h localhost -u <user> -p <database> < scripts/seed-content.sql
--
-- Run schema.sql first: this only inserts rows, it does not create tables.
--
-- This is the SQL equivalent of scripts/seed-content.mjs and inserts exactly
-- the same 16 projects, 3 testimonials and 3 service_content rows. Use whichever
-- is more convenient -- do NOT run both, or you will get duplicates.
--
-- Intended for a fresh database and deliberately NOT idempotent: re-running it
-- inserts a second copy of the projects and testimonials. The service_content
-- rows are keyed by slug, so those would fail on a duplicate key instead.
--
-- Generated from scripts/seed-content.mjs -- edit that file and regenerate
-- rather than hand-editing this one.

SET NAMES utf8mb4;


-- ---------------------------------------------------------------------------
-- Projects (16 rows)
-- ---------------------------------------------------------------------------
-- image_filename holds absolute Pexels URLs here, matching what the site
-- already served before the content tables existed. Photos uploaded through
-- the admin store a bare filename under public/uploads/projects/ instead.

INSERT INTO projects
  (title, category, image_filename, caption, description, display_order)
VALUES
  ('Maple Ridge Residence', 'residential', 'https://images.pexels.com/photos/27938317/pexels-photo-27938317.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Custom-built residential home frame under construction', NULL, 10),
  ('Cedar Lane Addition', 'residential', 'https://images.pexels.com/photos/17410734/pexels-photo-17410734.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Carpenter framing an exterior wall on a residential addition', NULL, 20),
  ('Birchwood Family Home', 'residential', 'https://images.pexels.com/photos/8830259/pexels-photo-8830259.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Wood frame roof structure under construction', NULL, 30),
  ('Lakeview Timber Build', 'residential', 'https://images.pexels.com/photos/8817828/pexels-photo-8817828.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Crew building a timber frame structure', NULL, 40),
  ('Riverside Workshop Build', 'residential', 'https://images.pexels.com/photos/8820172/pexels-photo-8820172.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Framing crew cutting lumber on site', NULL, 50),
  ('Oakhaven Framing Detail', 'residential', 'https://images.pexels.com/photos/8830265/pexels-photo-8830265.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Crew member working on roof trusses', NULL, 60),
  ('Stonefield Layout & Measure', 'residential', 'https://images.pexels.com/photos/5973903/pexels-photo-5973903.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Measuring and marking framing lumber', NULL, 70),
  ('Willowbrook Framing Detail', 'residential', 'https://images.pexels.com/photos/5974343/pexels-photo-5974343.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Close-up of framing carpentry work', NULL, 80),
  ('New Build Foundation', 'foundations', 'https://images.pexels.com/photos/29735767/pexels-photo-29735767.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Worker setting rebar forms in a foundation trench', NULL, 90),
  ('Summit Foundation & Framing', 'foundations', 'https://images.pexels.com/photos/17410739/pexels-photo-17410739.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Crew working on foundation forms with homes in the background', NULL, 100),
  ('Harborview Concrete Wall', 'foundations', 'https://images.pexels.com/photos/16001335/pexels-photo-16001335.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Poured concrete foundation wall detail', NULL, 110),
  ('Creekside Site Prep', 'foundations', 'https://images.pexels.com/photos/4981787/pexels-photo-4981787.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Worker preparing a site for foundation work', NULL, 120),
  ('Prairie View Shop', 'post_frame', 'https://images.pexels.com/photos/10172663/pexels-photo-10172663.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Modern post frame shop building with metal roof', NULL, 130),
  ('Northfield Storage Building', 'post_frame', 'https://images.pexels.com/photos/18289258/pexels-photo-18289258.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Post frame building with corrugated metal roof', NULL, 140),
  ('Acreage Outbuilding', 'post_frame', 'https://images.pexels.com/photos/28412626/pexels-photo-28412626.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Aerial view of farmland near an agricultural building site', NULL, 150),
  ('Grainfield Shop Fabrication', 'post_frame', 'https://images.pexels.com/photos/7480448/pexels-photo-7480448.jpeg?auto=compress&cs=tinysrgb&w=1600',
   'Fabrication work for a post frame building project', NULL, 160);

-- ---------------------------------------------------------------------------
-- Testimonials (3 rows)
-- ---------------------------------------------------------------------------

INSERT INTO testimonials
  (client_name, client_role, client_location, quote, is_published, display_order)
VALUES
  ('Melissa Grant', 'Homeowner, Residential Addition', 'Lloydminster, AB',
   'Acorn managed our addition like it was their own home. Every question got answered the same day and the final walkthrough turned up almost nothing to fix.',
   1, 10),
  ('David Okafor', 'Owner, Light Commercial Build', 'North Battleford, SK',
   'We opened our second shop location three weeks ahead of schedule. Their team coordinated directly with our architect and never let a single delay slip past us.',
   1, 20),
  ('Priya Nair', 'Owner, Post Frame Rebuild', 'Vermilion, AB',
   'After storm damage tore up our shop roof, Acorn had a crew out within days and rebuilt it stronger than before. Straightforward pricing, no surprises.',
   1, 30);

-- ---------------------------------------------------------------------------
-- Service overview copy (3 rows)
-- ---------------------------------------------------------------------------
-- Paragraphs are separated by a blank line; the site splits on that when
-- rendering. The slug is the primary key and matches /services/<slug>.

INSERT INTO service_content (service_slug, overview_text)
VALUES
  ('residential-light-commercial-framing',
   'We provide professional wood frame construction services for residential homes and light commercial buildings. From custom homes and additions to garages, shops, and small commercial structures, our team delivers precision framing, structural integrity, and quality workmanship at every stage of construction.'),
  ('foundations',
   'A strong building starts with a solid foundation. We provide foundation construction services that create stable, durable bases for residential and light commercial projects. Our team focuses on accuracy, proper preparation, and quality concrete work to ensure long-term structural performance.'),
  ('post-frame-construction',
   'Post frame construction is a versatile and cost-effective building solution for agricultural, residential, commercial, and storage applications. Whether you need a shop, barn, garage, warehouse, or custom post frame building, we deliver structures designed for strength, functionality, and efficiency.');
