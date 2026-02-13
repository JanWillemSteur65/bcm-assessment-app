import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { openConnection } from "../db/connection.js";

const router = express.Router();

router.get("/tree", requireAuth, async (_req, res) => {
  const conn = await openConnection();
  try {
    const domains = await conn.query("SELECT id, name FROM catalog_domains ORDER BY name");
    const subdomains = await conn.query("SELECT id, domain_id, name FROM catalog_subdomains ORDER BY name");
    const caps = await conn.query("SELECT id, subdomain_id, name FROM catalog_capabilities ORDER BY name");
    const feats = await conn.query("SELECT id, capability_id, bcm_id, name, excerpt FROM catalog_features ORDER BY name");

    const dmap = new Map(domains.map(d => [d.ID || d.id, { id: d.ID || d.id, name: d.NAME || d.name, subDomains: [] }]));
    const sdmap = new Map(subdomains.map(s => [s.ID || s.id, { id: s.ID || s.id, name: s.NAME || s.name, domainId: s.DOMAIN_ID || s.domain_id, capabilities: [] }]));
    const cmap = new Map(caps.map(c => [c.ID || c.id, { id: c.ID || c.id, name: c.NAME || c.name, subDomainId: c.SUBDOMAIN_ID || c.subdomain_id, features: [] }]));

    const sdById = new Map();
    for (const sd of sdmap.values()) {
      dmap.get(sd.domainId)?.subDomains.push({ id: sd.id, name: sd.name, capabilities: [] });
    }
    for (const d of dmap.values()) for (const sd of d.subDomains) sdById.set(sd.id, sd);

    const capById = new Map();
    for (const c of cmap.values()) {
      sdById.get(c.subDomainId)?.capabilities.push({ id: c.id, name: c.name, features: [] });
    }
    for (const sd of sdById.values()) for (const c of sd.capabilities) capById.set(c.id, c);

    for (const f of feats) {
      const capId = f.CAPABILITY_ID || f.capability_id;
      capById.get(capId)?.features.push({
        id: f.ID || f.id,
        bcmId: f.BCM_ID || f.bcm_id,
        name: f.NAME || f.name,
        excerpt: f.EXCERPT || f.excerpt
      });
    }

    res.json({ domains: Array.from(dmap.values()) });
  } finally {
    conn.closeSync();
  }
});

export default router;
