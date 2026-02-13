import ibmdb from "ibm_db";
import fs from "fs";
import path from "path";

function loadOverride() {
  try {
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
    const p = path.join(uploadDir, "db-conn.json");
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf-8");
    const cfg = JSON.parse(raw);
    return cfg;
  } catch {
    return null;
  }
}

export function getConnStr() {
  const ov = loadOverride() || {};
  const host = ov.DB2_HOST || process.env.DB2_HOST || "localhost";
  const port = ov.DB2_PORT || process.env.DB2_PORT || "50000";
  const db = ov.DB2_DB || process.env.DB2_DB || "BCMDB";
  const uid = ov.DB2_USER || process.env.DB2_USER || "db2inst1";
  const pwd = ov.DB2_PASSWORD || process.env.DB2_PASSWORD || "passw0rd";
  return `DATABASE=${db};HOSTNAME=${host};PORT=${port};PROTOCOL=TCPIP;UID=${uid};PWD=${pwd};`;
}

export async function openConnection() {
  return await ibmdb.open(getConnStr());
}
