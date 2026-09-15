import fs from "node:fs";
import path from "node:path";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Node 20 n'a pas de WebSocket global : requis par le pilote Neon serverless.
neonConfig.webSocketConstructor = ws as any;

const TABLES: Record<string, Record<string, string>> = {
  custom_tour_requests: {
    fullName: "full_name", email: "email", phoneNumber: "phone_number", numberOfAdults: "number_of_adults",
    numberOfKids: "number_of_kids", tripDates: "trip_dates", duration: "duration", interests: "interests",
    tripTypes: "trip_types", destinations: "destinations", message: "message", status: "status",
  },
  contact_messages: { name: "name", email: "email", subject: "subject", message: "message" },
  krabi_celebration_requests: {
    name: "name", email: "email", whatsapp: "whatsapp", celebrationType: "celebration_type",
    guests: "guests", date: "date", budget: "budget", description: "description",
  },
  partnership_requests: {
    contactName: "contact_name", companyName: "company_name", email: "email", phone: "phone",
    website: "website", partnershipType: "partnership_type", description: "description",
  },
  cruise_requests: {
    fullName: "full_name", email: "email", phone: "phone", duration: "duration", itinerary: "itinerary",
    numberOfGuests: "number_of_guests", preferredDates: "preferred_dates", budget: "budget",
    specialRequests: "special_requests", status: "status",
  },
  group_requests: {
    contactName: "contact_name", companyName: "company_name", email: "email", phone: "phone",
    groupSize: "group_size", travelDates: "travel_dates", budget: "budget", description: "description",
  },
  newsletter_subscriptions: {
    email: "email", language: "language", confirmed: "confirmed", unsubscribed: "unsubscribed",
    confirmationToken: "confirmation_token",
  },
};

function camel(row: Record<string, any>) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [
    key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), value,
  ]));
}

export class EdgeStorage {
  private pool?: Pool;
  constructor(private repoRoot: string, private dataDir = path.join(repoRoot, "edge/data")) {
    if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL requis en production : le stockage local des demandes est interdit.");
    }
    if (process.env.DATABASE_URL) this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  async insert(table: keyof typeof TABLES, data: Record<string, any>) {
    const now = new Date().toISOString();
    if (this.pool) {
      const mapping = TABLES[table];
      const pairs = Object.entries(data).filter(([key]) => mapping[key]);
      const columns = pairs.map(([key]) => `"${mapping[key]}"`).join(",");
      const values = pairs.map((_, index) => `$${index + 1}`).join(",");
      const result = await this.pool.query(`INSERT INTO "${table}" (${columns}) VALUES (${values}) RETURNING *`,
        pairs.map(([key, value]) =>
          table === "custom_tour_requests" && ["interests", "tripTypes", "destinations"].includes(key) && value !== null
            ? JSON.stringify(value)
            : value));
      return camel(result.rows[0]);
    }
    fs.mkdirSync(this.dataDir, { recursive: true });
    const existing = this.readJsonl(table);
    const record = { id: existing.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1,
      ...data, createdAt: now };
    fs.appendFileSync(path.join(this.dataDir, `${table}.jsonl`), `${JSON.stringify(record)}\n`);
    return record;
  }
  private readJsonl(table: string) {
    const file = path.join(this.dataDir, `${table}.jsonl`);
    if (!fs.existsSync(file)) return [];
    return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
  }
  private readArchive(table: string) {
    const root = path.join(this.repoRoot, "exports/archive");
    if (!fs.existsSync(root)) return [];
    const candidates: string[] = [];
    const walk = (dir: string) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === `${table}.json`) candidates.push(full);
    });
    walk(root);
    const latest = candidates.sort().at(-1);
    if (!latest) return [];
    const parsed = JSON.parse(fs.readFileSync(latest, "utf8"));
    return Array.isArray(parsed) ? parsed.map(camel) : [];
  }
  async list(table: keyof typeof TABLES, filters: { status?: string; since?: Date } = {}) {
    let rows: any[];
    if (this.pool) {
      const clauses: string[] = [];
      const values: any[] = [];
      if (filters.status) { values.push(filters.status); clauses.push(`status = $${values.length}`); }
      if (filters.since) { values.push(filters.since); clauses.push(`created_at >= $${values.length}`); }
      const result = await this.pool.query(`SELECT * FROM "${table}"${clauses.length ? ` WHERE ${clauses.join(" AND ")}` : ""} ORDER BY created_at DESC`, values);
      rows = result.rows.map(camel);
    } else {
      rows = [...this.readArchive(table), ...this.readJsonl(table)];
      if (filters.status) rows = rows.filter((row) => row.status === filters.status);
      if (filters.since) rows = rows.filter((row) => new Date(row.createdAt) >= filters.since!);
    }
    return rows;
  }
  async findNewsletter(email: string) {
    return (await this.list("newsletter_subscriptions")).find((row) => row.email === email);
  }
  async unsubscribe(email: string) {
    if (this.pool) {
      const result = await this.pool.query("UPDATE newsletter_subscriptions SET unsubscribed=true WHERE email=$1 RETURNING *", [email]);
      return result.rows[0] ? camel(result.rows[0]) : null;
    }
    const current = await this.findNewsletter(email);
    if (!current) return null;
    return current; // L'historique JSONL est immuable ; l'événement est conservé séparément.
  }
}