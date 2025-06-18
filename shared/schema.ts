import { pgTable, text, serial, integer, boolean, timestamp, json, date, pgEnum, uuid } from "drizzle-orm/pg-core";
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
  childPrice: integer("child_price"), // Prix pour les enfants (optionnel)
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

});

export const tourCards = pgTable("tour_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("THB"),
  customLink: text("custom_link").notNull(),
  images: json("images").notNull().$type<string[]>(),
  type: text("type").notNull().default("experience"), // "tour" ou "experience"
  tags: json("tags").$type<string[]>().default([]), // Tags pour catégoriser (villes, îles, etc.)
  createdAt: timestamp("created_at").defaultNow(),
});

export const reservationStatusEnum = pgEnum("reservation_status", ["pending", "confirmed", "cancelled", "completed"]);

export const tourAvailability = pgTable("tour_availability", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id").notNull().references(() => tours.id, { onDelete: "cascade" }),
  date: date("available_date").notNull(),
  maxCapacity: integer("max_capacity").notNull().default(10),
  currentBookings: integer("current_bookings").notNull().default(0),
  price: integer("price"), // Prix spécifique pour cette date (optionnel, sinon utilise le prix du tour)
  childPrice: integer("child_price"), // Prix spécifique pour les enfants (optionnel)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id").notNull().references(() => tours.id, { onDelete: "cascade" }),
  availabilityId: integer("availability_id").notNull().references(() => tourAvailability.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  numberOfPeople: integer("number_of_people").notNull(),
  numberOfChildren: integer("number_of_children").default(0), // Nombre d'enfants
  totalAmount: integer("total_amount").notNull(),
  status: reservationStatusEnum("status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCustomerId: text("stripe_customer_id"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertTourAvailabilitySchema = createInsertSchema(tourAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Créer le schéma de base
const baseReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  stripePaymentIntentId: true,
  stripeCustomerId: true,
});

// Créer un schéma personnalisé qui rend totalAmount optionnel
export const insertReservationSchema = baseReservationSchema.extend({
  totalAmount: z.number().optional(), // Sera calculé côté serveur si non fourni
  numberOfChildren: z.number().optional().default(0), // Nombre d'enfants optionnel
  stripeCustomerId: z.string().optional(), // Ajouté pour permettre l'ID du client Stripe
  stripePaymentIntentId: z.string().optional(), // Ajouté pour permettre l'ID de paiement Stripe
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTour = z.infer<typeof insertTourSchema>;
export type Tour = typeof tours.$inferSelect;

export type InsertCustomTourRequest = z.infer<typeof insertCustomTourRequestSchema>;
export type CustomTourRequest = typeof customTourRequests.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type InsertTourAvailability = z.infer<typeof insertTourAvailabilitySchema>;
export type TourAvailability = typeof tourAvailability.$inferSelect;

export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;

export const insertTourCardSchema = createInsertSchema(tourCards).omit({
  id: true,
  createdAt: true,
});

// Blog system tables
export const blogPostStatusEnum = pgEnum("blog_post_status", ["draft", "published"]);

export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogTags = pgTable("blog_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  categoryId: integer("category_id").references(() => blogCategories.id, { onDelete: "set null" }),
  status: blogPostStatusEnum("status").notNull().default("draft"),
  publishDate: timestamp("publish_date"),
  authorName: text("author_name").default("Amon Tour"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogPostTags = pgTable("blog_post_tags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => blogTags.id, { onDelete: "cascade" }),
});

// Blog schema validations
export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogTagSchema = createInsertSchema(blogTags).omit({
  id: true,
  slug: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  tagIds: z.array(z.number()).optional(),
});

export type InsertTourCard = z.infer<typeof insertTourCardSchema>;
export type TourCard = typeof tourCards.$inferSelect;

export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;

export type InsertBlogTag = z.infer<typeof insertBlogTagSchema>;
export type BlogTag = typeof blogTags.$inferSelect;

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export type BlogPostTag = typeof blogPostTags.$inferSelect;
