import express from "express";
import fs from "fs";
import path from "path";
import Joi from "joi";
import { dbState } from "../db/state.js";

const router = express.Router();

function getCfgPath() {
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  return path.join(uploadDir, "db-conn.json");
}

router.get("/status", (_req, res) => {
  res.json({
    connected: dbState.connected,
    lastError: dbState.lastError,
    lastAttemptAt: dbState.lastAttemptAt
  });
});

router.get("/db-config", (_req, res) => {
  const p = getCfgPath();
  if (!fs.existsSync(p)) return res.json({ exists: false });
  const raw = fs.readFileSync(p, "utf-8");
  const cfg = JSON.parse(raw);
  // do NOT return password
  const safe = { ...cfg };
  if (safe.DB2_PASSWORD) safe.DB2_PASSWORD = "********";
  res.json({ exists: true, config: safe });
});

router.post("/db-config", (req, res) => {
  const schema = Joi.object({
    DB2_HOST: Joi.string().min(1).required(),
    DB2_PORT: Joi.string().min(2).required(),
    DB2_DB: Joi.string().min(1).required(),
    DB2_USER: Joi.string().min(1).required(),
    DB2_PASSWORD: Joi.string().min(1).required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const p = getCfgPath();
  fs.writeFileSync(p, JSON.stringify(value, null, 2), "utf-8");
  res.json({ ok: true });
});

export default router;
