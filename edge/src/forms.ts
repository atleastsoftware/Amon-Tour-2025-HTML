import { Router } from "express";
import { ZodError, type ZodType } from "zod";
import { EdgeStorage } from "./storage.js";
import {
  contactSchema, cruiseSchema, customTourSchema, groupSchema, krabiSchema, newsletterSchema, partnershipSchema,
} from "./schemas.js";
import { transformCruiseToTourNinja, transformCustomTourToTourNinja } from "./transforms.js";
import { sendFormNotification } from "./email.js";

function auth(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Authorization header required" });
  const syncToken = process.env.TOUR_NINJA_SYNC_TOKEN || process.env.TOUR_NINJA_API_KEY;
  if (!syncToken) return res.status(503).json({ success: false, message: "Tour Ninja synchronization is not configured" });
  if (!syncToken || header.slice(7) !== syncToken) return res.status(403).json({ success: false, message: "Invalid API key" });
  next();
}

export function createFormsRouter(storage: EdgeStorage) {
  const router = Router();
  const post = (url: string, table: any, schema: ZodType, success: (record: any) => any,
    coerce?: (body: any) => any, emailType?: string) => {
    router.post(url, async (req, res) => {
      try {
        const data = schema.parse(coerce ? coerce(req.body) : req.body);
        const record = await storage.insert(table, data);
        if (emailType) void sendFormNotification(emailType, data, record.id);
        res.status(201).json(success(record));
      } catch (error: any) {
        res.status(400).json({ message: "Invalid request data", error: error instanceof ZodError ? error.issues : error?.message || String(error) });
      }
    });
  };
  post("/api/custom-tour-requests", "custom_tour_requests", customTourSchema,
    (request) => ({ message: "Custom tour request submitted successfully", request }));
  post("/api/contact-messages", "contact_messages", contactSchema,
    (contactMessage) => ({ message: "Contact message sent successfully", contactMessage }));
  post("/api/krabi-celebration", "krabi_celebration_requests", krabiSchema,
    (request) => ({ message: "Krabi Celebration request submitted successfully", id: request.id }),
    (body) => ({ ...body, guests: parseInt(body.guests, 10) || 0 }), "krabi-celebration");
  post("/api/partnership-requests", "partnership_requests", partnershipSchema,
    (request) => ({ message: "Partnership request submitted successfully", id: request.id }), undefined, "partnership");
  post("/api/group-requests", "group_requests", groupSchema,
    (request) => ({ message: "Group request submitted successfully", id: request.id }),
    (body) => ({ ...body, groupSize: parseInt(body.groupSize, 10) || 0 }), "group-corporate");
  router.post("/api/cruise-requests", async (req, res) => {
    try {
      const data = cruiseSchema.parse(req.body);
      const request = await storage.insert("cruise_requests", { ...data, status: "pending" });
      res.status(201).json({ message: "Demande de croisière envoyée avec succès", request });
    } catch (error) { res.status(400).json({ message: "Données invalides", error }); }
  });
  router.post("/api/custom-tour", async (req, res) => {
    try {
      const data = customTourSchema.parse(req.body);
      if (!data.tripDates?.trim() && !data.duration?.trim()) throw new Error("Please provide either your trip dates or an approximate duration.");
      if (!data.tripTypes.length && !data.destinations.length) throw new Error("Please select at least one trip type or destination.");
      res.status(201).json(await storage.insert("custom_tour_requests", data));
    } catch (error: any) { res.status(400).json({ message: "Invalid request data", error: error?.issues || error?.message || String(error) }); }
  });
  router.post("/api/reservations", (_req, res) => res.status(410).json({ message: "Online reservations are no longer available. Please contact Amon Tour." }));

  router.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const data = newsletterSchema.parse(req.body);
      const existing = await storage.findNewsletter(data.email);
      if (existing && !existing.unsubscribed) return res.status(400).json({ message: "This email is already registered to our newsletter." });
      const subscription = await storage.insert("newsletter_subscriptions", { ...data, confirmed: true, unsubscribed: false });
      return res.status(201).json({ message: "Thank you for subscribing! You have been successfully added to our newsletter.", subscriptionId: subscription.id });
    } catch (error: any) { return res.status(400).json({ message: "Invalid subscription data", error: error?.issues || error?.message }); }
  });
  router.get("/api/newsletter/confirm", (req, res) => req.query.token
    ? res.status(404).json({ message: "Invalid or expired confirmation token." })
    : res.status(400).json({ message: "Invalid confirmation token." }));
  router.post("/api/newsletter/unsubscribe", async (req, res) => {
    if (!req.body.email || typeof req.body.email !== "string") return res.status(400).json({ message: "Email address is required." });
    const result = await storage.unsubscribe(req.body.email);
    return result ? res.json({ message: "You have been successfully unsubscribed from our newsletter." })
      : res.status(404).json({ message: "Email address not found in our subscription list." });
  });

  router.get("/api/sync/tour-ninja", auth, async (req, res) => {
    const filters: any = {};
    if (req.query.status && req.query.status !== "all") filters.status = ({
      received: "new", processing: "in_progress", completed: "archived",
    } as any)[String(req.query.status)] || req.query.status;
    if (req.query.since && !isNaN(new Date(String(req.query.since)).getTime())) filters.since = new Date(String(req.query.since));
    const data = (await storage.list("custom_tour_requests", filters)).map(transformCustomTourToTourNinja);
    res.json({ success: true, count: data.length, data, lastSync: new Date().toISOString(), filters });
  });
  router.get("/api/sync/cruise-requests", auth, async (req, res) => {
    const filters: any = {};
    if (req.query.status && req.query.status !== "all") filters.status = ({
      received: "pending", processing: "contacted", completed: "confirmed", cancelled: "cancelled",
    } as any)[String(req.query.status)] || req.query.status;
    if (req.query.since && !isNaN(new Date(String(req.query.since)).getTime())) filters.since = new Date(String(req.query.since));
    const data = (await storage.list("cruise_requests", filters)).map(transformCruiseToTourNinja);
    res.json({ success: true, count: data.length, data, lastSync: new Date().toISOString(), filters, type: "cruise_requests" });
  });
  return router;
}