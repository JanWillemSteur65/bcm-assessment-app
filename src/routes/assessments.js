import express from "express";
import { v4 as uuidv4 } from "uuid";
import Joi from "joi";
import { requireAuth } from "../middleware/auth.js";
import { openConnection } from "../db/connection.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const conn = await openConnection();
  try {
    const rows = await conn.query(
      "SELECT id, title, created_at FROM assessments WHERE company_id = ? ORDER BY created_at DESC",
      [req.user.companyId]
    );
    res.json({ assessments: rows });
  } finally {
    conn.closeSync();
  }
});

router.post("/", requireAuth, async (req, res) => {
  const schema = Joi.object({ title: Joi.string().min(1).required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const id = uuidv4();
  const conn = await openConnection();
  try {
    await conn.query(
      "INSERT INTO assessments (id, company_id, created_by, title) VALUES (?, ?, ?, ?)",
      [id, req.user.companyId, req.user.userId, value.title]
    );
    res.json({ id });
  } finally {
    conn.closeSync();
  }
});

router.get("/:id/answers", requireAuth, async (req, res) => {
  const conn = await openConnection();
  try {
    const rows = await conn.query("SELECT * FROM assessment_answers WHERE assessment_id = ?", [req.params.id]);
    res.json({ answers: rows });
  } finally {
    conn.closeSync();
  }
});

router.put("/:id/answers/:featureId", requireAuth, async (req, res) => {
  const schema = Joi.object({
    inUse: Joi.string().valid("Yes","Partial","No").allow(null, ""),
    extent: Joi.number().integer().min(1).max(5).allow(null),
    evidence: Joi.string().valid("Yes","No").allow(null, ""),
    notes: Joi.string().allow(null, "")
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const conn = await openConnection();
  try {
    const existing = await conn.query(
      "SELECT id FROM assessment_answers WHERE assessment_id=? AND feature_id=?",
      [req.params.id, req.params.featureId]
    );
    if (existing.length) {
      await conn.query(
        "UPDATE assessment_answers SET in_use=?, extent=?, evidence=?, notes=?, updated_at=CURRENT TIMESTAMP WHERE assessment_id=? AND feature_id=?",
        [value.inUse, value.extent, value.evidence, value.notes, req.params.id, req.params.featureId]
      );
    } else {
      await conn.query(
        "INSERT INTO assessment_answers (id, assessment_id, feature_id, in_use, extent, evidence, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [uuidv4(), req.params.id, req.params.featureId, value.inUse, value.extent, value.evidence, value.notes]
      );
    }
    res.json({ ok: true });
  } finally {
    conn.closeSync();
  }
});

export default router;
