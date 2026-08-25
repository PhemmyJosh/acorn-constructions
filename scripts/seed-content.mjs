/**
 * One-time seed: copies the content that used to be hardcoded in src/data/
 * into the projects, testimonials and service_content tables, so the live site
 * looks identical the moment this ships and becomes editable from then on.
 *
 *   node scripts/seed-content.mjs
 *
 * Safe to re-run: projects and testimonials are only populated when their table
 * is empty, and service rows are matched on slug. It will never overwrite
 * content the client has since edited through the admin.
 *
 * The data below is an intentional SNAPSHOT rather than an import of
 * src/data/*. A migration has to keep producing the same result however those
 * source files drift afterwards, and importing them would also drag in
 * Next-only path aliases and lucide icons that plain Node cannot resolve.
 *
 * Project images here are absolute Pexels URLs, which is exactly what the site
 * already served, so seeding changes nothing visible. image_filename holds
 * either a URL like these or a bare filename under public/uploads/projects/
 * for anything uploaded through the admin.
 */
import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";

/** Loads .env.local the way Next does, without pulling in a dependency. */
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    let raw;
    try {
      raw = readFileSync(new URL("../" + file, import.meta.url), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;
      const [, key, value] = match;
      if (process.env[key] === undefined) {
        process.env[key] = value.replace(/^["']|["']$/g, "").trim();
      }
    }
  }
}
loadEnv();

const PROJECTS = [
  {
    "title": "Maple Ridge Residence",
    "category": "residential",
    "image_filename": "https://images.pexels.com/photos/27938317/pexels-photo-27938317.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Custom-built residential home frame under construction",
    "description": null,
    "display_order": 10
  },
  {
    "title": "Cedar Lane Addition",
    "category": "residential",
    "image_filename": "https://images.pexels.com/photos/17410734/pexels-photo-17410734.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Carpenter framing an exterior wall on a residential addition",
    "description": null,
    "display_order": 20
  },
  {
    "title": "Birchwood Family Home",
    "category": "residential",
    "image_filename": "https://images.pexels.com/photos/8830259/pexels-photo-8830259.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Wood frame roof structure under construction",
    "description": null,
    "display_order": 30
  },
  {
    "title": "Lakeview Timber Build",
    "category": "residential",
    "image_filename": "https://images.pexels.com/photos/8817828/pexels-photo-8817828.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Crew building a timber frame structure",
    "description": null,
    "display_order": 40
  },
  {
    "title": "Riverside Workshop Build",
    "category": "residential",
    "image_filename": "https://images.pexels.com/photos/8820172/pexels-photo-8820172.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Framing crew cutting lumber on site",
    "description": null,
    "display_order": 50
  },
  {
    "title": "Oakhaven Framing Detail",
    "category": "residential",
    "image_filename": "https://images.pexels.com/photos/8830265/pexels-photo-8830265.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Crew member working on roof trusses",
    "description": null,
    "display_order": 60
  },
  {
    "title": "Stonefield Layout & Measure",
    "category": "residential",
    "image_filename": "https://images.pexels.com/photos/5973903/pexels-photo-5973903.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Measuring and marking framing lumber",
    "description": null,
    "display_order": 70
  },
  {
    "title": "Willowbrook Framing Detail",
    "category": "residential",
    "image_filename": "https://images.pexels.com/photos/5974343/pexels-photo-5974343.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Close-up of framing carpentry work",
    "description": null,
    "display_order": 80
  },
  {
    "title": "New Build Foundation",
    "category": "foundations",
    "image_filename": "https://images.pexels.com/photos/29735767/pexels-photo-29735767.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Worker setting rebar forms in a foundation trench",
    "description": null,
    "display_order": 90
  },
  {
    "title": "Summit Foundation & Framing",
    "category": "foundations",
    "image_filename": "https://images.pexels.com/photos/17410739/pexels-photo-17410739.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Crew working on foundation forms with homes in the background",
    "description": null,
    "display_order": 100
  },
  {
    "title": "Harborview Concrete Wall",
    "category": "foundations",
    "image_filename": "https://images.pexels.com/photos/16001335/pexels-photo-16001335.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Poured concrete foundation wall detail",
    "description": null,
    "display_order": 110
  },
  {
    "title": "Creekside Site Prep",
    "category": "foundations",
    "image_filename": "https://images.pexels.com/photos/4981787/pexels-photo-4981787.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Worker preparing a site for foundation work",
    "description": null,
    "display_order": 120
  },
  {
    "title": "Prairie View Shop",
    "category": "post_frame",
    "image_filename": "https://images.pexels.com/photos/10172663/pexels-photo-10172663.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Modern post frame shop building with metal roof",
    "description": null,
    "display_order": 130
  },
  {
    "title": "Northfield Storage Building",
    "category": "post_frame",
    "image_filename": "https://images.pexels.com/photos/18289258/pexels-photo-18289258.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Post frame building with corrugated metal roof",
    "description": null,
    "display_order": 140
  },
  {
    "title": "Acreage Outbuilding",
    "category": "post_frame",
    "image_filename": "https://images.pexels.com/photos/28412626/pexels-photo-28412626.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Aerial view of farmland near an agricultural building site",
    "description": null,
    "display_order": 150
  },
  {
    "title": "Grainfield Shop Fabrication",
    "category": "post_frame",
    "image_filename": "https://images.pexels.com/photos/7480448/pexels-photo-7480448.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "caption": "Fabrication work for a post frame building project",
    "description": null,
    "display_order": 160
  }
];

const TESTIMONIALS = [
  {
    "client_name": "Melissa Grant",
    "client_role": "Homeowner, Residential Addition",
    "client_location": "Lloydminster, AB",
    "quote": "Acorn managed our addition like it was their own home. Every question got answered the same day and the final walkthrough turned up almost nothing to fix.",
    "is_published": 1,
    "display_order": 10
  },
  {
    "client_name": "David Okafor",
    "client_role": "Owner, Light Commercial Build",
    "client_location": "North Battleford, SK",
    "quote": "We opened our second shop location three weeks ahead of schedule. Their team coordinated directly with our architect and never let a single delay slip past us.",
    "is_published": 1,
    "display_order": 20
  },
  {
    "client_name": "Priya Nair",
    "client_role": "Owner, Post Frame Rebuild",
    "client_location": "Vermilion, AB",
    "quote": "After storm damage tore up our shop roof, Acorn had a crew out within days and rebuilt it stronger than before. Straightforward pricing, no surprises.",
    "is_published": 1,
    "display_order": 30
  }
];

const SERVICES = [
  {
    "service_slug": "residential-light-commercial-framing",
    "overview_text": "We provide professional wood frame construction services for residential homes and light commercial buildings. From custom homes and additions to garages, shops, and small commercial structures, our team delivers precision framing, structural integrity, and quality workmanship at every stage of construction."
  },
  {
    "service_slug": "foundations",
    "overview_text": "A strong building starts with a solid foundation. We provide foundation construction services that create stable, durable bases for residential and light commercial projects. Our team focuses on accuracy, proper preparation, and quality concrete work to ensure long-term structural performance."
  },
  {
    "service_slug": "post-frame-construction",
    "overview_text": "Post frame construction is a versatile and cost-effective building solution for agricultural, residential, commercial, and storage applications. Whether you need a shop, barn, garage, warehouse, or custom post frame building, we deliver structures designed for strength, functionality, and efficiency."
  }
];

const connection = await mysql.createConnection({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "acorn_construction",
});

/** Table names are fixed literals here, never built from input. */
async function count(table) {
  const [rows] = await connection.query("SELECT COUNT(*) AS n FROM " + table);
  return Number(rows[0].n);
}

const inserted = { projects: 0, testimonials: 0, services: 0 };

// --- projects --------------------------------------------------------------
if ((await count("projects")) > 0) {
  console.log("projects: already populated, skipping");
} else {
  for (const p of PROJECTS) {
    await connection.execute(
      "INSERT INTO projects (title, category, image_filename, caption, description, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [
        p.title,
        p.category,
        p.image_filename,
        p.caption,
        p.description,
        p.display_order,
      ]
    );
    inserted.projects++;
  }
  console.log("projects: inserted " + inserted.projects);
}

// --- testimonials ----------------------------------------------------------
if ((await count("testimonials")) > 0) {
  console.log("testimonials: already populated, skipping");
} else {
  for (const t of TESTIMONIALS) {
    await connection.execute(
      "INSERT INTO testimonials (client_name, client_role, client_location, quote, is_published, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [
        t.client_name,
        t.client_role,
        t.client_location,
        t.quote,
        t.is_published,
        t.display_order,
      ]
    );
    inserted.testimonials++;
  }
  console.log("testimonials: inserted " + inserted.testimonials);
}

// --- service copy ----------------------------------------------------------
// Matched per slug rather than all-or-nothing, so a service added later still
// gets seeded without disturbing ones already edited.
for (const s of SERVICES) {
  const [rows] = await connection.execute(
    "SELECT service_slug FROM service_content WHERE service_slug = ?",
    [s.service_slug]
  );
  if (rows.length > 0) {
    console.log("service_content: " + s.service_slug + " already present, skipping");
    continue;
  }
  await connection.execute(
    "INSERT INTO service_content (service_slug, overview_text) VALUES (?, ?)",
    [s.service_slug, s.overview_text]
  );
  inserted.services++;
}
if (inserted.services > 0) {
  console.log("service_content: inserted " + inserted.services);
}

console.log("\nseed complete: " + JSON.stringify(inserted));
await connection.end();
