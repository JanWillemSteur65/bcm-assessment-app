import fs from "fs";
import path from "path";
import { openConnection } from "./connection.js";
import { dbState } from "./state.js";
import { seedIfEmpty } from "../seed/seed.js";

async function execSql(conn, sql) {
  const stmts = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
  for (const stmt of stmts) {
    try { await conn.query(stmt); }
    catch (e) {
      const msg = String(e.message || e);
      if (!/SQLSTATE=42710|already exists/i.test(msg)) throw e;
    }
  }
}

export async function initDb() {
  const maxAttempts = Number(process.env.DB_CONNECT_ATTEMPTS || 60); // 60 * 5s = 5 minutes
  const delayMs = Number(process.env.DB_CONNECT_DELAY_MS || 5000);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let conn;
    try {
      conn = await openConnection();
      const schemaSql = fs.readFileSync(path.join(process.cwd(), "src/db/schema.sql"), "utf-8");
      await execSql(conn, schemaSql);
      await seedIfEmpty(conn);
      dbState.connected = true;
      dbState.lastError = null;
      console.log("DB2 connected and initialized.");
      return;
    } catch (e) {
      const msg = e?.message || String(e);
      dbState.connected = false;
      dbState.lastError = msg;
      dbState.lastAttemptAt = new Date().toISOString();
      console.error(`DB2 init attempt ${attempt}/${maxAttempts} failed: ${msg}`);
      if (attempt === maxAttempts) throw e;
      await new Promise(r => setTimeout(r, delayMs));
    } finally {
      try { if (conn) conn.closeSync(); } catch {}
    }
  }
}
