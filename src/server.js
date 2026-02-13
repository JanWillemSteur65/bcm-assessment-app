import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { initDb } from "./db/init.js";
import { dbState } from "./db/state.js";
import systemRoutes from "./routes/system.js";
import authRoutes from "./routes/auth.js";
import catalogRoutes from "./routes/catalog.js";
import assessmentRoutes from "./routes/assessments.js";
import uploadRoutes from "./routes/uploads.js";

dotenv.config();

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("combined"));
app.use(fileUpload());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const publicDir = path.join(process.cwd(), "public");

app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/system", systemRoutes);

app.use(express.static(publicDir));
app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));


const startDbInit = async () => {
  while (true) {
    try {
      await initDb();
      // If connected, sleep longer; initDb will be fast on subsequent starts
      await new Promise(r => setTimeout(r, 60000));
    } catch (e) {
      // Keep retrying in background
      const msg = e?.message || String(e);
      dbState.connected = false;
      dbState.lastError = msg;
      dbState.lastAttemptAt = new Date().toISOString();
      await new Promise(r => setTimeout(r, 5000));
    }
  }
};
startDbInit();

app.listen(PORT, () => console.log(`BCM Assessment listening on :${PORT}`));
