import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  duration: text("duration").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
  tourNinjaUrl: text("tour_ninja_url").notNull(),
  featured: boolean("featured").default(false),
});

export const customTourRequests = pgTable("custom_tour_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  travelers: text("travelers").notNull(),
  duration: text("duration").notNull(),
  interests: json("interests").notNull().$type<string[]>(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
});

export const insertCustomTourRequestSchema = createInsertSchema(customTourRequests).omit({
  id: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTour = z.infer<typeof insertTourSchema>;
export type Tour = typeof tours.$inferSelect;

export type InsertCustomTourRequest = z.infer<typeof insertCustomTourRequestSchema>;
export type CustomTourRequest = typeof customTourRequests.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
