import { pgTable, text, serial, integer, boolean, timestamp, json, date, pgEnum, uuid, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Simple admin users table for basic authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Sessions removed - public site only

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

// Status enum for custom tour requests
export const customTourStatusEnum = pgEnum("custom_tour_status", ["new", "in_progress", "archived"]);

export const customTourRequests = pgTable("custom_tour_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  numberOfAdults: integer("number_of_adults").notNull().default(1),
  numberOfKids: integer("number_of_kids").notNull().default(0),
  tripDates: text("trip_dates"), // Store as string for flexibility
  duration: text("duration"), // Made optional
  interests: json("interests").$type<string[]>().default([]),
  tripTypes: json("trip_types").$type<string[]>().default([]),
  destinations: json("destinations").$type<string[]>().default([]),
  message: text("message").notNull(),
  status: customTourStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow(),
  archivedAt: timestamp("archived_at"),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tourCards = pgTable("tour_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("THB"),
  customLink: text("custom_link").notNull(),
  images: text("images").array().notNull(),
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

// Newsletter subscription table
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  confirmed: boolean("confirmed").default(false),
  unsubscribed: boolean("unsubscribed").default(false),
  confirmationToken: text("confirmation_token"),
  language: text("language").default("en"),
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  subscribedAt: true,
  confirmed: true,
  unsubscribed: true,
  confirmationToken: true,
}).extend({
  email: z.string().email("Valid email address is required"),
});

export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

// Tour Ninja Image Override table
export const tourNinjaImageOverrides = pgTable("tour_ninja_image_overrides", {
  id: serial("id").primaryKey(),
  tourNinjaId: text("tour_ninja_id").notNull().unique(),
  tourName: text("tour_name").notNull(),
  customImageUrl: text("custom_image_url").notNull(),
  originalImageUrl: text("original_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTourNinjaImageOverrideSchema = createInsertSchema(tourNinjaImageOverrides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTourNinjaImageOverride = z.infer<typeof insertTourNinjaImageOverrideSchema>;
export type TourNinjaImageOverride = typeof tourNinjaImageOverrides.$inferSelect;

// Custom tour request schema validation
export const insertCustomTourRequestSchema = createInsertSchema(customTourRequests).omit({
  id: true,
  createdAt: true,
  archivedAt: true,
}).extend({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  numberOfAdults: z.number().min(1, "At least 1 adult is required"),
  numberOfKids: z.number().min(0, "Number of kids cannot be negative"),
  tripDates: z.string().optional(),
  duration: z.string().optional(),
  interests: z.array(z.string()).default([]),
  tripTypes: z.array(z.string()).default([]),
  destinations: z.array(z.string()).default([]),
  message: z.string().min(1, "Message is required"),
  status: z.enum(["new", "in_progress", "archived"]).default("new"),
}).refine(
  (data) => {
    // At least one of tripDates or duration must be provided
    return (data.tripDates && data.tripDates.trim() !== "") || 
           (data.duration && data.duration.trim() !== "");
  },
  {
    message: "Please provide either your trip dates or an approximate duration.",
    path: ["tripDates"],
  }
);

export type InsertCustomTourRequest = z.infer<typeof insertCustomTourRequestSchema>;
export type CustomTourRequest = typeof customTourRequests.$inferSelect;

// Krabi Celebration Requests
export const krabiCelebrationRequests = pgTable("krabi_celebration_requests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  celebrationType: varchar("celebration_type", { length: 100 }).notNull(),
  guests: integer("guests").notNull(),
  date: varchar("date", { length: 100 }).notNull(),
  budget: varchar("budget", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false).notNull(),
});

export type KrabiCelebrationRequest = typeof krabiCelebrationRequests.$inferSelect;
export const insertKrabiCelebrationRequestSchema = createInsertSchema(krabiCelebrationRequests).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email address is required"),
  celebrationType: z.string().min(1, "Celebration type is required"),
  guests: z.number().min(1, "Number of guests is required"),
  date: z.string().min(1, "Date is required"),
});
export type InsertKrabiCelebrationRequest = z.infer<typeof insertKrabiCelebrationRequestSchema>;

// Partnership Requests
export const partnershipRequests = pgTable("partnership_requests", {
  id: serial("id").primaryKey(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  partnershipType: varchar("partnership_type", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false).notNull(),
});

export type PartnershipRequest = typeof partnershipRequests.$inferSelect;
export const insertPartnershipRequestSchema = createInsertSchema(partnershipRequests).omit({
  id: true,
  createdAt: true,
}).extend({
  contactName: z.string().min(1, "Contact name is required"),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email address is required"),
  partnershipType: z.string().min(1, "Partnership type is required"),
});
export type InsertPartnershipRequest = z.infer<typeof insertPartnershipRequestSchema>;

// Group Requests
export const groupRequests = pgTable("group_requests", {
  id: serial("id").primaryKey(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  groupSize: integer("group_size").notNull(),
  travelDates: varchar("travel_dates", { length: 255 }),
  budget: varchar("budget", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false).notNull(),
});

export type GroupRequest = typeof groupRequests.$inferSelect;
export const insertGroupRequestSchema = createInsertSchema(groupRequests).omit({
  id: true,
  createdAt: true,
}).extend({
  contactName: z.string().min(1, "Contact name is required"),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email address is required"),
  groupSize: z.number().min(1, "Group size is required"),
});
export type InsertGroupRequest = z.infer<typeof insertGroupRequestSchema>;

// Site Appearance Management System
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(), // "theme", "header", "footer", "navigation", "general"
  key: text("key").notNull(),
  value: text("value"),
  type: text("type").notNull(), // "text", "image", "json", "boolean", "color"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sectionKeyIdx: index("site_settings_section_key_idx").on(table.section, table.key),
}));

export const contentBlocks = pgTable("content_blocks", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull().unique(), // "hero_home", "about_section", etc.
  title: text("title"),
  subtitle: text("subtitle"),
  content: text("content"), // HTML content
  imageUrl: text("image_url"),
  ctaText: text("cta_text"),
  ctaUrl: text("cta_url"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  pageLocation: text("page_location").notNull(), // "home", "tours", "about", "contact"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const staticPages = pgTable("static_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  content: text("content").notNull(), // Rich text content
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mediaLibrary = pgTable("media_library", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // "image", "video", "document"
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  altText: text("alt_text"),
  caption: text("caption"),
  folder: text("folder").default("general"),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas for validation
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentBlockSchema = createInsertSchema(contentBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaticPageSchema = createInsertSchema(staticPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaLibrarySchema = createInsertSchema(mediaLibrary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

export type InsertContentBlock = z.infer<typeof insertContentBlockSchema>;
export type ContentBlock = typeof contentBlocks.$inferSelect;

export type InsertStaticPage = z.infer<typeof insertStaticPageSchema>;
export type StaticPage = typeof staticPages.$inferSelect;

export type InsertMediaLibrary = z.infer<typeof insertMediaLibrarySchema>;
export type MediaLibrary = typeof mediaLibrary.$inferSelect;

// Modular Page Builder System
export const blockTypeEnum = pgEnum("block_type", [
  // Hero Sections
  "hero_video",    // Hero avec vidéo de fond
  "hero_banner",   // Hero avec image statique
  "hero",          // Hero générique
  
  // Content Sections
  "text_section",  // Section de texte centré avec titre
  "text_image",    // Section texte + image (2 colonnes)
  "about_2col",    // Section À propos 2 colonnes
  
  // Interactive Sections
  "tour_grid",     // Grille de tours Tour Ninja
  "cards_grid",    // Grille de cartes
  "card_grid",     // Alias pour compatibilité
  "search_bar",    // Barre de recherche
  "search_module", // Module de recherche (alias)
  
  // Features & Layout
  "features_3col", // 3 colonnes avec icônes
  "advantages",    // Grille d'avantages (alias)
  "testimonials",  // Carousel d'avis
  
  // Contact & Forms
  "contact_cards", // Cartes de contact avec icônes
  "contact_info",  // Informations de contact
  "custom_form",   // Formulaires personnalisés
  "form",          // Alias pour compatibilité
  
  // Call to Actions
  "cta_banner",    // Bannière d'appel à l'action
  "cta_section",   // Section d'appel à l'action
  
  // Media & Maps
  "map_section",   // Carte intégrée
  "gallery",       // Galerie d'images
  "video_section", // Section vidéo
  "video_hero",    // Alias pour hero_video
  
  // Utility & Social
  "newsletter",    // Inscription newsletter
  "social_media",  // Liens sociaux
  "pdf_download",  // Téléchargement de PDF
  "interests",     // Section intérêts/destinations
]);

// Configuration des pages
export const pageConfigurations = pgTable("page_configurations", {
  id: serial("id").primaryKey(),
  pageSlug: text("page_slug").notNull().unique(), // "home", "experiences", "custom-tour", etc.
  pageName: text("page_name").notNull(), // "Accueil", "Expériences", etc.
  pageType: text("page_type").notNull(), // "main" ou "secondary"
  isActive: boolean("is_active").default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blocs de page individuels
export const pageBlocks = pgTable("page_blocks", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").notNull().references(() => pageConfigurations.id, { onDelete: "cascade" }),
  blockType: blockTypeEnum("block_type").notNull(),
  blockOrder: integer("block_order").notNull().default(0),
  identifier: text("identifier").notNull(), // "hero", "why_choose_us", etc.
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  content: text("content"), // Contenu HTML/Markdown
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  ctaText: text("cta_text"),
  ctaUrl: text("cta_url"),
  ctaStyle: text("cta_style").default("primary"), // "primary", "secondary", "outline"
  iconName: text("icon_name"), // Nom de l'icône Lucide
  backgroundColor: text("background_color").default("white"),
  configuration: json("configuration").$type<Record<string, any>>().default({}), // Config spécifique au bloc
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  pageBlockOrderIdx: index("page_blocks_page_order_idx").on(table.pageId, table.blockOrder),
}));

// Table d'historique pour le versioning des blocs
export const pageBlockHistory = pgTable("page_block_history", {
  id: serial("id").primaryKey(),
  blockId: integer("block_id").notNull().references(() => pageBlocks.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1), // Numéro de version
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  content: text("content"),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  ctaText: text("cta_text"),
  ctaUrl: text("cta_url"),
  ctaStyle: text("cta_style"),
  iconName: text("icon_name"),
  backgroundColor: text("background_color"),
  configuration: json("configuration").$type<Record<string, any>>().default({}),
  isActive: boolean("is_active"),
  changeDescription: text("change_description"), // Description des changements
  createdBy: text("created_by").default("admin"), // Qui a fait le changement
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  blockVersionIdx: index("page_block_history_block_version_idx").on(table.blockId, table.version),
  blockCreatedIdx: index("page_block_history_block_created_idx").on(table.blockId, table.createdAt),
}));

// Templates de blocs réutilisables
export const blockTemplates = pgTable("block_templates", {
  id: serial("id").primaryKey(),
  templateName: text("template_name").notNull().unique(),
  blockType: blockTypeEnum("block_type").notNull(),
  defaultConfiguration: json("default_configuration").$type<Record<string, any>>().default({}),
  previewImage: text("preview_image"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas pour les nouvelles tables
export const insertPageConfigurationSchema = createInsertSchema(pageConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageBlockSchema = createInsertSchema(pageBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageBlockHistorySchema = createInsertSchema(pageBlockHistory).omit({
  id: true,
  createdAt: true,
});

export const insertBlockTemplateSchema = createInsertSchema(blockTemplates).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertPageConfiguration = z.infer<typeof insertPageConfigurationSchema>;
export type PageConfiguration = typeof pageConfigurations.$inferSelect;

export type InsertPageBlock = z.infer<typeof insertPageBlockSchema>;
export type PageBlock = typeof pageBlocks.$inferSelect;

export type InsertPageBlockHistory = z.infer<typeof insertPageBlockHistorySchema>;
export type PageBlockHistory = typeof pageBlockHistory.$inferSelect;

export type InsertBlockTemplate = z.infer<typeof insertBlockTemplateSchema>;
export type BlockTemplate = typeof blockTemplates.$inferSelect;

// Navigation Menu Management System
export const navigationMenuItems: any = pgTable("navigation_menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Nom affiché dans le menu
  url: text("url").notNull(), // Lien de redirection
  displayOrder: integer("display_order").notNull().default(0), // Ordre d'affichage
  parentId: integer("parent_id").references(() => navigationMenuItems.id, { onDelete: "cascade" }), // Pour les sous-menus
  isActive: boolean("is_active").default(true),
  iconName: text("icon_name"), // Icône optionnelle (Lucide)
  description: text("description"), // Description pour l'admin
  target: text("target").default("_self"), // "_self" ou "_blank"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table): any => ({
  orderIdx: index("navigation_items_order_idx").on(table.displayOrder),
  parentIdx: index("navigation_items_parent_idx").on(table.parentId),
}));

// Schema de validation pour les éléments de menu
export const insertNavigationMenuItemSchema = createInsertSchema(navigationMenuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertNavigationMenuItem = z.infer<typeof insertNavigationMenuItemSchema>;
export type NavigationMenuItem = typeof navigationMenuItems.$inferSelect;
