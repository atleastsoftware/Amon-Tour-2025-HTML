import { z } from "zod";

const email = z.string().email();
export const customTourSchema = z.object({
  fullName: z.string().min(1), email, phoneNumber: z.string().min(1),
  numberOfAdults: z.number().min(0).default(1), numberOfKids: z.number().min(0).default(0),
  tripDates: z.string().optional(), duration: z.string().optional(),
  interests: z.array(z.string()).default([]), tripTypes: z.array(z.string()).default([]),
  destinations: z.array(z.string()).default([]), message: z.string().optional().default(""),
  status: z.enum(["new", "in_progress", "archived"]).default("new"),
});
export const contactSchema = z.object({
  name: z.string().min(1), email, subject: z.string().min(1), message: z.string().min(1),
});
export const cruiseSchema = z.object({
  fullName: z.string().min(2), email, phone: z.string().optional(), duration: z.string().min(1),
  itinerary: z.string().optional(), numberOfGuests: z.number().min(1).max(8),
  preferredDates: z.string().optional(), budget: z.string().optional(), specialRequests: z.string().optional(),
});
export const krabiSchema = z.object({
  name: z.string().min(1), email, whatsapp: z.string().optional(), celebrationType: z.string().min(1),
  guests: z.number().min(1), date: z.string().min(1), budget: z.string().optional(), description: z.string().optional(),
});
export const partnershipSchema = z.object({
  contactName: z.string().min(1), companyName: z.string().min(1), email,
  phone: z.string().optional(), website: z.string().optional(), partnershipType: z.string().min(1),
  description: z.string().optional(),
});
export const groupSchema = z.object({
  contactName: z.string().min(1), companyName: z.string().min(1), email,
  phone: z.string().optional(), groupSize: z.number().min(1), travelDates: z.string().optional(),
  budget: z.string().optional(), description: z.string().optional(),
});
export const newsletterSchema = z.object({ email, language: z.string().default("en") });