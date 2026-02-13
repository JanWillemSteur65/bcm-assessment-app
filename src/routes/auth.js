import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { openConnection } from "../db/connection.js";

const router = express.Router();

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", { expiresIn: "12h" });
}

router.post("/login", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  // Fallback local admin to allow first-time login even when DB2 is not connected yet.
  // Use Settings to configure Db2, then refresh and login will be DB-backed.
  if (value.email === "admin@example.com" && value.password === "admin123") {
    const token = signToken({
      userId: "local-admin",
      companyId: "local",
      email: value.email,
      role: "admin",
      name: "Administrator"
    });
    return res.json({ token, mode: "fallback" });
  }

  let conn;
  try {
    conn = await openConnection();
    const rows = await conn.query(
      "SELECT id, company_id, email, display_name, password_hash, role FROM users WHERE email = ?",
      [value.email]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const u = rows[0];
    const ok = bcrypt.compareSync(value.password, u.PASSWORD_HASH || u.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({
      userId: u.ID || u.id,
      companyId: u.COMPANY_ID || u.company_id,
      email: u.EMAIL || u.email,
      role: u.ROLE || u.role,
      name: u.DISPLAY_NAME || u.display_name
    });
    return res.json({ token, mode: "db" });
  } catch (e) {
    return res.status(503).json({ error: "Database not available. Use admin@example.com / admin123 to configure Db2 in Settings." });
  } finally {
    try { if (conn) conn.closeSync(); } catch {}
  }
});

export default router;
