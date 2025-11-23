CREATE TYPE "public"."block_type" AS ENUM('hero_video', 'hero_banner', 'hero', 'header_page', 'text', 'text_section', 'text_image', 'about_2col', 'tour_grid', 'cards_grid', 'card_grid', 'search_bar', 'search_module', 'search_bar_tours', 'features_3col', 'advantages', 'testimonials', 'contact', 'contact_cards', 'contact_info', 'custom_form', 'form', 'cta_banner', 'cta_section', 'map_section', 'gallery', 'video_section', 'video_hero', 'text_gallery', 'text_video', 'newsletter', 'social_media', 'pdf_download', 'interests', 'popular_experiences', 'custom_tour_form', 'tour_ninja_section', 'why_choose_us', 'who_we_are', 'expats_welcome', 'blog_search', 'text_listing', 'text_pricing');--> statement-breakpoint
CREATE TYPE "public"."blog_post_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."custom_tour_status" AS ENUM('new', 'in_progress', 'archived');--> statement-breakpoint
CREATE TYPE "public"."image_source_type" AS ENUM('upload', 'url');--> statement-breakpoint
CREATE TYPE "public"."page_type" AS ENUM('main', 'secondary', 'legal');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TABLE "block_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_name" text NOT NULL,
	"block_type" "block_type" NOT NULL,
	"default_configuration" json DEFAULT '{}'::json,
	"preview_image" text,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "block_templates_template_name_unique" UNIQUE("template_name")
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_post_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image" text,
	"category_id" integer,
	"status" "blog_post_status" DEFAULT 'draft' NOT NULL,
	"publish_date" timestamp,
	"author_name" text DEFAULT 'Amon Tour',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_tags_name_unique" UNIQUE("name"),
	CONSTRAINT "blog_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"title" text,
	"subtitle" text,
	"content" text,
	"image_url" text,
	"cta_text" text,
	"cta_url" text,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"page_location" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "content_blocks_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE "cruise_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"duration" text NOT NULL,
	"itinerary" text,
	"number_of_guests" integer NOT NULL,
	"preferred_dates" text,
	"budget" text,
	"special_requests" text,
	"status" text DEFAULT 'pending',
	"read" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_form_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_id" integer NOT NULL,
	"data" json NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"header_image" text,
	"layout" text DEFAULT 'single-column' NOT NULL,
	"form_layout" text DEFAULT 'columns',
	"background_color" text DEFAULT '#ffffff',
	"primary_color" text DEFAULT '#1e73be',
	"frame_color" text DEFAULT 'hsl(var(--background))',
	"title_color" text DEFAULT '#ffffff',
	"subtitle_color" text DEFAULT 'hsl(var(--muted-foreground))',
	"text_color" text DEFAULT '#333333',
	"fields" json DEFAULT '[]'::json NOT NULL,
	"settings" json DEFAULT '{}'::json,
	"translations" json DEFAULT '{"en":{},"fr":{},"es":{}}'::json,
	"translations_meta" json DEFAULT '{}'::json,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_tour_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text NOT NULL,
	"number_of_adults" integer DEFAULT 1 NOT NULL,
	"number_of_kids" integer DEFAULT 0 NOT NULL,
	"trip_dates" text,
	"duration" text,
	"interests" json DEFAULT '[]'::json,
	"trip_types" json DEFAULT '[]'::json,
	"destinations" json DEFAULT '[]'::json,
	"message" text NOT NULL,
	"status" "custom_tour_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "group_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"group_size" integer NOT NULL,
	"travel_dates" varchar(255),
	"budget" varchar(100),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "krabi_celebration_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"whatsapp" varchar(50),
	"celebration_type" varchar(100) NOT NULL,
	"guests" integer NOT NULL,
	"date" varchar(100) NOT NULL,
	"budget" varchar(100),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"alt_text" text,
	"caption" text,
	"folder" text DEFAULT 'general',
	"is_used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "navigation_menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"parent_id" integer,
	"is_active" boolean DEFAULT true,
	"icon_name" text,
	"description" text,
	"target" text DEFAULT '_self',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"subscribed_at" timestamp DEFAULT now(),
	"confirmed" boolean DEFAULT false,
	"unsubscribed" boolean DEFAULT false,
	"confirmation_token" text,
	"language" text DEFAULT 'en',
	CONSTRAINT "newsletter_subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "page_block_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"title" text,
	"subtitle" text,
	"description" text,
	"content" text,
	"image_url" text,
	"image_alt" text,
	"cta_text" text,
	"cta_url" text,
	"cta_style" text,
	"icon_name" text,
	"background_color" text,
	"configuration" json DEFAULT '{}'::json,
	"is_active" boolean,
	"change_description" text,
	"created_by" text DEFAULT 'admin',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"block_type" "block_type" NOT NULL,
	"block_order" integer DEFAULT 0 NOT NULL,
	"identifier" text NOT NULL,
	"title" text,
	"subtitle" text,
	"description" text,
	"content" text,
	"image_url" text,
	"image_alt" text,
	"cta_text" text,
	"cta_url" text,
	"cta_style" text DEFAULT 'primary',
	"icon_name" text,
	"background_color" text DEFAULT 'white',
	"configuration" json DEFAULT '{}'::json,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_slug" text NOT NULL,
	"page_name" text NOT NULL,
	"page_type" "page_type" NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_external_url" boolean DEFAULT false,
	"is_custom_code" boolean DEFAULT false,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "page_configurations_page_slug_unique" UNIQUE("page_slug")
);
--> statement-breakpoint
CREATE TABLE "partnership_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"website" varchar(255),
	"partnership_type" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer NOT NULL,
	"availability_id" integer NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"number_of_people" integer NOT NULL,
	"number_of_children" integer DEFAULT 0,
	"total_amount" integer NOT NULL,
	"status" "reservation_status" DEFAULT 'pending' NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_customer_id" text,
	"special_requests" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"section" text NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "static_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"content" text NOT NULL,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "static_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tour_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer NOT NULL,
	"available_date" date NOT NULL,
	"max_capacity" integer DEFAULT 10 NOT NULL,
	"current_bookings" integer DEFAULT 0 NOT NULL,
	"price" integer,
	"child_price" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tour_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'THB' NOT NULL,
	"custom_link" text NOT NULL,
	"images" text[] NOT NULL,
	"type" text DEFAULT 'experience' NOT NULL,
	"tags" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tour_ninja_image_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_ninja_id" text NOT NULL,
	"tour_name" text NOT NULL,
	"image_source_type" "image_source_type" DEFAULT 'upload' NOT NULL,
	"custom_image_url" text,
	"direct_image_url" text,
	"original_image_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tour_ninja_image_overrides_tour_ninja_id_unique" UNIQUE("tour_ninja_id")
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text NOT NULL,
	"duration" text NOT NULL,
	"price" integer NOT NULL,
	"child_price" integer,
	"image_url" text NOT NULL,
	"tour_ninja_url" text NOT NULL,
	"featured" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_blog_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."blog_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_form_submissions" ADD CONSTRAINT "custom_form_submissions_form_id_custom_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."custom_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_menu_items" ADD CONSTRAINT "navigation_menu_items_parent_id_navigation_menu_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_block_history" ADD CONSTRAINT "page_block_history_block_id_page_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."page_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_page_id_page_configurations_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page_configurations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_availability_id_tour_availability_id_fk" FOREIGN KEY ("availability_id") REFERENCES "public"."tour_availability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_availability" ADD CONSTRAINT "tour_availability_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "navigation_items_order_idx" ON "navigation_menu_items" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "navigation_items_parent_idx" ON "navigation_menu_items" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "page_block_history_block_version_idx" ON "page_block_history" USING btree ("block_id","version");--> statement-breakpoint
CREATE INDEX "page_block_history_block_created_idx" ON "page_block_history" USING btree ("block_id","created_at");--> statement-breakpoint
CREATE INDEX "page_blocks_page_order_idx" ON "page_blocks" USING btree ("page_id","block_order");--> statement-breakpoint
CREATE INDEX "site_settings_section_key_idx" ON "site_settings" USING btree ("section","key");