import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

async function scalar(conn, sql) {
  const r = await conn.query(sql);
  const first = r?.[0];
  return Number(Object.values(first || {c:0})[0] || 0);
}

export async function seedIfEmpty(conn) {
  const count = await scalar(conn, "SELECT COUNT(*) AS c FROM catalog_domains");
  if (count > 0) return;

  const catalogPath = path.join(process.cwd(), "data", "bcm_catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

  for (const d of catalog.domains) {
    const domainId = uuidv4();
    await conn.query("INSERT INTO catalog_domains (id, name) VALUES (?, ?)", [domainId, d.name]);

    for (const sd of d.subDomains) {
      const sdId = uuidv4();
      await conn.query("INSERT INTO catalog_subdomains (id, domain_id, name) VALUES (?, ?, ?)", [sdId, domainId, sd.name]);

      for (const cap of sd.capabilities) {
        const capId = uuidv4();
        await conn.query("INSERT INTO catalog_capabilities (id, subdomain_id, name) VALUES (?, ?, ?)", [capId, sdId, cap.name]);

        for (const feat of cap.features) {
          const featId = uuidv4();
          await conn.query(
            "INSERT INTO catalog_features (id, capability_id, bcm_id, name, excerpt) VALUES (?, ?, ?, ?, ?)",
            [featId, capId, feat.bcmId, feat.name, feat.excerpt]
          );
        }
      }
    }
  }

  const companyId = uuidv4();
  await conn.query("INSERT INTO companies (id, name) VALUES (?, ?)", [companyId, "Demo Company"]);

  const userId = uuidv4();
  const hash = bcrypt.hashSync("admin123", 10);
  await conn.query(
    "INSERT INTO users (id, company_id, email, display_name, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, companyId, "admin@example.com", "Administrator", hash, "admin"]
  );

  console.log("Seeded catalog + default admin (admin@example.com / admin123).");
}
