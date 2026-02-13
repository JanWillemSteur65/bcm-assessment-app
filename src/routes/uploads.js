import express from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth.js";
import { openConnection } from "../db/connection.js";

const router = express.Router();

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

router.post("/file", requireAuth, async (req, res) => {
  if (!req.files || !req.files.file) return res.status(400).json({ error: "Missing file" });

  const up = req.files.file;
  const id = uuidv4();
  const stored = `${id}-${up.name}`.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  ensureDir(uploadDir);

  await up.mv(path.join(uploadDir, stored));

  const conn = await openConnection();
  try {
    await conn.query(
      "INSERT INTO files (id, company_id, original_name, stored_name, mime, size) VALUES (?, ?, ?, ?, ?, ?)",
      [id, req.user.companyId, up.name, stored, up.mimetype, up.size]
    );
    res.json({ id });
  } finally {
    conn.closeSync();
  }
});

export default router;
