#!/usr/bin/env node
/**
 * Start, stop and check the local development MySQL server.
 *
 * Only for local development. Production MySQL is managed by Hostinger and
 * nothing here touches it.
 *
 * Exists because the local server is a portable (unzipped, not installed)
 * MySQL, so there is no Windows service to start and no `mysql` on PATH. The
 * data directory used to sit under %TEMP%, which pruned itself mid-session and
 * took two tables' .ibd files with it; it now lives outside temp, and this
 * script is how that location gets used consistently rather than being retyped
 * from memory.
 *
 * Usage:
 *   node scripts/mysql-local.mjs start
 *   node scripts/mysql-local.mjs stop
 *   node scripts/mysql-local.mjs status
 *
 * Requires LOCAL_MYSQL_HOME in .env.local — the folder holding `server/` and
 * `data/`. See LOCAL-DEV.md.
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import mysql from "mysql2/promise";

const ENV_FILE = ".env.local";

function readEnv() {
  if (!fs.existsSync(ENV_FILE)) {
    fail(`${ENV_FILE} not found. Copy .env.example to .env.local first.`);
  }
  return Object.fromEntries(
    fs
      .readFileSync(ENV_FILE, "utf8")
      .split(/\r?\n/)
      .filter((line) => /^\w+=/.test(line))
      .map((line) => [
        line.slice(0, line.indexOf("=")),
        line.slice(line.indexOf("=") + 1).trim(),
      ])
  );
}

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

const env = readEnv();
const HOME = env.LOCAL_MYSQL_HOME;
const PORT = Number(env.DB_PORT || 3306);

function paths() {
  if (!HOME) {
    fail(
      "LOCAL_MYSQL_HOME is not set in .env.local.\n" +
        "  Set it to the folder containing the portable MySQL's server/ and data/\n" +
        "  directories, e.g. C:\\Users\\you\\acorn-dev\\mysql — see LOCAL-DEV.md."
    );
  }
  const basedir = path.join(HOME, "server");
  const datadir = path.join(HOME, "data");
  const mysqld = path.join(basedir, "bin", "mysqld.exe");
  if (!fs.existsSync(mysqld)) fail(`mysqld not found at ${mysqld}`);
  if (!fs.existsSync(datadir)) fail(`data directory not found at ${datadir}`);
  return { basedir, datadir, mysqld };
}

/** Connects without selecting a database, so it works even before the schema. */
async function connect() {
  return mysql.createConnection({
    host: env.DB_HOST || "127.0.0.1",
    port: PORT,
    user: env.DB_USER || "root",
    password: env.DB_PASSWORD,
    connectTimeout: 4000,
  });
}

async function isUp() {
  try {
    const c = await connect();
    await c.query("SELECT 1");
    await c.end();
    return true;
  } catch {
    return false;
  }
}

async function start() {
  if (await isUp()) {
    console.log(`  already running on port ${PORT}`);
    return;
  }
  const { basedir, datadir, mysqld } = paths();
  const log = path.join(HOME, "mysqld.log");

  // --log-error, not --console: a detached process has nowhere useful to send
  // stdout, and redirecting it to a file produced an empty file — so a failed
  // start looked like a hang with no explanation anywhere. Letting mysqld own
  // its error log means the reason is always on disk.
  //
  // detached + unref so the server outlives this script.
  const child = spawn(
    mysqld,
    [
      `--basedir=${basedir}`,
      `--datadir=${datadir}`,
      `--port=${PORT}`,
      `--log-error=${log}`,
    ],
    { detached: true, stdio: "ignore" }
  );

  // Without these, a process that fails to launch or dies on startup is
  // indistinguishable from one that is merely slow.
  let spawnError = null;
  let exitedEarly = null;
  child.on("error", (error) => {
    spawnError = error.message;
  });
  child.on("exit", (code) => {
    exitedEarly = code;
  });
  child.unref();

  process.stdout.write(`  starting mysqld (pid ${child.pid})`);
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    process.stdout.write(".");
    if (spawnError) {
      console.log("");
      fail(`could not launch mysqld: ${spawnError}`);
    }
    if (exitedEarly !== null) {
      console.log("");
      fail(
        `mysqld exited immediately (code ${exitedEarly}). The reason is at the ` +
          `end of ${log} — usually a stale mysqld still holding the data ` +
          "directory, or another server already on this port."
      );
    }
    if (await isUp()) {
      console.log(`\n  ready on port ${PORT}`);
      console.log(`  data:  ${datadir}`);
      console.log(`  log:   ${log}`);
      return;
    }
  }
  console.log("");
  fail(`did not become ready within 30s. Check ${log}`);
}

async function stop() {
  if (!(await isUp())) {
    console.log("  not running");
    return;
  }
  const c = await connect();
  try {
    // A protocol-level SHUTDOWN, so InnoDB flushes and closes its tablespaces
    // cleanly. Preferred over killing the process, which leaves recovery to
    // the next start. mysqladmin would do the same thing but hangs when run
    // without a real console on this machine.
    await c.query("SHUTDOWN");
  } catch {
    // The connection drops as the server goes down; that is the success case.
  }
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (!(await isUp())) {
      console.log("  stopped cleanly");
      return;
    }
  }
  fail("still responding after 10s; check the log");
}

async function status() {
  const up = await isUp();
  console.log(`  server:  ${up ? `running on port ${PORT}` : "not running"}`);
  if (HOME) console.log(`  home:    ${HOME}`);
  if (!up) return;

  const c = await connect();
  const [[info]] = await c.query("SELECT VERSION() version, @@datadir datadir");
  console.log(`  version: ${info.version}`);
  console.log(`  datadir: ${info.datadir}`);
  if (/[\\/]temp[\\/]/i.test(info.datadir)) {
    console.log(
      "  WARNING: the data directory is under a temp path and can be deleted\n" +
        "           automatically. See LOCAL-DEV.md."
    );
  }
  const db = env.DB_NAME;
  if (db) {
    const [tables] = await c.query(
      "SELECT TABLE_NAME name, TABLE_ROWS approx FROM information_schema.TABLES " +
        "WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
      [db]
    );
    console.log(`  database ${db}: ${tables.length} table(s)`);
    for (const t of tables) {
      // Qualified with the database: this connection deliberately selects none,
      // so that it can also report on a server with no schema loaded yet.
      const [[exact]] = await c.query(
        `SELECT COUNT(*) n FROM \`${db}\`.\`${t.name}\``
      );
      console.log(`     ${t.name.padEnd(22)} ${String(exact.n).padStart(4)} rows`);
    }
  }
  await c.end();
}

const command = process.argv[2];
const commands = { start, stop, status };
if (!commands[command]) {
  console.log("\n  usage: node scripts/mysql-local.mjs <start|stop|status>\n");
  process.exit(1);
}
await commands[command]();
