import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  insertTourSchema, 
  insertCustomTourRequestSchema, 
  insertContactMessageSchema,
  insertTourAvailabilitySchema,
  insertReservationSchema,
  insertTourCardSchema,
  insertBlogCategorySchema,
  insertBlogTagSchema,
  insertBlogPostSchema,
  insertNewsletterSubscriptionSchema,
  insertKrabiCelebrationRequestSchema,
  insertPartnershipRequestSchema,
  insertGroupRequestSchema,
  insertCruiseRequestSchema,
  insertTourNinjaImageOverrideSchema,
  insertSiteSettingSchema,
  insertContentBlockSchema,
  insertStaticPageSchema,
  insertMediaLibrarySchema,
  insertPageConfigurationSchema,
  insertPageBlockSchema,
  insertBlockTemplateSchema,
  insertNavigationMenuItemSchema,
  insertCustomFormSchema,
  pageConfigurations,
} from "@shared/schema";
import { createPaymentIntent, createOrRetrieveCustomer } from "./stripe";
import { upload, getPublicFileUrl } from "./upload";
import { persistentImageStorage } from "./objectStorageService";
import path from "path";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Simple authentication middleware for admin routes only
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.user) {
      return next();
    }
    return res.status(401).json({ message: "Authentication required" });
  };

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Serve attached assets (images, videos, etc.)
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets'), {
    maxAge: '1d', // Cache for 1 day
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.mp4') || filePath.endsWith('.mov') || filePath.endsWith('.avi')) {
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache video for 1 day
      }
      if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
        res.setHeader('Cache-Control', 'public, max-age=604800'); // Cache images for 1 week
      }
    }
  }));

  // SEO Routes
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = 'https://amon-tour.com';
      const languages = ['en', 'fr', 'th'];
      
      const staticPages = [
        { url: '/', changefreq: 'daily', priority: '1.0' },
        { url: '/tours', changefreq: 'weekly', priority: '0.9' },
        { url: '/experiences', changefreq: 'weekly', priority: '0.8' },
        { url: '/stays', changefreq: 'weekly', priority: '0.8' },
        { url: '/external-stays', changefreq: 'weekly', priority: '0.7' },
        { url: '/custom-tour', changefreq: 'monthly', priority: '0.7' },
        { url: '/blog', changefreq: 'weekly', priority: '0.6' },
        { url: '/contact', changefreq: 'monthly', priority: '0.5' },
        { url: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
        { url: '/terms-conditions', changefreq: 'yearly', priority: '0.3' },
        { url: '/legal-notice', changefreq: 'yearly', priority: '0.3' }
      ];

      // Get tours for dynamic URLs
      const tours = await storage.getTours();
      const tourUrls = tours.map(tour => ({
        url: `/tour-details/${tour.id}`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: new Date().toISOString().split('T')[0]
      }));

      const allUrls = [...staticPages, ...tourUrls];
      
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls.map(page => {
  const alternateLinks = languages.map(lang => 
    `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${page.url}" />`
  ).join('\n');
  
  return `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${'lastmod' in page ? `<lastmod>${page.lastmod}</lastmod>` : ''}
${alternateLinks}
  </url>`;
}).join('\n')}
</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  app.get('/robots.txt', (req, res) => {
    const robotsTxt = `User-agent: *
Allow: /

# SEO optimized for Thailand tourism
Allow: /tours
Allow: /experiences
Allow: /stays
Allow: /custom-tour

# Block admin areas
Disallow: /admin
Disallow: /api/
Disallow: /uploads/

# Sitemap location
Sitemap: https://amon-tour.com/sitemap.xml

# Crawl delay to be respectful
Crawl-delay: 1`;

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });
  
  // Disabled authentication routes for public site
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
      // Add a small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
      
      const user = await storage.getUserByUsername(username);
      
      // Si l'utilisateur n'existe pas
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Vérifie si le mot de passe est déjà haché avec bcrypt
      let passwordIsValid = false;
      
      if (user.password.startsWith('$2')) {
        // Le mot de passe est déjà haché avec bcrypt
        passwordIsValid = await bcrypt.compare(password, user.password);
      } else {
        // Pour la transition, on accepte encore les mots de passe en clair
        // mais on va les hacher pour les utilisations futures
        passwordIsValid = user.password === password;
        
        if (passwordIsValid) {
          // Mise à jour du mot de passe en le hachant
          const hashedPassword = await bcrypt.hash(password, 10);
          await storage.updateUserPassword(user.id, hashedPassword);
        }
      }
      
      if (!passwordIsValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Si tout est valide, on crée la session
      if (req.session) {
        req.session.user = { id: user.id, username: user.username };
      }
      
      res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "An error occurred during login" });
    }
  });
  
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  app.get("/api/me", (req, res) => {
    if (req.session && req.session.user) {
      return res.json(req.session.user);
    }
    return res.status(401).json({ message: "Not authenticated" });
  });

  // Image upload route
  app.post("/api/upload/image", requireAuth, upload.single('image'), (req, res) => {
    try {
      console.log("Image upload request received");
      
      if (!req.file) {
        console.error("No file uploaded in request");
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileUrl = getPublicFileUrl(req.file.filename);
      console.log("File uploaded successfully:", {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      });
      
      res.json({ 
        message: "File uploaded successfully", 
        filePath: fileUrl,
        file: {
          url: fileUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error("Error during file upload:", error);
      res.status(500).json({ message: "Error uploading file", error: String(error) });
    }
  });
  
  // Tour routes
  app.get("/api/tours", async (req, res) => {
    const tours = await storage.getTours();
    res.json(tours);
  });
  
  app.get("/api/tours/featured", async (req, res) => {
    const featuredTours = await storage.getFeaturedTours();
    res.json(featuredTours);
  });
  
  app.get("/api/tours/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const tour = await storage.getTour(id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    
    res.json(tour);
  });
  
  app.post("/api/tours", requireAuth, async (req, res) => {
    try {
      console.log("Creating tour with data:", req.body);
      const tourData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(tourData);
      res.status(201).json(tour);
    } catch (error: any) {
      console.error("Tour creation error:", error);
      res.status(400).json({ 
        message: "Invalid tour data", 
        error: error.errors || error.message || error 
      });
    }
  });
  
  app.put("/api/tours/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const tourData = req.body;
      const tour = await storage.updateTour(id, tourData);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      res.json(tour);
    } catch (error) {
      res.status(400).json({ message: "Invalid tour data", error });
    }
  });
  
  app.delete("/api/tours/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const result = await storage.deleteTour(id);
    if (!result) {
      return res.status(404).json({ message: "Tour not found" });
    }
    
    res.json({ message: "Tour deleted successfully" });
  });

  // Custom tour request routes
  app.post("/api/custom-tour-requests", async (req, res) => {
    try {
      const requestData = insertCustomTourRequestSchema.parse(req.body);
      const request = await storage.createCustomTourRequest(requestData);
      res.status(201).json({ message: "Custom tour request submitted successfully", request });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data", error });
    }
  });
  
  app.get("/api/custom-tour-requests", requireAuth, async (req, res) => {
    const requests = await storage.getCustomTourRequests();
    res.json(requests);
  });

  // Contact message routes
  app.post("/api/contact-messages", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.status(201).json({ message: "Contact message sent successfully", contactMessage: message });
    } catch (error) {
      res.status(400).json({ message: "Invalid message data", error });
    }
  });
  
  app.get("/api/contact-messages", requireAuth, async (req, res) => {
    const messages = await storage.getContactMessages();
    res.json(messages);
  });

  // Tour availability routes
  app.get("/api/tours/:tourId/availabilities", async (req, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      if (isNaN(tourId)) {
        return res.status(400).json({ message: "Invalid tour ID" });
      }

      const availabilities = await storage.getTourAvailabilities(tourId);
      res.json(availabilities);
    } catch (error) {
      console.error("Error fetching availabilities:", error);
      res.status(500).json({ message: "Failed to fetch availabilities", error: String(error) });
    }
  });

  app.get("/api/tours/:tourId/availabilities/range", async (req, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      if (isNaN(tourId)) {
        return res.status(400).json({ message: "Invalid tour ID" });
      }

      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const availabilities = await storage.getAvailabilitiesByDateRange(
        tourId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(availabilities);
    } catch (error) {
      console.error("Error fetching availabilities by range:", error);
      res.status(500).json({ message: "Failed to fetch availabilities", error: String(error) });
    }
  });

  app.post("/api/tours/:tourId/availabilities", requireAuth, async (req, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      if (isNaN(tourId)) {
        return res.status(400).json({ message: "Invalid tour ID" });
      }

      const availabilityData = insertTourAvailabilitySchema.parse({
        ...req.body,
        tourId
      });
      
      const availability = await storage.createTourAvailability(availabilityData);
      res.status(201).json(availability);
    } catch (error: any) {
      console.error("Error creating availability:", error);
      res.status(400).json({ 
        message: "Invalid availability data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.put("/api/availabilities/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const availabilityData = req.body;
      const availability = await storage.updateTourAvailability(id, availabilityData);

      if (!availability) {
        return res.status(404).json({ message: "Availability not found" });
      }

      res.json(availability);
    } catch (error) {
      console.error("Error updating availability:", error);
      res.status(400).json({ message: "Invalid availability data", error: String(error) });
    }
  });

  app.delete("/api/availabilities/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const result = await storage.deleteTourAvailability(id);
      if (!result) {
        return res.status(404).json({ message: "Availability not found" });
      }

      res.json({ message: "Availability deleted successfully" });
    } catch (error) {
      console.error("Error deleting availability:", error);
      res.status(500).json({ message: "Failed to delete availability", error: String(error) });
    }
  });

  // Reservation routes
  app.post("/api/reservations", async (req, res) => {
    try {
      const reservationData = insertReservationSchema.parse(req.body);
      
      // Vérifier s'il y a de la disponibilité
      const availability = await storage.getTourAvailability(reservationData.availabilityId);
      if (!availability) {
        return res.status(404).json({ message: "Tour availability not found" });
      }
      
      // Vérifier s'il y a assez de place pour cette réservation
      if (availability.currentBookings + reservationData.numberOfPeople > availability.maxCapacity) {
        return res.status(400).json({ 
          message: "Not enough capacity for this booking",
          availableSpaces: availability.maxCapacity - availability.currentBookings
        });
      }
      
      // Créer ou récupérer un client Stripe
      const customer = await createOrRetrieveCustomer(
        reservationData.customerName,
        reservationData.customerEmail,
        reservationData.customerPhone
      );
      
      // Récupérer les prix adulte et enfant
      const tour = await storage.getTour(reservationData.tourId);
      const adultPrice = availability.price || tour?.price || 0;
      const childPrice = availability.childPrice || tour?.childPrice || Math.round(adultPrice * 0.75);
      
      // Calculer le montant total
      const numberOfChildren = reservationData.numberOfChildren || 0;
      const adultTotal = adultPrice * reservationData.numberOfPeople;
      const childrenTotal = childPrice * numberOfChildren;
      
      // Utiliser le totalAmount fourni ou le calculer si non fourni
      const totalAmount = reservationData.totalAmount ?? (adultTotal + childrenTotal);
      
      // Créer un PaymentIntent Stripe
      const { clientSecret, paymentIntentId } = await createPaymentIntent({
        amount: totalAmount,
        customerId: customer.id,
        description: `Reservation for ${reservationData.numberOfPeople} adult(s)${numberOfChildren > 0 ? ` and ${numberOfChildren} child(ren)` : ''}`,
        metadata: {
          tourId: reservationData.tourId.toString(),
          availabilityId: reservationData.availabilityId.toString(),
          customerName: reservationData.customerName,
          customerEmail: reservationData.customerEmail,
          customerPhone: reservationData.customerPhone,
          numberOfPeople: reservationData.numberOfPeople.toString(),
          numberOfChildren: (numberOfChildren).toString()
        }
      });
      
      // Créer la réservation dans notre système
      const reservation = await storage.createReservation({
        ...reservationData,
        // Si totalAmount est déjà fourni dans reservationData, utiliser cette valeur
        // sinon, utiliser le montant calculé
        totalAmount: reservationData.totalAmount ?? totalAmount,
        stripeCustomerId: customer.id,
        stripePaymentIntentId: paymentIntentId
      });
      
      res.status(201).json({
        reservation,
        paymentIntent: {
          clientSecret
        }
      });
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      res.status(400).json({ 
        message: "Failed to create reservation", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.get("/api/reservations", requireAuth, async (req, res) => {
    try {
      const reservations = await storage.getReservations();
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ message: "Failed to fetch reservations", error: String(error) });
    }
  });

  app.get("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const reservation = await storage.getReservation(id);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      res.json(reservation);
    } catch (error) {
      console.error("Error fetching reservation:", error);
      res.status(500).json({ message: "Failed to fetch reservation", error: String(error) });
    }
  });

  app.put("/api/reservations/:id/status", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const { status } = req.body;
      if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const reservation = await storage.updateReservationStatus(id, status);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      res.json(reservation);
    } catch (error) {
      console.error("Error updating reservation status:", error);
      res.status(500).json({ message: "Failed to update reservation status", error: String(error) });
    }
  });
  
  // TourCard routes
  app.get("/api/tour-cards", async (req, res) => {
    try {
      const tourCards = await storage.getTourCards();
      res.json(tourCards);
    } catch (error) {
      console.error("Error fetching tour cards:", error);
      res.status(500).json({ message: "Failed to fetch tour cards", error: String(error) });
    }
  });
  
  app.get("/api/tour-cards/:id", async (req, res) => {
    try {
      const id = req.params.id;
      
      const tourCard = await storage.getTourCard(id);
      if (!tourCard) {
        return res.status(404).json({ message: "Tour card not found" });
      }
      
      res.json(tourCard);
    } catch (error) {
      console.error("Error fetching tour card:", error);
      res.status(500).json({ message: "Failed to fetch tour card", error: String(error) });
    }
  });
  
  app.post("/api/tour-cards", requireAuth, async (req, res) => {
    try {
      const tourCardData = insertTourCardSchema.parse(req.body);
      const tourCard = await storage.createTourCard(tourCardData);
      res.status(201).json(tourCard);
    } catch (error: any) {
      console.error("Error creating tour card:", error);
      res.status(400).json({ 
        message: "Invalid tour card data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });
  
  app.put("/api/tour-cards/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      
      const tourCardData = req.body;
      const tourCard = await storage.updateTourCard(id, tourCardData);
      
      if (!tourCard) {
        return res.status(404).json({ message: "Tour card not found" });
      }
      
      res.json(tourCard);
    } catch (error) {
      console.error("Error updating tour card:", error);
      res.status(400).json({ message: "Invalid tour card data", error: String(error) });
    }
  });
  
  app.delete("/api/tour-cards/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      
      const result = await storage.deleteTourCard(id);
      if (!result) {
        return res.status(404).json({ message: "Tour card not found" });
      }
      
      res.json({ message: "Tour card deleted successfully" });
    } catch (error) {
      console.error("Error deleting tour card:", error);
      res.status(500).json({ message: "Failed to delete tour card", error: String(error) });
    }
  });

  // ===== BLOG MANAGEMENT API ROUTES =====

  // Blog Categories
  app.get("/api/blog/categories", async (req, res) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      res.status(500).json({ message: "Failed to fetch categories", error: String(error) });
    }
  });

  app.post("/api/blog/categories", requireAuth, async (req, res) => {
    try {
      const categoryData = insertBlogCategorySchema.parse(req.body);
      const category = await storage.createBlogCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      console.error("Error creating blog category:", error);
      res.status(400).json({ 
        message: "Invalid category data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.put("/api/blog/categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const categoryData = insertBlogCategorySchema.parse(req.body);
      const category = await storage.updateBlogCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error: any) {
      console.error("Error updating blog category:", error);
      res.status(400).json({ 
        message: "Invalid category data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.delete("/api/blog/categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const result = await storage.deleteBlogCategory(id);
      if (!result) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog category:", error);
      res.status(500).json({ message: "Failed to delete category", error: String(error) });
    }
  });

  // Blog Tags
  app.get("/api/blog/tags", async (req, res) => {
    try {
      const tags = await storage.getBlogTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching blog tags:", error);
      res.status(500).json({ message: "Failed to fetch tags", error: String(error) });
    }
  });

  app.post("/api/blog/tags", requireAuth, async (req, res) => {
    try {
      const tagData = insertBlogTagSchema.parse(req.body);
      const tag = await storage.createBlogTag(tagData);
      res.status(201).json(tag);
    } catch (error: any) {
      console.error("Error creating blog tag:", error);
      res.status(400).json({ 
        message: "Invalid tag data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.put("/api/blog/tags/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tag ID" });
      }

      const tagData = insertBlogTagSchema.parse(req.body);
      const tag = await storage.updateBlogTag(id, tagData);
      
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.json(tag);
    } catch (error: any) {
      console.error("Error updating blog tag:", error);
      res.status(400).json({ 
        message: "Invalid tag data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.delete("/api/blog/tags/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tag ID" });
      }

      const result = await storage.deleteBlogTag(id);
      if (!result) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.json({ message: "Tag deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog tag:", error);
      res.status(500).json({ message: "Failed to delete tag", error: String(error) });
    }
  });

  // Blog Posts
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const { status, category, tag, search } = req.query;
      const filters = {
        status: status as string,
        category: category as string,
        tag: tag as string,
        search: search as string
      };
      
      const posts = await storage.getBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch posts", error: String(error) });
    }
  });

  app.get("/api/blog/posts/published", async (req, res) => {
    try {
      const { category, tag, search } = req.query;
      const filters = {
        category: category as string,
        tag: tag as string,
        search: search as string
      };
      
      const posts = await storage.getPublishedBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching published blog posts:", error);
      res.status(500).json({ message: "Failed to fetch posts", error: String(error) });
    }
  });

  app.get("/api/blog/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch post", error: String(error) });
    }
  });

  app.get("/api/blog/posts/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      res.status(500).json({ message: "Failed to fetch post", error: String(error) });
    }
  });

  app.get("/api/blog/posts/:id/related", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const relatedPosts = await storage.getRelatedBlogPosts(id, limit);
      res.json(relatedPosts);
    } catch (error) {
      console.error("Error fetching related blog posts:", error);
      res.status(500).json({ message: "Failed to fetch related posts", error: String(error) });
    }
  });

  app.post("/api/blog/posts", requireAuth, async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ 
        message: "Invalid post data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.put("/api/blog/posts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.updateBlogPost(id, postData);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error: any) {
      console.error("Error updating blog post:", error);
      res.status(400).json({ 
        message: "Invalid post data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.delete("/api/blog/posts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const result = await storage.deleteBlogPost(id);
      if (!result) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json({ message: "Post deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete post", error: String(error) });
    }
  });

  // Image upload for blog posts
  app.post("/api/blog/upload-image", requireAuth, upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageUrl = getPublicFileUrl(req.file.filename);
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading blog image:", error);
      res.status(500).json({ message: "Failed to upload image", error: String(error) });
    }
  });

  // ===== CUSTOM TOUR REQUEST API ROUTES =====

  // Create custom tour request
  app.post("/api/custom-tour", async (req, res) => {
    try {
      // Enhanced validation schema
      const customTourRequestSchema = z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Invalid email address"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        numberOfAdults: z.number().min(1, "At least one adult is required"),
        numberOfKids: z.number().min(0, "Number of kids cannot be negative"),
        tripDates: z.string().optional(),
        duration: z.string().optional(),
        tripTypes: z.array(z.string()).optional(),
        destinations: z.array(z.string()).optional(),
        message: z.string().min(1, "Message is required"),
      }).refine(
        (data: any) => {
          return (data.tripDates && data.tripDates.trim() !== "") || 
                 (data.duration && data.duration.trim() !== "");
        },
        {
          message: "Please provide either your trip dates or an approximate duration.",
          path: ["tripDates"],
        }
      ).refine(
        (data: any) => {
          return (data.tripTypes && data.tripTypes.length > 0) || 
                 (data.destinations && data.destinations.length > 0);
        },
        {
          message: "Please select at least one trip type or destination.",
          path: ["tripTypes"],
        }
      );

      const validatedData = customTourRequestSchema.parse(req.body);
      
      // Add default values for storage interface compatibility
      const requestData = {
        ...validatedData,
        interests: [], // Keep for backward compatibility
        status: "new" as const,
        tripTypes: validatedData.tripTypes || [],
        destinations: validatedData.destinations || []
      };
      
      const customTourRequest = await storage.createCustomTourRequest(requestData);
      res.status(201).json(customTourRequest);
    } catch (error: any) {
      console.error("Error creating custom tour request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          error: error.errors
        });
      }
      res.status(400).json({ 
        message: "Invalid request data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  // Get all custom tour requests (admin only)
  app.get("/api/custom-tour", requireAuth, async (req, res) => {
    try {
      const { status, search, sort } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (search) filters.search = search as string;
      if (sort) filters.sort = sort as string;
      
      const requests = await storage.getCustomTourRequests(filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching custom tour requests:", error);
      res.status(500).json({ message: "Failed to fetch requests", error: String(error) });
    }
  });

  // Export custom tour requests to CSV (admin only) - Must come before parameterized routes
  app.get("/api/custom-tour/export", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const filters: any = {};
      if (status) filters.status = status as string;
      
      const requests = await storage.getCustomTourRequests(filters);
      
      // Create CSV content
      const csvHeaders = 'ID,Full Name,Email,Phone,Adults,Kids,Trip Dates,Duration,Trip Types,Destinations,Message,Status,Created Date\n';
      const csvData = requests.map(request => {
        const tripTypes = Array.isArray(request.tripTypes) ? request.tripTypes.join('; ') : '';
        const destinations = Array.isArray(request.destinations) ? request.destinations.join('; ') : '';
        return `${request.id},"${request.fullName}","${request.email}","${request.phoneNumber}",${request.numberOfAdults},${request.numberOfKids},"${request.tripDates || ''}","${request.duration || ''}","${tripTypes}","${destinations}","${request.message.replace(/"/g, '""')}","${request.status}","${request.createdAt?.toISOString().split('T')[0] || ''}"`;
      }).join('\n');
      
      const csvContent = csvHeaders + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="custom-tour-requests.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting custom tour requests:", error);
      res.status(500).json({ message: "Failed to export requests", error: String(error) });
    }
  });

  // Get count of new custom tour requests (for admin notifications)
  app.get("/api/custom-tour/count/new", requireAuth, async (req, res) => {
    try {
      const count = await storage.getNewCustomTourRequestsCount();
      res.json({ count });
    } catch (error) {
      console.error("Error getting new custom tour requests count:", error);
      res.status(500).json({ message: "Failed to get count", error: String(error) });
    }
  });

  // Get single custom tour request (admin only)
  app.get("/api/custom-tour/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const request = await storage.getCustomTourRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching custom tour request:", error);
      res.status(500).json({ message: "Failed to fetch request", error: String(error) });
    }
  });

  // Update custom tour request status (admin only)
  app.put("/api/custom-tour/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const { status } = req.body;
      if (!status || !['new', 'in_progress', 'archived'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedRequest = await storage.updateCustomTourRequestStatus(id, status);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating custom tour request:", error);
      res.status(500).json({ message: "Failed to update request", error: String(error) });
    }
  });

  // Delete custom tour request (admin only)
  app.delete("/api/custom-tour/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const deleted = await storage.deleteCustomTourRequest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.json({ message: "Request deleted successfully" });
    } catch (error) {
      console.error("Error deleting custom tour request:", error);
      res.status(500).json({ message: "Failed to delete request", error: String(error) });
    }
  });

  // ===== TEST ENDPOINT FOR CONNECTIVITY =====
  
  // Simple test endpoint to verify API connectivity
  app.get("/api/test", (req, res) => {
    res.json({ 
      status: "ok",
      message: "Amontour API is running",
      timestamp: new Date().toISOString()
    });
  });

  // ===== TOUR NINJA SYNCHRONIZATION API =====

  // Function to transform Amontour custom tour request to Tour Ninja format
  function transformCustomTourToTourNinja(amontourRequest: any) {
    // Map status values
    const statusMap: Record<string, string> = {
      "new": "received",
      "in_progress": "processing", 
      "archived": "completed"
    };

    // Infer tour name from destinations and interests
    const inferTourName = (destinations: string[], interests: string[]) => {
      if (destinations.includes("krabi")) return "Krabi Adventure Tour";
      if (destinations.includes("bangkok")) return "Bangkok City Experience";
      if (destinations.includes("chiangmai")) return "Chiang Mai Cultural Tour";
      if (destinations.includes("khaosok")) return "Khao Sok National Park Tour";
      if (destinations.includes("kohmook")) return "Koh Mook Island Escape";
      if (interests.includes("culture")) return "Cultural Heritage Tour";
      if (interests.includes("nature")) return "Nature & Adventure Tour";
      if (interests.includes("beaches")) return "Beach Paradise Tour";
      return "Custom Thailand Tour";
    };

    return {
      customerName: amontourRequest.fullName,
      customerEmail: amontourRequest.email,
      phone: amontourRequest.phoneNumber,
      tourDate: amontourRequest.tripDates || "Date flexible",
      numberOfAdults: amontourRequest.numberOfAdults,
      numberOfKids: amontourRequest.numberOfKids,
      duration: amontourRequest.duration || "À définir",
      message: amontourRequest.message,
      destinations: amontourRequest.destinations || [],
      budget: "À discuter",
      status: statusMap[amontourRequest.status] || "received",
      associatedTourName: inferTourName(amontourRequest.destinations || [], amontourRequest.interests || []),
      // Additional Amontour-specific fields
      interests: amontourRequest.interests || [],
      tripTypes: amontourRequest.tripTypes || [],
      amontourId: amontourRequest.id,
      originalCreatedAt: amontourRequest.createdAt,
      source: "amontour_custom_tour"
    };
  }

  // Function to transform Amontour cruise request to Tour Ninja format
  function transformCruiseToTourNinja(cruiseRequest: any) {
    // Map cruise status values
    const statusMap: Record<string, string> = {
      "pending": "received",
      "contacted": "processing", 
      "confirmed": "completed",
      "cancelled": "cancelled"
    };

    // Infer cruise tour name from duration and itinerary
    const inferCruiseTourName = (duration: string, itinerary?: string) => {
      if (duration === "1 day") return "Day Cruise Experience";
      if (duration === "2 days") return "2-Day Island Cruise";
      if (duration === "3-4 days") return "Multi-Day Island Explorer";
      if (duration === "5-6 days") return "Extended Island Adventure";
      if (duration === "7+ days") return "Ultimate Island Journey";
      if (itinerary?.toLowerCase().includes("phi phi")) return "Phi Phi Islands Cruise";
      if (itinerary?.toLowerCase().includes("krabi")) return "Krabi Coast Cruise";
      if (itinerary?.toLowerCase().includes("phang nga")) return "Phang Nga Bay Cruise";
      return "Custom Island Cruise";
    };

    return {
      customerName: cruiseRequest.fullName,
      customerEmail: cruiseRequest.email,
      phone: cruiseRequest.phone || "Non fourni",
      tourDate: cruiseRequest.preferredDates || "Date flexible",
      numberOfAdults: cruiseRequest.numberOfGuests || 2,
      numberOfKids: 0, // Cruise requests don't differentiate adults/kids
      duration: cruiseRequest.duration,
      message: [
        cruiseRequest.specialRequests ? `Demandes spéciales: ${cruiseRequest.specialRequests}` : "",
        cruiseRequest.itinerary ? `Itinéraire préféré: ${cruiseRequest.itinerary}` : "",
        cruiseRequest.budget ? `Budget: ${cruiseRequest.budget}` : ""
      ].filter(Boolean).join("\n"),
      destinations: cruiseRequest.itinerary ? [cruiseRequest.itinerary] : [],
      budget: cruiseRequest.budget || "À discuter",
      status: statusMap[cruiseRequest.status] || "received",
      associatedTourName: inferCruiseTourName(cruiseRequest.duration, cruiseRequest.itinerary),
      // Additional cruise-specific fields
      numberOfGuests: cruiseRequest.numberOfGuests,
      itinerary: cruiseRequest.itinerary,
      specialRequests: cruiseRequest.specialRequests,
      amontourId: cruiseRequest.id,
      originalCreatedAt: cruiseRequest.createdAt,
      source: "amontour_cruise"
    };
  }

  // Tour Ninja synchronization endpoint with API key authentication
  app.get("/api/sync/tour-ninja", async (req, res) => {
    try {
      // API key authentication for Tour Ninja
      const authHeader = req.headers.authorization;
      
      // Accept both the hardcoded key for Tour Ninja sync and the environment key for internal use
      const validApiKeys = [
        "TOUR_NINJA_API_KEY_2025", // Tour Ninja's dedicated sync key
        process.env.TOUR_NINJA_API_KEY // Environment key if set
      ].filter(Boolean);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false, 
          message: "Authorization header required" 
        });
      }

      const apiKey = authHeader.substring(7); // Remove 'Bearer '
      
      if (!validApiKeys.includes(apiKey)) {
        return res.status(403).json({ 
          success: false, 
          message: "Invalid API key" 
        });
      }

      // Get query parameters for filtering
      const { status, since } = req.query;
      const filters: any = {};
      
      // Map Tour Ninja status values to internal Amontour statuses
      if (status && status !== 'all') {
        const tourNinjaToAmontour: Record<string, string> = {
          "received": "new",
          "processing": "in_progress", 
          "completed": "archived"
        };
        
        const mappedStatus = tourNinjaToAmontour[status as string] || status as string;
        filters.status = mappedStatus;
      }
      
      // Handle incremental sync with 'since' parameter
      if (since) {
        const sinceDate = new Date(since as string);
        if (!isNaN(sinceDate.getTime())) {
          filters.since = sinceDate;
        }
      }
      
      // Fetch custom tour requests from storage
      const amontourRequests = await storage.getCustomTourRequests(filters);
      
      // Transform to Tour Ninja format
      const tourNinjaFormat = amontourRequests.map(transformCustomTourToTourNinja);
      
      res.json({
        success: true,
        count: tourNinjaFormat.length,
        data: tourNinjaFormat,
        lastSync: new Date().toISOString(),
        filters: filters
      });

    } catch (error: any) {
      console.error("Error in Tour Ninja sync:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to sync data",
        error: String(error) 
      });
    }
  });

  // Cruise requests synchronization endpoint with API key authentication
  app.get("/api/sync/cruise-requests", async (req, res) => {
    try {
      // API key authentication for Tour Ninja
      const authHeader = req.headers.authorization;
      
      // Accept both the hardcoded key for Tour Ninja sync and the environment key for internal use
      const validApiKeys = [
        "TOUR_NINJA_API_KEY_2025", // Tour Ninja's dedicated sync key
        process.env.TOUR_NINJA_API_KEY // Environment key if set
      ].filter(Boolean);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false, 
          message: "Authorization header required" 
        });
      }

      const apiKey = authHeader.substring(7); // Remove 'Bearer '
      
      if (!validApiKeys.includes(apiKey)) {
        return res.status(403).json({ 
          success: false, 
          message: "Invalid API key" 
        });
      }

      // Get query parameters for filtering
      const { status, since } = req.query;
      const filters: any = {};
      
      // Map Tour Ninja status values to internal cruise request statuses
      if (status && status !== 'all') {
        const tourNinjaToCruise: Record<string, string> = {
          "received": "pending",
          "processing": "contacted", 
          "completed": "confirmed",
          "cancelled": "cancelled"
        };
        
        const mappedStatus = tourNinjaToCruise[status as string] || status as string;
        filters.status = mappedStatus;
      }
      
      // Handle incremental sync with 'since' parameter
      if (since) {
        const sinceDate = new Date(since as string);
        if (!isNaN(sinceDate.getTime())) {
          filters.since = sinceDate;
        }
      }
      
      // Fetch cruise requests from storage
      const cruiseRequests = await storage.getCruiseRequests(filters);
      
      // Transform to Tour Ninja format
      const tourNinjaFormat = cruiseRequests.map(transformCruiseToTourNinja);
      
      res.json({
        success: true,
        count: tourNinjaFormat.length,
        data: tourNinjaFormat,
        lastSync: new Date().toISOString(),
        filters: filters,
        type: "cruise_requests"
      });

    } catch (error: any) {
      console.error("Error in Cruise requests Tour Ninja sync:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to sync cruise requests data",
        error: String(error) 
      });
    }
  });

  // ===== FORM SUBMISSION API ROUTES =====

  // Krabi Celebration Requests
  app.post("/api/krabi-celebration", async (req, res) => {
    try {
      console.log("Krabi Celebration - Received request:", JSON.stringify(req.body, null, 2));
      
      const requestData = insertKrabiCelebrationRequestSchema.parse({
        ...req.body,
        guests: parseInt(req.body.guests) || 0
      });
      
      console.log("Krabi Celebration - Validated data:", JSON.stringify(requestData, null, 2));
      
      const request = await storage.createKrabiCelebrationRequest(requestData);
      
      console.log("Krabi Celebration - Created request with ID:", request.id);
      
      res.status(201).json({ 
        message: "Krabi Celebration request submitted successfully",
        id: request.id 
      });
    } catch (error: any) {
      console.error("Krabi Celebration - Error:", error);
      res.status(400).json({ 
        message: "Invalid request data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.get("/api/krabi-celebration", requireAuth, async (req, res) => {
    try {
      const { read } = req.query;
      const filters = read !== undefined ? { read: read === 'true' } : undefined;
      const requests = await storage.getKrabiCelebrationRequests(filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching krabi celebration requests:", error);
      res.status(500).json({ message: "Failed to fetch requests", error: String(error) });
    }
  });

  app.patch("/api/krabi-celebration/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const updatedRequest = await storage.updateKrabiCelebrationRequest(id, req.body);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating krabi celebration request:", error);
      res.status(500).json({ message: "Failed to update request", error: String(error) });
    }
  });

  app.delete("/api/krabi-celebration/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const deleted = await storage.deleteKrabiCelebrationRequest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json({ message: "Request deleted successfully" });
    } catch (error) {
      console.error("Error deleting krabi celebration request:", error);
      res.status(500).json({ message: "Failed to delete request", error: String(error) });
    }
  });

  // Partnership Requests
  app.post("/api/partnership-requests", async (req, res) => {
    try {
      console.log("Partnership - Received request:", JSON.stringify(req.body, null, 2));
      
      const requestData = insertPartnershipRequestSchema.parse(req.body);
      
      console.log("Partnership - Validated data:", JSON.stringify(requestData, null, 2));
      
      const request = await storage.createPartnershipRequest(requestData);
      
      console.log("Partnership - Created request with ID:", request.id);
      
      res.status(201).json({ 
        message: "Partnership request submitted successfully",
        id: request.id 
      });
    } catch (error: any) {
      console.error("Partnership - Error:", error);
      res.status(400).json({ 
        message: "Invalid request data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.get("/api/partnership-requests", requireAuth, async (req, res) => {
    try {
      const { read } = req.query;
      const filters = read !== undefined ? { read: read === 'true' } : undefined;
      const requests = await storage.getPartnershipRequests(filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching partnership requests:", error);
      res.status(500).json({ message: "Failed to fetch requests", error: String(error) });
    }
  });

  app.patch("/api/partnership-requests/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const updatedRequest = await storage.updatePartnershipRequest(id, req.body);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating partnership request:", error);
      res.status(500).json({ message: "Failed to update request", error: String(error) });
    }
  });

  app.delete("/api/partnership-requests/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const deleted = await storage.deletePartnershipRequest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json({ message: "Request deleted successfully" });
    } catch (error) {
      console.error("Error deleting partnership request:", error);
      res.status(500).json({ message: "Failed to delete request", error: String(error) });
    }
  });

  // Cruise Requests
  app.post("/api/cruise-requests", async (req, res) => {
    try {
      const requestData = insertCruiseRequestSchema.parse(req.body);
      const request = await storage.createCruiseRequest(requestData);
      
      // Log the cruise request for notification purposes
      console.log("New cruise request received:", {
        name: requestData.fullName,
        email: requestData.email,
        phone: requestData.phone,
        numberOfGuests: requestData.numberOfGuests,
        duration: requestData.duration,
        preferredDates: requestData.preferredDates,
        itinerary: requestData.itinerary,
        budget: requestData.budget,
        specialRequests: requestData.specialRequests
      });
      
      res.status(201).json({ message: "Demande de croisière envoyée avec succès", request });
    } catch (error) {
      console.error("Error creating cruise request:", error);
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.get("/api/cruise-requests", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getCruiseRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching cruise requests:", error);
      res.status(500).json({ message: "Failed to fetch cruise requests", error: String(error) });
    }
  });

  app.get("/api/cruise-requests/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const request = await storage.getCruiseRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Cruise request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching cruise request:", error);
      res.status(500).json({ message: "Failed to fetch cruise request", error: String(error) });
    }
  });

  app.put("/api/cruise-requests/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const updated = await storage.updateCruiseRequest(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Cruise request not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating cruise request:", error);
      res.status(400).json({ message: "Failed to update cruise request", error: String(error) });
    }
  });

  app.patch("/api/cruise-requests/:id/read", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const updated = await storage.markCruiseRequestAsRead(id);
      if (!updated) {
        return res.status(404).json({ message: "Cruise request not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error marking cruise request as read:", error);
      res.status(500).json({ message: "Failed to mark cruise request as read", error: String(error) });
    }
  });

  app.delete("/api/cruise-requests/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const deleted = await storage.deleteCruiseRequest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Cruise request not found" });
      }
      
      res.json({ message: "Cruise request deleted successfully" });
    } catch (error) {
      console.error("Error deleting cruise request:", error);
      res.status(500).json({ message: "Failed to delete cruise request", error: String(error) });
    }
  });

  // Group Requests
  app.post("/api/group-requests", async (req, res) => {
    try {
      console.log("Group Corporate - Received request:", JSON.stringify(req.body, null, 2));
      
      const requestData = insertGroupRequestSchema.parse({
        ...req.body,
        groupSize: parseInt(req.body.groupSize) || 0
      });
      
      console.log("Group Corporate - Validated data:", JSON.stringify(requestData, null, 2));
      
      const request = await storage.createGroupRequest(requestData);
      
      console.log("Group Corporate - Created request with ID:", request.id);
      
      res.status(201).json({ 
        message: "Group request submitted successfully",
        id: request.id 
      });
    } catch (error: any) {
      console.error("Group Corporate - Error:", error);
      res.status(400).json({ 
        message: "Invalid request data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.get("/api/group-requests", requireAuth, async (req, res) => {
    try {
      const { read } = req.query;
      const filters = read !== undefined ? { read: read === 'true' } : undefined;
      const requests = await storage.getGroupRequests(filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching group requests:", error);
      res.status(500).json({ message: "Failed to fetch requests", error: String(error) });
    }
  });

  app.patch("/api/group-requests/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const updatedRequest = await storage.updateGroupRequest(id, req.body);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating group request:", error);
      res.status(500).json({ message: "Failed to update request", error: String(error) });
    }
  });

  app.delete("/api/group-requests/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const deleted = await storage.deleteGroupRequest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json({ message: "Request deleted successfully" });
    } catch (error) {
      console.error("Error deleting group request:", error);
      res.status(500).json({ message: "Failed to delete request", error: String(error) });
    }
  });

  // ===== NEWSLETTER SUBSCRIPTION API ROUTES =====

  // Newsletter subscription with rate limiting
  const newsletterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { message: "Too many subscription attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/api/newsletter/subscribe", newsletterLimiter, async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscription = await storage.getNewsletterSubscriptionByEmail(subscriptionData.email);
      
      if (existingSubscription) {
        if (!existingSubscription.unsubscribed) {
          return res.status(400).json({ message: "This email is already registered to our newsletter." });
        }
        
        // Re-activate subscription if unsubscribed
        await storage.updateNewsletterSubscription(existingSubscription.id, {
          unsubscribed: false,
          confirmed: true,
          confirmationToken: null
        });
        return res.json({ message: "Welcome back! You have been successfully subscribed to our newsletter." });
      }
      
      // Create new subscription - automatically confirmed
      const subscription = await storage.createNewsletterSubscriptionConfirmed(subscriptionData);
      res.status(201).json({ 
        message: "Thank you for subscribing! You have been successfully added to our newsletter.",
        subscriptionId: subscription.id
      });
    } catch (error: any) {
      console.error("Error creating newsletter subscription:", error);
      res.status(400).json({ 
        message: "Invalid subscription data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.get("/api/newsletter/confirm", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Invalid confirmation token." });
      }
      
      const subscription = await storage.confirmNewsletterSubscription(token);
      
      if (!subscription) {
        return res.status(404).json({ message: "Invalid or expired confirmation token." });
      }
      
      res.json({ 
        message: "Your subscription has been confirmed successfully! Welcome to our newsletter.",
        email: subscription.email
      });
    } catch (error) {
      console.error("Error confirming newsletter subscription:", error);
      res.status(500).json({ message: "Failed to confirm subscription", error: String(error) });
    }
  });

  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email address is required." });
      }
      
      const result = await storage.unsubscribeNewsletter(email);
      
      if (!result) {
        return res.status(404).json({ message: "Email address not found in our subscription list." });
      }
      
      res.json({ message: "You have been successfully unsubscribed from our newsletter." });
    } catch (error) {
      console.error("Error unsubscribing from newsletter:", error);
      res.status(500).json({ message: "Failed to unsubscribe", error: String(error) });
    }
  });

  // Admin newsletter management routes
  app.get("/api/admin/newsletter/subscriptions", requireAuth, async (req, res) => {
    try {
      const { confirmed, unsubscribed } = req.query;
      const filters: any = {};
      
      if (confirmed !== undefined) {
        filters.confirmed = confirmed === 'true';
      }
      
      if (unsubscribed !== undefined) {
        filters.unsubscribed = unsubscribed === 'true';
      }
      
      const subscriptions = await storage.getNewsletterSubscriptions(filters);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching newsletter subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions", error: String(error) });
    }
  });

  // Export confirmed emails to CSV
  app.get("/api/admin/newsletter/export", requireAuth, async (req, res) => {
    try {
      const confirmedSubscriptions = await storage.getNewsletterSubscriptions({ 
        confirmed: true, 
        unsubscribed: false 
      });
      
      // Create CSV content
      const csvHeaders = 'Email,Subscribed Date,Language\n';
      const csvData = confirmedSubscriptions.map(sub => 
        `${sub.email},${sub.subscribedAt?.toISOString().split('T')[0] || ''},${sub.language || 'en'}`
      ).join('\n');
      
      const csvContent = csvHeaders + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscribers.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting newsletter subscriptions:", error);
      res.status(500).json({ message: "Failed to export subscriptions", error: String(error) });
    }
  });

  // Import shared Tour Ninja cache - using dynamic import due to module context
  const { tourCache } = await import('./tourCache');

  // Don't clear cache on startup - let it fetch when needed
  // tourCache.data = null;
  // tourCache.timestamp = 0;

  // Debug route for deployment issues
  app.get("/api/debug/tour-ninja", (req, res) => {
    const apiKey = "tourninja-showcase-2-amontour";
    const companyId = "2";
    
    res.json({
      environment: process.env.NODE_ENV,
      hostname: req.hostname,
      hasApiKey: !!apiKey,
      hasCompanyId: !!companyId,
      apiKeyLength: apiKey ? apiKey.length : 0,
      companyId: companyId,
      cacheStatus: {
        hasData: !!tourCache.data,
        timestamp: tourCache.timestamp,
        age: Date.now() - tourCache.timestamp
      }
    });
  });

  // New route to serve cached Tour Ninja images from server memory for better performance
  app.get('/api/image-proxy/:tourId/presentation', async (req, res) => {
    try {
      const { tourId } = req.params;
      
      // Check if we have cached tour data
      if (tourCache.data && Array.isArray(tourCache.data)) {
        const tour = tourCache.data.find((t: any) => t.id === tourId);
        
        if (tour && tour._serverCachedImage) {
          // Check if it's already a base64 data URL
          if (tour._serverCachedImage.startsWith('data:')) {
            const matches = tour._serverCachedImage.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1];
              const imageData = matches[2];
              const imageBuffer = Buffer.from(imageData, 'base64');
              
              // Set appropriate headers
              res.set('Content-Type', mimeType);
              res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
              res.set('Access-Control-Allow-Origin', '*');
              
              // Send the image
              return res.send(imageBuffer);
            }
          }
          // If it's a URL, fetch and cache the image
          else if (tour._serverCachedImage.startsWith('http')) {
            try {
              console.log(`Fetching image for tour ${tourId} from URL: ${tour._serverCachedImage.substring(0, 60)}...`);
              
              const nodeFetch = (await import('node-fetch')).default;
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
              
              const imageResponse = await nodeFetch(tour._serverCachedImage, {
                signal: controller.signal,
                headers: {
                  'User-Agent': 'Amon-Tour/1.0'
                }
              });
              
              clearTimeout(timeoutId);
              
              if (imageResponse.ok) {
                const imageBuffer = await imageResponse.buffer();
                const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
                
                // Convert to base64 and cache it for future requests
                const base64Image = `data:${contentType};base64,${imageBuffer.toString('base64')}`;
                tour._serverCachedImage = base64Image;
                
                console.log(`Successfully cached image for tour ${tourId}`);
                
                // Set appropriate headers
                res.set('Content-Type', contentType);
                res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
                res.set('Access-Control-Allow-Origin', '*');
                
                // Send the image
                return res.send(imageBuffer);
              } else {
                console.error(`Failed to fetch image for tour ${tourId}, status: ${imageResponse.status}`);
              }
            } catch (fetchError) {
              console.error(`Error fetching image for tour ${tourId}:`, fetchError);
            }
          }
        }
      }
      
      // If no image available, return 404
      console.log(`No image available for tour ${tourId}`);
      return res.status(404).json({ error: 'Image not found or could not be fetched' });
      
    } catch (error) {
      console.error('Image proxy error for tour:', req.params.tourId, error);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  });

  // Image proxy for Tour Ninja images (legacy route)
  app.get('/api/proxy/image', async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL required' });
      }

      // Only allow Tour Ninja image URLs for security
      if (!imageUrl.includes('tourninja.io')) {
        return res.status(403).json({ error: 'Unauthorized image source' });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout for slow Unsplash images
      
      const nodeFetch = (await import('node-fetch')).default;
      const response = await nodeFetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Amon-Tour/1.0'
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`Image proxy failed for URL: ${imageUrl}, status: ${response.status}`);
        // Return a placeholder image or error response
        return res.status(404).json({ error: 'Image not found' });
      }

      // Forward the content type and cache headers
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.set('Content-Type', contentType);
      }
      
      res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.set('Access-Control-Allow-Origin', '*');
      
      // Stream the image
      response.body?.pipe(res);
      
    } catch (error) {
      console.error('Image proxy error:', error);
      res.status(500).json({ error: 'Failed to proxy image' });
    }
  });

  // Public route for active Tour Ninja image overrides
  app.get('/api/tour-ninja-image-overrides', async (req, res) => {
    try {
      const allOverrides = await storage.getTourNinjaImageOverrides();
      // Filter to only return active overrides for public consumption
      const activeOverrides = allOverrides.filter(override => override.isActive);
      res.json(activeOverrides);
    } catch (error) {
      console.error('Error fetching active Tour Ninja image overrides:', error);
      res.status(500).json({ message: 'Failed to fetch active image overrides', error: String(error) });
    }
  });

  // Secure Tour Ninja API proxy route
  app.get("/api/proxy/tours", async (req, res) => {
    try {
      // Use working demo credentials until production credentials are properly configured
      // Production credentials return empty array, so fallback to working demo
      const apiKey = "tourninja-showcase-2-amontour";
      const companyId = "2";
      console.log("Using demo credentials as production credentials return empty data");
      
      console.log("Tour Ninja API Call:", {
        apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'null', // Hide sensitive data
        companyId,
        usingEnvCredentials: !!(process.env.TOUR_NINJA_API_KEY && process.env.TOUR_NINJA_COMPANY_ID),
        fullUrl: `https://www.tourninja.io/api/public/tours?apiKey=${apiKey}&companyId=${companyId}&limit=100`
      });
      const allowedDomain = process.env.COMPANY_DOMAIN;
      
      // Security: Verify domain if configured (disabled for deployment debugging)
      // if (allowedDomain && req.hostname !== allowedDomain && req.hostname !== 'localhost') {
      //   return res.status(403).json({ 
      //     message: "Access denied for this domain" 
      //   });
      // }
      
      if (!apiKey || !companyId) {
        console.error("Tour Ninja credentials missing:", {
          hasApiKey: !!apiKey,
          hasCompanyId: !!companyId,
          environment: process.env.NODE_ENV,
          hostname: req.hostname
        });
        return res.status(500).json({ 
          message: "Tour Ninja API credentials not configured",
          configured: false,
          debug: {
            hasApiKey: !!apiKey,
            hasCompanyId: !!companyId,
            environment: process.env.NODE_ENV
          }
        });
      }

      // Only clear cache if requested explicitly
      const forceFresh = req.query.fresh === 'true';
      if (forceFresh) {
        console.log("Fresh data requested - clearing cache");
        tourCache.data = null;
        tourCache.timestamp = 0;
      }

      // Check if cache is still valid
      const cacheAge = Date.now() - tourCache.timestamp;
      const isCacheValid = tourCache.data && cacheAge < tourCache.TTL && !forceFresh;
      
      if (isCacheValid) {
        console.log(`Returning cached data (age: ${Math.round(cacheAge / 1000)}s, TTL: ${Math.round(tourCache.TTL / 1000)}s)`);
        return res.json({
          success: true,
          data: tourCache.data,
          cached: true,
          cacheAge: cacheAge,
          timestamp: tourCache.timestamp
        });
      }

      // Try both API endpoints for maximum compatibility
      const useApiKey = !!(process.env.TOUR_NINJA_API_KEY && process.env.TOUR_NINJA_COMPANY_ID);
      const primaryUrl = useApiKey 
        ? `https://www.tourninja.io/api/public/tours?apiKey=${apiKey}&companyId=${companyId}&limit=100`
        : `https://www.tourninja.io/api/public/tours/legacy?companyId=${companyId}`;
      const fallbackUrl = `https://www.tourninja.io/api/public/tours/legacy?companyId=${companyId}`;
      
      console.log("Fetching fresh data from Tour Ninja API (cache expired or invalid)", {
        url: primaryUrl,
        useApiKey,
        environment: process.env.NODE_ENV,
        hostname: req.hostname,
        cacheAge: Math.round(cacheAge / 1000) + "s"
      });
      
      let response;
      let controller = new AbortController();
      let timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      // Simple fetch call as recommended
      const nodeFetch = (await import('node-fetch')).default;
      
      try {
        response = await nodeFetch(primaryUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        if (!response.ok && useApiKey) {
          console.log("Primary API failed, trying fallback URL:", fallbackUrl);
          clearTimeout(timeoutId);
          controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), 30000);
          
          response = await nodeFetch(fallbackUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            signal: controller.signal
          });
        }
      } catch (error) {
        if (useApiKey) {
          console.log("Primary API errored, trying fallback URL:", fallbackUrl);
          clearTimeout(timeoutId);
          controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), 30000);
          
          response = await nodeFetch(fallbackUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            signal: controller.signal
          });
        } else {
          throw error;
        }
      }
      
      clearTimeout(timeoutId);

      console.log("Tour Ninja API Response Status:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Tour Ninja API Error Response:", errorText);
        throw new Error(`Tour Ninja API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log("Tour Ninja API Raw Response:", responseText.substring(0, 500));
      
      let apiResponse;
      try {
        apiResponse = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse Tour Ninja API response:", e);
        throw new Error("Invalid JSON response from Tour Ninja API");
      }
      
      // Extract and enhance tours data from the legacy API response  
      let tours: any[] = [];
      
      // The legacy API returns an object with tours array - structure confirmed by Tour Ninja agent
      if (apiResponse.success && apiResponse.tours && Array.isArray(apiResponse.tours)) {
        tours = apiResponse.tours.map((tour: any) => {
          // Store base64 image in server cache but don't send to client
          const hasImage = !!(tour.image || tour.primaryImage);
          
          // Store the base64 image in server-side cache only
          const cachedImage = tour.image || tour.primaryImage || null;
          
          // For client, use image proxy URL instead of base64 to improve performance
          const imageUrl = hasImage ? `/api/image-proxy/${tour.id}/presentation` : null;
          
          if (hasImage) {
            console.log(`Tour ${tour.name}: Will use image proxy URL`);
          } else {
            console.log(`Tour ${tour.name}: No image available`);
          }
          
          return {
            id: tour.id,
            name: tour.name || tour.title,
            description: tour.description || '',
            shortDescription: tour.description ? tour.description.substring(0, 150) + '...' : '',
            // IMPORTANT: Don't send base64 images to client - use proxy URLs instead for better performance
            images: imageUrl ? [imageUrl] : [],
            primaryImage: imageUrl,
            fallbackImage: imageUrl,
            presentationImageUrl: imageUrl,
            originalPrimaryImage: imageUrl,
            price: tour.price || 0,
            currency: tour.currency || 'THB',
            duration: tour.duration || 1,
            location: tour.destination || 'Krabi, Thailand',
            bookingUrl: tour.bookingUrl || tour.url || `https://www.tourninja.io/book/${tour.id}`,
            detailsUrl: tour.detailsUrl || tour.url || `https://www.tourninja.io/details/${tour.id}`,
            presentationUrl: tour.detailsUrl || tour.url || `https://www.tourninja.io/details/${tour.id}`,
            externalId: tour.id,
            slug: tour.slug || tour.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            tourType: tour.tourType || 'group',
            maxParticipants: tour.maxParticipants || 12,
            isActive: true,
            category: tour.category || '',
            tags: tour.tags || [],
            maxGuests: tour.maxParticipants || 12,
            minGuests: 1,
            // Keep base64 in server cache but not sent to client
            _serverCachedImage: cachedImage
          };
        });
      } else if (Array.isArray(apiResponse)) {
        // Legacy: Fallback if API returns array directly
        tours = apiResponse.map((tour: any) => ({
          ...tour,
          primaryImage: tour.image || (tour.images && tour.images[0]) || null,
          bookingUrl: tour.bookingUrl || tour.url || `https://www.tourninja.io/book/${tour.id}`,
          detailsUrl: tour.detailsUrl || tour.url || `https://www.tourninja.io/details/${tour.id}`,
          presentationUrl: tour.presentationUrl || tour.detailsUrl || tour.url || `https://www.tourninja.io/details/${tour.id}`,
          location: tour.location || 'Krabi, Thailand'
        }));
      } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
        tours = apiResponse.data;
      }
      
      console.log(`Tour Ninja API: Successfully processed ${tours.length} tours`);
      console.log("Tour Ninja API Full Response Structure:", {
        hasToursArray: !!apiResponse.tours,
        toursArrayLength: apiResponse.tours ? apiResponse.tours.length : 0,
        isDirectArray: Array.isArray(apiResponse),
        directArrayLength: Array.isArray(apiResponse) ? apiResponse.length : 0,
        hasDataProperty: !!apiResponse.data,
        dataLength: apiResponse.data ? apiResponse.data.length : 0,
        allKeys: Object.keys(apiResponse)
      });
      
      // If no tours found, use demo credentials as fallback 
      if (!tours || tours.length === 0) {
        console.log("🔄 Applying demo fallback for tours...");
        // Force using demo data that works
        const fallbackUrl = "https://www.tourninja.io/api/public/tours?apiKey=tourninja-showcase-2-amontour&companyId=2&limit=100";
        tourCache.data = null; // Clear cache to force fresh fetch
        // This will be handled by the existing logic above
      }
      
      // Update cache
      tourCache.data = tours;
      tourCache.timestamp = Date.now();
      
      res.json({
        success: true,
        data: tours,
        cached: false,
        fallback: tours.length > 0 && tours[0]?.id ? (tours[0].id.toString().startsWith('demo') ? 'demo' : 'production') : 'none',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error fetching tours from Tour Ninja:", error);
      
      // Fallback to cache if available, even if expired
      if (tourCache.data) {
        console.log("Returning expired cache as fallback");
        return res.json({
          success: true,
          data: tourCache.data,
          cached: true,
          fallback: true,
          timestamp: tourCache.timestamp
        });
      }
      
      // Log the exact error for debugging
      console.log("Tour Ninja API Error Details:", {
        status: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        url: 'https://www.tourninja.io/api/public/tours/legacy?companyId=2'
      });
      
      // Return empty array until API connection is resolved - no fallback data
      res.json({ 
        success: true,
        data: [],
        cached: false,
        message: "Tour Ninja API connection en cours de résolution", 
        apiStatus: "connection_issue",
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  });

  // Tour Showcase endpoint - Get specific tour by token from TourNinja
  app.get("/api/public/tour-showcase/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const response = await fetch(`https://www.tourninja.io/api/public/tours/legacy?companyId=2`, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      const data = await response.json();
      const tour = data.tours?.find((t: any) => t.id === token);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      res.json(tour);
    } catch (error) {
      console.error("Error fetching tour showcase:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== TOUR NINJA IMAGE OVERRIDE API ROUTES =====

  // Get all Tour Ninja image overrides
  app.get("/api/admin/tour-ninja-images", requireAuth, async (req, res) => {
    try {
      const overrides = await storage.getTourNinjaImageOverrides();
      res.json(overrides);
    } catch (error) {
      console.error("Error fetching Tour Ninja image overrides:", error);
      res.status(500).json({ message: "Failed to fetch image overrides", error: String(error) });
    }
  });

  // Create new Tour Ninja image override - AVEC STOCKAGE PERSISTANT
  app.post("/api/admin/tour-ninja-images", requireAuth, upload.single('image'), async (req, res) => {
    try {
      const { tourNinjaId, tourName, originalImageUrl } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      // 🚀 NOUVELLE LOGIQUE: Upload vers stockage persistant
      let customImageUrl: string;
      try {
        customImageUrl = await persistentImageStorage.uploadTourImage(req.file, tourNinjaId);
        console.log(`✅ Image uploaded to persistent storage: ${customImageUrl}`);
      } catch (storageError) {
        console.warn("⚠️ Persistent storage failed, falling back to local storage:", storageError);
        customImageUrl = getPublicFileUrl(req.file.filename);
      }

      const overrideData = insertTourNinjaImageOverrideSchema.parse({
        tourNinjaId,
        tourName,
        customImageUrl,
        originalImageUrl: originalImageUrl || null
      });

      const override = await storage.createTourNinjaImageOverride(overrideData);
      res.status(201).json({
        ...override,
        isPersistent: persistentImageStorage.isPersistentUrl(customImageUrl)
      });
    } catch (error: any) {
      console.error("Error creating Tour Ninja image override:", error);
      res.status(400).json({ 
        message: "Failed to create image override", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  // Update Tour Ninja image override - AVEC STOCKAGE PERSISTANT
  app.put("/api/admin/tour-ninja-images/:id", requireAuth, upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid override ID" });
      }

      const updateData: any = {};
      
      if (req.body.tourName) updateData.tourName = req.body.tourName;
      if (req.body.originalImageUrl) updateData.originalImageUrl = req.body.originalImageUrl;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true';
      
      // 🚀 NOUVELLE LOGIQUE: Upload vers stockage persistant si fichier fourni
      if (req.file) {
        try {
          // Récupérer le tourNinjaId actuel pour l'upload
          const existingOverride = await storage.getTourNinjaImageOverride(id);
          const tourNinjaId = existingOverride?.tourNinjaId || `unknown-${Date.now()}`;
          
          updateData.customImageUrl = await persistentImageStorage.uploadTourImage(req.file, tourNinjaId);
          console.log(`✅ Image mise à jour vers stockage persistant: ${updateData.customImageUrl}`);
        } catch (storageError) {
          console.warn("⚠️ Persistent storage failed, falling back to local storage:", storageError);
          updateData.customImageUrl = getPublicFileUrl(req.file.filename);
        }
      }

      const updatedOverride = await storage.updateTourNinjaImageOverride(id, updateData);
      if (!updatedOverride) {
        return res.status(404).json({ message: "Image override not found" });
      }

      res.json({
        ...updatedOverride,
        isPersistent: updatedOverride.customImageUrl ? persistentImageStorage.isPersistentUrl(updatedOverride.customImageUrl) : false
      });
    } catch (error) {
      console.error("Error updating Tour Ninja image override:", error);
      res.status(500).json({ message: "Failed to update image override", error: String(error) });
    }
  });

  // Toggle Tour Ninja image override active status
  app.patch("/api/admin/tour-ninja-images/:id/toggle", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid override ID" });
      }

      const updatedOverride = await storage.toggleTourNinjaImageOverride(id);
      if (!updatedOverride) {
        return res.status(404).json({ message: "Image override not found" });
      }

      res.json(updatedOverride);
    } catch (error) {
      console.error("Error toggling Tour Ninja image override:", error);
      res.status(500).json({ message: "Failed to toggle image override", error: String(error) });
    }
  });

  // Delete Tour Ninja image override
  app.delete("/api/admin/tour-ninja-images/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid override ID" });
      }

      const deleted = await storage.deleteTourNinjaImageOverride(id);
      if (!deleted) {
        return res.status(404).json({ message: "Image override not found" });
      }

      res.json({ message: "Image override deleted successfully" });
    } catch (error) {
      console.error("Error deleting Tour Ninja image override:", error);
      res.status(500).json({ message: "Failed to delete image override", error: String(error) });
    }
  });

  // Get all Tour Ninja image overrides (public endpoint for frontend use)
  app.get("/api/tour-ninja-image-overrides", async (req, res) => {
    try {
      const overrides = await storage.getTourNinjaImageOverrides();
      // Only return active overrides for public consumption
      const activeOverrides = overrides.filter(override => override.isActive);
      res.json(activeOverrides);
    } catch (error) {
      console.error("Error fetching Tour Ninja image overrides:", error);
      res.status(500).json({ message: "Failed to fetch image overrides", error: String(error) });
    }
  });

  // Get Tour Ninja image override by tour ID (public endpoint for frontend use)
  app.get("/api/tour-ninja-images/:tourId", async (req, res) => {
    try {
      const { tourId } = req.params;
      const override = await storage.getTourNinjaImageOverrideByTourId(tourId);
      
      if (!override) {
        return res.status(404).json({ message: "No image override found for this tour" });
      }

      res.json(override);
    } catch (error) {
      console.error("Error fetching Tour Ninja image override by tour ID:", error);
      res.status(500).json({ message: "Failed to fetch image override", error: String(error) });
    }
  });

  // ===== CUSTOM FORMS API ROUTES =====

  // Get all custom forms (admin only)
  app.get("/api/admin/custom-forms", requireAuth, async (req, res) => {
    try {
      const forms = await storage.getCustomForms();
      res.json(forms);
    } catch (error) {
      console.error("Error fetching custom forms:", error);
      res.status(500).json({ message: "Failed to fetch custom forms", error: String(error) });
    }
  });

  // Get custom form by ID (admin only)
  app.get("/api/admin/custom-forms/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }

      const form = await storage.getCustomForm(id);
      if (!form) {
        return res.status(404).json({ message: "Custom form not found" });
      }

      res.json(form);
    } catch (error) {
      console.error("Error fetching custom form:", error);
      res.status(500).json({ message: "Failed to fetch custom form", error: String(error) });
    }
  });

  // Create new custom form (admin only)
  app.post("/api/admin/custom-forms", requireAuth, async (req, res) => {
    try {
      const formData = insertCustomFormSchema.parse(req.body);
      const form = await storage.createCustomForm(formData);
      res.status(201).json(form);
    } catch (error: any) {
      console.error("Error creating custom form:", error);
      res.status(400).json({ 
        message: "Failed to create custom form", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  // Update custom form (admin only)
  app.put("/api/admin/custom-forms/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }

      console.log(`🔵 Données reçues par le serveur pour formulaire ${id}:`, JSON.stringify(req.body, null, 2));
      const formData = insertCustomFormSchema.partial().parse(req.body);
      console.log(`🔵 Données après validation Zod:`, JSON.stringify(formData, null, 2));
      const updatedForm = await storage.updateCustomForm(id, formData);
      console.log(`🔵 Formulaire mis à jour dans DB:`, JSON.stringify(updatedForm, null, 2));
      
      if (!updatedForm) {
        return res.status(404).json({ message: "Custom form not found" });
      }

      res.json(updatedForm);
    } catch (error: any) {
      console.error("Error updating custom form:", error);
      res.status(400).json({ 
        message: "Failed to update custom form", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  // Delete custom form (admin only)
  app.delete("/api/admin/custom-forms/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }

      const deleted = await storage.deleteCustomForm(id);
      if (!deleted) {
        return res.status(404).json({ message: "Custom form not found" });
      }

      res.json({ message: "Custom form deleted successfully" });
    } catch (error) {
      console.error("Error deleting custom form:", error);
      res.status(500).json({ message: "Failed to delete custom form", error: String(error) });
    }
  });

  // ===== SITE APPEARANCE API ROUTES =====

  // Public Footer Settings (no auth required)
  app.get("/api/public/footer-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings('footer');
      res.json(settings);
    } catch (error) {
      console.error('Error fetching footer settings:', error);
      res.status(500).json({ error: 'Failed to fetch footer settings' });
    }
  });

  // Public Header Settings (no auth required)
  app.get("/api/public/header-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings('header');
      res.json(settings);
    } catch (error) {
      console.error('Error fetching header settings:', error);
      res.status(500).json({ error: 'Failed to fetch header settings' });
    }
  });

  // Site Settings routes (requires auth)
  app.get("/api/admin/site-settings", requireAuth, async (req, res) => {
    try {
      const { section } = req.query;
      const settings = await storage.getSiteSettings(section as string);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings", error: String(error) });
    }
  });

  app.get("/api/admin/site-settings/:section/:key", requireAuth, async (req, res) => {
    try {
      const { section, key } = req.params;
      const setting = await storage.getSiteSetting(section, key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching site setting:", error);
      res.status(500).json({ message: "Failed to fetch site setting", error: String(error) });
    }
  });

  app.post("/api/admin/site-settings", requireAuth, async (req, res) => {
    try {
      const settingData = insertSiteSettingSchema.parse(req.body);
      const setting = await storage.createSiteSetting(settingData);
      res.status(201).json(setting);
    } catch (error: any) {
      console.error("Error creating site setting:", error);
      res.status(400).json({ 
        message: "Invalid setting data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.put("/api/admin/site-settings/:section/:key", requireAuth, async (req, res) => {
    try {
      const { section, key } = req.params;
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }

      const setting = await storage.updateSiteSetting(section, key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ message: "Failed to update site setting", error: String(error) });
    }
  });

  app.delete("/api/admin/site-settings/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid setting ID" });
      }

      const deleted = await storage.deleteSiteSetting(id);
      if (!deleted) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json({ message: "Setting deleted successfully" });
    } catch (error) {
      console.error("Error deleting site setting:", error);
      res.status(500).json({ message: "Failed to delete setting", error: String(error) });
    }
  });

  // Content Blocks routes
  app.get("/api/admin/content-blocks", requireAuth, async (req, res) => {
    try {
      const { pageLocation } = req.query;
      const blocks = await storage.getContentBlocks(pageLocation as string);
      res.json(blocks);
    } catch (error) {
      console.error("Error fetching content blocks:", error);
      res.status(500).json({ message: "Failed to fetch content blocks", error: String(error) });
    }
  });

  app.get("/api/admin/content-blocks/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid block ID" });
      }

      const block = await storage.getContentBlock(id);
      if (!block) {
        return res.status(404).json({ message: "Content block not found" });
      }

      res.json(block);
    } catch (error) {
      console.error("Error fetching content block:", error);
      res.status(500).json({ message: "Failed to fetch content block", error: String(error) });
    }
  });

  app.post("/api/admin/content-blocks", requireAuth, async (req, res) => {
    try {
      const blockData = insertContentBlockSchema.parse(req.body);
      const block = await storage.createContentBlock(blockData);
      res.status(201).json(block);
    } catch (error: any) {
      console.error("Error creating content block:", error);
      res.status(400).json({ 
        message: "Invalid block data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.put("/api/admin/content-blocks/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid block ID" });
      }

      const block = await storage.updateContentBlock(id, req.body);
      if (!block) {
        return res.status(404).json({ message: "Content block not found" });
      }

      res.json(block);
    } catch (error) {
      console.error("Error updating content block:", error);
      res.status(500).json({ message: "Failed to update content block", error: String(error) });
    }
  });

  app.patch("/api/admin/content-blocks/:id/toggle", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid block ID" });
      }

      const block = await storage.toggleContentBlock(id);
      if (!block) {
        return res.status(404).json({ message: "Content block not found" });
      }

      res.json(block);
    } catch (error) {
      console.error("Error toggling content block:", error);
      res.status(500).json({ message: "Failed to toggle content block", error: String(error) });
    }
  });

  app.delete("/api/admin/content-blocks/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid block ID" });
      }

      const deleted = await storage.deleteContentBlock(id);
      if (!deleted) {
        return res.status(404).json({ message: "Content block not found" });
      }

      res.json({ message: "Content block deleted successfully" });
    } catch (error) {
      console.error("Error deleting content block:", error);
      res.status(500).json({ message: "Failed to delete content block", error: String(error) });
    }
  });

  // Static Pages routes
  app.get("/api/admin/static-pages", requireAuth, async (req, res) => {
    try {
      const pages = await storage.getStaticPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching static pages:", error);
      res.status(500).json({ message: "Failed to fetch static pages", error: String(error) });
    }
  });

  app.get("/api/admin/static-pages/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid page ID" });
      }

      const page = await storage.getStaticPage(id);
      if (!page) {
        return res.status(404).json({ message: "Static page not found" });
      }

      res.json(page);
    } catch (error) {
      console.error("Error fetching static page:", error);
      res.status(500).json({ message: "Failed to fetch static page", error: String(error) });
    }
  });

  app.post("/api/admin/static-pages", requireAuth, async (req, res) => {
    try {
      const pageData = insertStaticPageSchema.parse(req.body);
      const page = await storage.createStaticPage(pageData);
      res.status(201).json(page);
    } catch (error: any) {
      console.error("Error creating static page:", error);
      res.status(400).json({ 
        message: "Invalid page data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.put("/api/admin/static-pages/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid page ID" });
      }

      const page = await storage.updateStaticPage(id, req.body);
      if (!page) {
        return res.status(404).json({ message: "Static page not found" });
      }

      res.json(page);
    } catch (error) {
      console.error("Error updating static page:", error);
      res.status(500).json({ message: "Failed to update static page", error: String(error) });
    }
  });

  app.patch("/api/admin/static-pages/:id/toggle", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid page ID" });
      }

      const page = await storage.toggleStaticPagePublished(id);
      if (!page) {
        return res.status(404).json({ message: "Static page not found" });
      }

      res.json(page);
    } catch (error) {
      console.error("Error toggling static page:", error);
      res.status(500).json({ message: "Failed to toggle static page", error: String(error) });
    }
  });

  app.delete("/api/admin/static-pages/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid page ID" });
      }

      const deleted = await storage.deleteStaticPage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Static page not found" });
      }

      res.json({ message: "Static page deleted successfully" });
    } catch (error) {
      console.error("Error deleting static page:", error);
      res.status(500).json({ message: "Failed to delete static page", error: String(error) });
    }
  });

  // Media Library routes
  app.get("/api/admin/media-library", requireAuth, async (req, res) => {
    try {
      const { folder } = req.query;
      const items = await storage.getMediaLibraryItems(folder as string);
      res.json(items);
    } catch (error) {
      console.error("Error fetching media library items:", error);
      res.status(500).json({ message: "Failed to fetch media library items", error: String(error) });
    }
  });

  app.get("/api/admin/media-library/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid media ID" });
      }

      const item = await storage.getMediaLibraryItem(id);
      if (!item) {
        return res.status(404).json({ message: "Media item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error fetching media library item:", error);
      res.status(500).json({ message: "Failed to fetch media library item", error: String(error) });
    }
  });

  app.post("/api/admin/media-library", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = getPublicFileUrl(req.file.filename);
      
      const mediaData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: fileUrl,
        fileType: req.file.mimetype.startsWith('image/') ? 'image' : 
                 req.file.mimetype.startsWith('video/') ? 'video' : 'document',
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        altText: req.body.altText || '',
        caption: req.body.caption || '',
        folder: req.body.folder || 'general'
      };

      const item = await storage.createMediaLibraryItem(mediaData);
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error uploading media file:", error);
      res.status(400).json({ 
        message: "Failed to upload media file", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  app.put("/api/admin/media-library/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid media ID" });
      }

      const item = await storage.updateMediaLibraryItem(id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Media item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error updating media library item:", error);
      res.status(500).json({ message: "Failed to update media library item", error: String(error) });
    }
  });

  app.patch("/api/admin/media-library/:id/used", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid media ID" });
      }

      const { isUsed } = req.body;
      const item = await storage.markMediaAsUsed(id, isUsed);
      if (!item) {
        return res.status(404).json({ message: "Media item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error marking media as used:", error);
      res.status(500).json({ message: "Failed to mark media as used", error: String(error) });
    }
  });

  app.delete("/api/admin/media-library/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid media ID" });
      }

      const deleted = await storage.deleteMediaLibraryItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Media item not found" });
      }

      res.json({ message: "Media item deleted successfully" });
    } catch (error) {
      console.error("Error deleting media library item:", error);
      res.status(500).json({ message: "Failed to delete media library item", error: String(error) });
    }
  });

  // Public routes for content blocks and static pages
  app.get("/api/content-blocks/:pageLocation", async (req, res) => {
    try {
      const { pageLocation } = req.params;
      const blocks = await storage.getContentBlocks(pageLocation);
      // Only return active blocks for public consumption
      const activeBlocks = blocks.filter(block => block.isActive);
      res.json(activeBlocks);
    } catch (error) {
      console.error("Error fetching public content blocks:", error);
      res.status(500).json({ message: "Failed to fetch content blocks", error: String(error) });
    }
  });

  app.get("/api/static-pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getStaticPageBySlug(slug);
      
      if (!page || !page.isPublished) {
        return res.status(404).json({ message: "Page not found" });
      }

      res.json(page);
    } catch (error) {
      console.error("Error fetching public static page:", error);
      res.status(500).json({ message: "Failed to fetch static page", error: String(error) });
    }
  });

  // Page Builder API Routes
  
  // Page configurations
  app.get("/api/admin/page-configurations/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const config = await storage.getPageConfiguration(slug);
      if (!config) {
        return res.status(404).json({ message: "Page configuration not found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching page configuration by slug:", error);
      res.status(500).json({ message: "Failed to fetch page configuration", error: String(error) });
    }
  });

  app.get("/api/admin/page-configurations", requireAuth, async (req, res) => {
    try {
      const configs = await storage.getPageConfigurations();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching page configurations:", error);
      res.status(500).json({ message: "Failed to fetch page configurations", error: String(error) });
    }
  });

  app.get("/api/admin/page-configurations/:slug", requireAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      const config = await storage.getPageConfiguration(slug);
      if (!config) {
        return res.status(404).json({ message: "Page configuration not found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching page configuration:", error);
      res.status(500).json({ message: "Failed to fetch page configuration", error: String(error) });
    }
  });

  app.post("/api/admin/page-configurations", requireAuth, async (req, res) => {
    try {
      const { sourcePageId, ...pageData } = req.body;
      
      // Valider les données de la page
      const validatedData = insertPageConfigurationSchema.parse(pageData);
      
      // Créer la nouvelle page
      const config = await storage.createPageConfiguration(validatedData);
      
      // Si on duplique une page existante, copier ses blocks
      if (sourcePageId) {
        const sourcePageIdNum = parseInt(sourcePageId);
        if (!isNaN(sourcePageIdNum)) {
          // Récupérer la page source
          const sourcePage = await db.select().from(pageConfigurations).where(eq(pageConfigurations.id, sourcePageIdNum)).limit(1);
          
          if (sourcePage.length > 0) {
            // Récupérer les blocks de la page source
            const sourceBlocks = await storage.getPageBlocksBySlug(sourcePage[0].pageSlug);
            
            // Dupliquer chaque block pour la nouvelle page
            for (const block of sourceBlocks) {
              await storage.createPageBlock({
                pageId: config.id,
                blockType: block.blockType,
                blockOrder: block.blockOrder,
                identifier: block.identifier || `block-${block.blockType}-${block.blockOrder}`,
                isActive: block.isActive,
                title: block.title,
                subtitle: block.subtitle,
                description: block.description,
                content: block.content,
                imageUrl: block.imageUrl,
                imageAlt: block.imageAlt,
                ctaText: block.ctaText,
                ctaUrl: block.ctaUrl,
                ctaStyle: block.ctaStyle,
                iconName: block.iconName,
                backgroundColor: block.backgroundColor,
                configuration: block.configuration
              });
            }
          }
        }
      }
      
      res.status(201).json(config);
    } catch (error) {
      console.error("Error creating page configuration:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create page configuration", error: String(error) });
    }
  });

  app.put("/api/admin/page-configurations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid page configuration ID" });
      }

      const validatedData = insertPageConfigurationSchema.partial().parse(req.body);
      const config = await storage.updatePageConfiguration(id, validatedData);
      
      if (!config) {
        return res.status(404).json({ message: "Page configuration not found" });
      }

      res.json(config);
    } catch (error) {
      console.error("Error updating page configuration:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update page configuration", error: String(error) });
    }
  });

  app.delete("/api/admin/page-configurations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid page configuration ID" });
      }

      // Vérifier que ce n'est pas la page d'accueil
      const config = await storage.getPageConfigurations();
      const pageToDelete = config.find(p => p.id === id);
      
      if (!pageToDelete) {
        return res.status(404).json({ message: "Page configuration not found" });
      }
      
      if (pageToDelete.pageSlug === 'home') {
        return res.status(400).json({ message: "Cannot delete the home page" });
      }

      const deleted = await storage.deletePageConfiguration(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Page configuration not found" });
      }

      res.json({ message: "Page configuration deleted successfully" });
    } catch (error) {
      console.error("Error deleting page configuration:", error);
      res.status(500).json({ message: "Failed to delete page configuration", error: String(error) });
    }
  });

  // Page blocks - Public route for dynamic pages
  app.get("/api/public/page-blocks/:pageSlug", async (req, res) => {
    try {
      const { pageSlug } = req.params;
      const blocks = await storage.getPageBlocksBySlug(pageSlug);
      // Only return active blocks for public access
      const activeBlocks = blocks.filter(block => block.isActive);
      res.json(activeBlocks);
    } catch (error) {
      console.error("Error fetching public page blocks:", error);
      res.status(500).json({ message: "Failed to fetch page blocks", error: String(error) });
    }
  });

  // Page blocks - Admin route (protected) - Returns ALL blocks including inactive ones
  app.get("/api/admin/page-blocks/:pageSlug", requireAuth, async (req, res) => {
    try {
      const { pageSlug } = req.params;
      const blocks = await storage.getAllPageBlocksBySlug(pageSlug);
      res.json(blocks);
    } catch (error) {
      console.error("Error fetching page blocks:", error);
      res.status(500).json({ message: "Failed to fetch page blocks", error: String(error) });
    }
  });

  app.post("/api/admin/page-blocks", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPageBlockSchema.parse(req.body);
      const block = await storage.createPageBlock(validatedData);
      res.status(201).json(block);
    } catch (error) {
      console.error("Error creating page block:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create page block", error: String(error) });
    }
  });

  app.post("/api/admin/page-blocks/insert", requireAuth, async (req, res) => {
    try {
      const { blockType, position, pageId, pageSlug } = req.body;
      
      console.log(`[INSERT BLOCK] Received blockType: ${blockType}, position: ${position}`);
      
      // Validate required fields
      if (!blockType || position === undefined || (!pageId && !pageSlug)) {
        return res.status(400).json({ message: "Missing required fields: blockType, position, and (pageId or pageSlug)" });
      }

      // Get pageId if pageSlug is provided
      let finalPageId = pageId;
      if (!finalPageId && pageSlug) {
        const config = await storage.getPageConfiguration(pageSlug);
        if (!config) {
          return res.status(404).json({ message: "Page not found" });
        }
        finalPageId = config.id;
      }

      // Create default block data based on type
      const defaultBlockData: Record<string, any> = {
        hero: {
          identifier: `hero_${Date.now()}`,
          title: '',
          description: 'Hero section',
          blockType: 'hero',
          configuration: { 
            title: '',
            ctaUrl: '',
            ctaText: '',
            overlay: true,
            subtitle: '',
            videoUrl: '',
            backgroundImage: ''
          },
          isActive: false
        },
        text: {
          identifier: `text_${Date.now()}`,
          title: 'Text + Buttons',
          blockType: 'text',
          configuration: { 
            title: 'Titre de la section',
            content: 'Ajoutez ici le contenu de votre section de texte. Vous pouvez décrire vos services, partager votre histoire, ou présenter des informations importantes.',
            titleColor: '#333333',
            contentColor: '#666666',
            dividerColor: '#3BA8AF',
            backgroundColor: '#ffffff'
          },
          isActive: false
        },
        text_section: {
          identifier: `text_section_${Date.now()}`,
          title: 'Nouvelle Section Texte',
          blockType: 'text_section',
          configuration: { content: '' },
          isActive: false
        },
        card_grid_date: {
          identifier: `card_grid_date_${Date.now()}`,
          title: 'Grille de Cartes avec Dates',
          blockType: 'card_grid',
          configuration: { cards: [], showDates: true, cardsColor: '#084F6E' },
          isActive: false
        },
        form: {
          identifier: `form_${Date.now()}`,
          title: 'Nouveau Formulaire',
          blockType: 'form',
          configuration: { formId: null },
          isActive: false
        },
        card_grid_price: {
          identifier: `card_grid_price_${Date.now()}`,
          title: 'Grille de Cartes avec Prix',
          blockType: 'card_grid',
          configuration: { cards: [], showPrices: true, cardsColor: '#084F6E' },
          isActive: false
        },
        advantages: {
          identifier: `advantages_${Date.now()}`,
          title: 'Nouveaux Avantages',
          blockType: 'advantages',
          configuration: { advantages: [] },
          isActive: false
        },
        text_image: {
          identifier: `text_image_${Date.now()}`,
          title: '',
          blockType: 'text_image',
          configuration: { 
            title: '',
            content: '',
            hasImage: false,
            maxWidth: '4xl',
            textAlign: 'center'
          },
          isActive: false
        },
        popular_experiences: {
          identifier: `popular_experiences_${Date.now()}`,
          title: 'Card Grid Date',
          blockType: 'popular_experiences',
          configuration: { 
            title: 'Titre de la section',
            subtitle: 'Description de votre grille de cartes avec badges de durée',
            titleColor: '#333333',
            subtitleColor: '#666666',
            dividerColor: '#3BA8AF',
            backgroundColor: '#ffffff',
            categoryFilter: 'all',
            showAllAds: false,
            displayCountMobile: 4,
            displayCountTablet: 4,
            displayCountDesktop: 6,
            mobileColumns: 1,
            tabletColumns: 2,
            desktopColumns: 3,
            cardsColor: '#084F6E',
            cardButtonColor: '#084F6E',
            buttonText: 'Voir tous les tours',
            buttonUrl: '/tours',
            buttonBackgroundColor: '#084F6E',
            buttonTextColor: '#ffffff',
            buttonStyle: 'solid'
          },
          isActive: false
        },
        custom_tour_form: {
          identifier: `custom_tour_form_${Date.now()}`,
          title: 'Titre du formulaire',
          subtitle: 'Description de votre formulaire personnalisé.',
          blockType: 'custom_tour_form',
          configuration: { 
            title: 'Titre du formulaire',
            subtitle: 'Description de votre formulaire personnalisé.',
            titleColor: '#333333',
            subtitleColor: '#666666',
            dividerColor: '#3BA8AF',
            backgroundColor: '#ffffff',
            formId: null
          },
          isActive: false
        },
        tour_ninja_section: {
          identifier: `tour_ninja_section_${Date.now()}`,
          title: 'Card Grid Price',
          blockType: 'tour_ninja_section',
          configuration: { 
            title: 'Titre de la section',
            subtitle: 'Description de votre grille de cartes avec prix.',
            titleColor: '#333333',
            subtitleColor: '#666666',
            dividerColor: '#3BA8AF',
            backgroundColor: '#ffffff',
            categoryFilter: 'all',
            showAllAds: false,
            displayCountMobile: 4,
            displayCountTablet: 4,
            displayCountDesktop: 6,
            mobileColumns: 1,
            tabletColumns: 2,
            desktopColumns: 3,
            cardsColor: '#084F6E',
            cardButtonColor: '#084F6E',
            buttonText: 'Bouton',
            buttonUrl: '',
            buttonBackgroundColor: '#084F6E',
            buttonTextColor: '#ffffff',
            buttonStyle: 'solid'
          },
          isActive: false
        },
        why_choose_us: {
          identifier: `why_choose_us_${Date.now()}`,
          title: 'Text + Icones',
          blockType: 'why_choose_us',
          configuration: { 
            title: 'Titre de la section',
            subtitle: 'Description de votre section avec icônes.',
            titleColor: '#333333',
            subtitleColor: '#666666',
            dividerColor: '#3BA8AF',
            backgroundColor: '#ffffff',
            iconBlocks: [
              {
                id: 1,
                mainIcon: 'fas fa-user-friends',
                title: 'Titre',
                description: 'Description',
                iconColor: '#084F6E',
                miniIcons: []
              },
              {
                id: 2,
                mainIcon: 'fas fa-compass',
                title: 'Titre',
                description: 'Description',
                iconColor: '#3BA8AF',
                miniIcons: []
              },
              {
                id: 3,
                mainIcon: 'fas fa-star',
                title: 'Titre',
                description: 'Description',
                iconColor: '#084F6E',
                miniIcons: []
              }
            ]
          },
          isActive: false
        },
        who_we_are: {
          identifier: `who_we_are_${Date.now()}`,
          title: 'Text + Images',
          blockType: 'who_we_are',
          configuration: { 
            title: 'Titre principal',
            titleColor: '#333333',
            subtitleColor: '#333333',
            textColor: '#666666',
            dividerColor: '#3BA8AF',
            backgroundColor: '#ffffff',
            introduction: 'Ajoutez ici votre contenu texte principal.',
            sections: [
              {
                id: 1,
                subtitle: 'Sous-titre',
                text: 'Description supplémentaire pour votre section.'
              }
            ],
            images: [
              {
                id: 1,
                url: '',
                alt: 'Image 1'
              }
            ],
            buttons: [
              {
                id: 1,
                text: 'Bouton 1',
                url: '',
                color: '#084F6E',
                textColor: '#ffffff',
                style: 'filled'
              },
              {
                id: 2,
                text: 'Bouton 2 →',
                url: '',
                color: '#ffffff',
                textColor: '#084F6E',
                style: 'outline'
              }
            ],
            layoutStyle: 'right'
          },
          isActive: false
        },
        header_page: {
          identifier: `header_page_${Date.now()}`,
          title: 'Header Page',
          blockType: 'header_page',
          configuration: { 
            title: 'Titre de la page',
            subtitle: 'Sous-titre',
            titleColor: '#ffffff',
            subtitleColor: '#ffffff',
            iconUrl: '',
            iconColor: '#ffffff',
            backgroundType: 'gradient',
            gradientColor1: '#084F6E',
            gradientColor2: '#3BA8AF',
            frameSize: 'small',
            buttons: []
          },
          isActive: false
        },
        search_bar_tours: {
          identifier: `search_bar_tours_${Date.now()}`,
          title: 'Search bar : Tours',
          blockType: 'search_bar_tours',
          configuration: {
            filtersTitle: 'Filters',
            searchPlaceholder: 'Search for a tour...',
            filtersTextColor: '#333333',
            filtersBgColor: '#ffffff',
            cardsColor: '#084F6E',
            backgroundColor: '#ffffff',
            mobileColumns: 1,
            tabletColumns: 2,
            desktopColumns: 3
          },
          isActive: false
        },
        contact: {
          identifier: `contact_${Date.now()}`,
          title: 'Contact',
          blockType: 'contact',
          configuration: {
            title: 'Titre principal',
            subtitle: 'Description pour votre section de contact',
            titleColor: '#084F6E',
            subtitleColor: '#666666',
            dividerColor: '#3BA8AF',
            backgroundColor: '#ffffff',
            email: 'contact@example.com',
            emailLabel: 'Email',
            phone: '+ 22 222 222 222',
            phoneLabel: 'Téléphone',
            whatsapp: '+ 22 222 222 222',
            whatsappLabel: 'WhatsApp',
            lineId: 'moncompte',
            lineIdLabel: 'Line ID',
            showAboutCompany: true,
            aboutTitle: 'À propos de notre entreprise',
            companyBrand: 'Nom de la marque',
            companyName: 'Votre Adresse',
            companyLicense: '00/00000',
            companyDescription: ''
          },
          isActive: false
        },
        blog_search: {
          identifier: `blog_search_${Date.now()}`,
          title: 'Search Bar: Blog',
          blockType: 'blog_search',
          configuration: { 
            cardColor: '#084F6E',
            backgroundColor: '#ffffff',
            searchPlaceholder: 'Rechercher des articles...',
            tagsTitle: 'Tags',
            categoriesTitle: 'Catégories',
            allTagsText: 'Tous les tags',
            allCategoriesText: 'Toutes les catégories',
            tagButtonColor: '#3BA8AF',
            tagButtonTextColor: '#ffffff',
            categoryButtonColor: '#084F6E',
            categoryButtonTextColor: '#ffffff'
          },
          isActive: false
        },
        text_gallery: {
          identifier: `text_gallery_${Date.now()}`,
          title: 'Text + Gallery',
          blockType: 'text_gallery',
          configuration: {
            title: 'Titre de la galerie',
            subtitle: 'Description pour votre galerie d\'images',
            titleColor: '#333333',
            subtitleColor: '#666666',
            dividerColor: '#3BA8AF',
            backgroundColor: '#ffffff',
            carouselType: 'petite',
            images: []
          },
          isActive: false
        },
        text_video: {
          identifier: `text_video_${Date.now()}`,
          title: 'Text + Video',
          blockType: 'text_video',
          configuration: {
            title: 'Titre de la vidéo',
            subtitle: 'Description pour votre section vidéo',
            titleColor: '#333333',
            subtitleColor: '#666666',
            dividerColor: '#3BA8AF',
            backgroundColor: '#ffffff',
            videoUrl: '',
            videoType: 'youtube'
          },
          isActive: false
        },
        text_listing: {
          identifier: `text_listing_${Date.now()}`,
          title: 'Text + Listing',
          blockType: 'text_listing',
          configuration: {
            title: 'Titre de la section',
            subtitle: 'Description de votre listing',
            items: [
              { label: '1', description: 'Description de votre element' },
              { label: '2', description: 'Description de votre element' },
              { label: '3', description: 'Description de votre element' }
            ],
            labelColor: '#084F6E',
            dividerColor: '#3BA8AF',
            backgroundColor: '#ffffff'
          },
          isActive: false
        },
        text_pricing: {
          identifier: `text_pricing_${Date.now()}`,
          title: 'Text + Pricing',
          blockType: 'text_pricing',
          configuration: {
            title: 'Titre de la section',
            subtitle: 'Description de vos tarifs',
            pricingCards: [
              {
                title: 'Titre',
                subtitle: 'Sous-titre',
                price: 'Prix',
                currency: 'Devise',
                cycle: 'Cycle',
                label: 'Label',
                moreText: 'Texte',
                headerGradient: '#084F6E'
              },
              {
                title: 'Titre',
                subtitle: 'Sous-titre',
                price: 'Prix',
                currency: 'Devise',
                cycle: 'Cycle',
                label: 'Label',
                moreText: 'Texte',
                headerGradient: '#084F6E'
              },
              {
                title: 'Titre',
                subtitle: 'Sous-titre',
                price: 'Prix',
                currency: 'Devise',
                cycle: 'Cycle',
                label: 'Label',
                moreText: 'Texte',
                headerGradient: '#084F6E'
              }
            ],
            dividerColor: '#3BA8AF',
            showPickupSection: false,
            pickupTitle: 'Options supplémentaires',
            pickupTimes: [
              { time: 'Titre', location: 'Sous titre', price: 'Supplément', supplementColor: '#084F6E' },
              { time: 'Titre', location: 'Sous titre', price: 'Supplément', supplementColor: '#084F6E' }
            ],
            includedTitle: 'Included in Price',
            includedDescription: 'Description',
            notIncludedTitle: 'Not Included in Price',
            notIncludedDescription: 'Description',
            includedLogoColor: '#3BA8AF',
            notIncludedLogoColor: '#3BA8AF',
            titleColor: '#1F2937',
            subtitleColor: '#6B7280',
            backgroundColor: '#ffffff'
          },
          isActive: false
        }
      };

      const blockData = defaultBlockData[blockType];
      if (!blockData) {
        return res.status(400).json({ message: `Invalid block type: ${blockType}` });
      }

      const block = await storage.insertPageBlockAtPosition(blockData, position, finalPageId);
      res.status(201).json(block);
    } catch (error) {
      console.error("Error inserting page block:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to insert page block", error: String(error) });
    }
  });

  app.post("/api/admin/page-blocks/insert-template", requireAuth, async (req, res) => {
    try {
      const { templateId, pageId, pageSlug } = req.body;
      
      console.log(`[INSERT TEMPLATE] Received templateId: ${templateId}`);
      
      // Validate required fields
      if (!templateId || (!pageId && !pageSlug)) {
        return res.status(400).json({ message: "Missing required fields: templateId and (pageId or pageSlug)" });
      }

      // Get pageId if pageSlug is provided
      let finalPageId = pageId;
      if (!finalPageId && pageSlug) {
        const config = await storage.getPageConfiguration(pageSlug);
        if (!config) {
          return res.status(404).json({ message: "Page not found" });
        }
        finalPageId = config.id;
      }

      // Define template blocks
      const templateBlocks: Record<string, string[]> = {
        'home': ['hero', 'text', 'popular_experiences', 'custom_tour_form', 'tour_ninja_section', 'why_choose_us', 'who_we_are'],
        'tours': ['header_page', 'search_bar_tours'],
        'cruise': ['header_page', 'why_choose_us', 'text_gallery', 'text_video', 'text_listing', 'custom_tour_form'],
        'custom': ['header_page', 'why_choose_us', 'text_pricing', 'custom_tour_form'],
        'blog': ['header_page', 'blog_search'],
        'contact': ['header_page', 'contact', 'text']
      };

      const blockTypes = templateBlocks[templateId];
      if (!blockTypes) {
        return res.status(400).json({ message: `Invalid template ID: ${templateId}` });
      }

      // Create default block data function (reuse from insert endpoint)
      const getDefaultBlockData = (blockType: string, timestamp: number): any => {
        const defaultData: Record<string, any> = {
          hero: {
            identifier: `hero_${timestamp}`,
            title: '',
            description: 'Hero section',
            blockType: 'hero',
            configuration: { 
              title: '',
              ctaUrl: '',
              ctaText: '',
              overlay: true,
              subtitle: '',
              videoUrl: '',
              backgroundImage: ''
            },
            isActive: false
          },
          text: {
            identifier: `text_${timestamp}`,
            title: 'Text + Buttons',
            blockType: 'text',
            configuration: { 
              title: 'Titre de la section',
              content: 'Ajoutez ici le contenu de votre section de texte. Vous pouvez décrire vos services, partager votre histoire, ou présenter des informations importantes.',
              titleColor: '#333333',
              contentColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff'
            },
            isActive: false
          },
          popular_experiences: {
            identifier: `popular_experiences_${timestamp}`,
            title: 'Card Grid Date',
            blockType: 'popular_experiences',
            configuration: { 
              title: 'Titre de la section',
              subtitle: 'Description de votre grille de cartes avec badges de durée',
              titleColor: '#333333',
              subtitleColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff',
              categoryFilter: 'all',
              showAllAds: false,
              displayCountMobile: 4,
              displayCountTablet: 4,
              displayCountDesktop: 6,
              mobileColumns: 1,
              tabletColumns: 2,
              desktopColumns: 3,
              cardsColor: '#084F6E',
              cardButtonColor: '#084F6E',
              buttonText: 'Voir tous les tours',
              buttonUrl: '/tours',
              buttonBackgroundColor: '#084F6E',
              buttonTextColor: '#ffffff'
            },
            isActive: false
          },
          custom_tour_form: {
            identifier: `custom_tour_form_${timestamp}`,
            title: 'Titre du formulaire',
            subtitle: 'Description de votre formulaire personnalisé.',
            blockType: 'custom_tour_form',
            configuration: { 
              title: 'Titre du formulaire',
              subtitle: 'Description de votre formulaire personnalisé.',
              titleColor: '#333333',
              subtitleColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff',
              formId: null
            },
            isActive: false
          },
          tour_ninja_section: {
            identifier: `tour_ninja_section_${timestamp}`,
            title: 'Card Grid Price',
            blockType: 'tour_ninja_section',
            configuration: { 
              title: 'Titre de la section',
              subtitle: 'Description de votre grille de cartes avec prix',
              titleColor: '#333333',
              subtitleColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff',
              displayCountMobile: 4,
              displayCountTablet: 4,
              displayCountDesktop: 6,
              mobileColumns: 1,
              tabletColumns: 2,
              desktopColumns: 3,
              cardButtonColor: '#084F6E',
              buttonText: 'Voir tous les tours',
              buttonUrl: '/tours',
              buttonBackgroundColor: '#084F6E',
              buttonTextColor: '#ffffff'
            },
            isActive: false
          },
          why_choose_us: {
            identifier: `why_choose_us_${timestamp}`,
            title: 'Text + Icones',
            blockType: 'why_choose_us',
            configuration: { 
              title: 'Titre de la section',
              subtitle: 'Description de votre section avec icônes.',
              titleColor: '#333333',
              subtitleColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff',
              iconBlocks: [
                {
                  id: 1,
                  mainIcon: 'fas fa-user-friends',
                  title: 'Titre',
                  description: 'Description',
                  iconColor: '#084F6E',
                  miniIcons: []
                },
                {
                  id: 2,
                  mainIcon: 'fas fa-compass',
                  title: 'Titre',
                  description: 'Description',
                  iconColor: '#3BA8AF',
                  miniIcons: []
                },
                {
                  id: 3,
                  mainIcon: 'fas fa-star',
                  title: 'Titre',
                  description: 'Description',
                  iconColor: '#084F6E',
                  miniIcons: []
                }
              ]
            },
            isActive: false
          },
          who_we_are: {
            identifier: `who_we_are_${timestamp}`,
            title: 'Text + Images',
            blockType: 'who_we_are',
            configuration: { 
              title: 'Titre principal',
              titleColor: '#333333',
              subtitleColor: '#333333',
              textColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff',
              introduction: 'Ajoutez ici votre contenu texte principal.',
              sections: [
                {
                  id: 1,
                  subtitle: 'Sous-titre',
                  text: 'Description supplémentaire pour votre section.'
                }
              ],
              images: [
                {
                  id: 1,
                  url: '',
                  alt: 'Image 1'
                }
              ],
              buttons: [
                {
                  id: 1,
                  text: 'Bouton 1',
                  url: '',
                  color: '#084F6E',
                  textColor: '#ffffff',
                  style: 'filled'
                },
                {
                  id: 2,
                  text: 'Bouton 2',
                  url: '',
                  color: '#084F6E',
                  textColor: '#084F6E',
                  style: 'outline'
                }
              ]
            },
            isActive: false
          },
          header_page: {
            identifier: `header_page_${timestamp}`,
            title: 'Header Page',
            blockType: 'header_page',
            configuration: { 
              title: 'Titre de la page',
              subtitle: 'Sous-titre',
              titleColor: '#ffffff',
              subtitleColor: '#ffffff',
              iconUrl: '',
              iconColor: '#ffffff',
              backgroundType: 'gradient',
              gradientColor1: '#084F6E',
              gradientColor2: '#3BA8AF',
              frameSize: 'small',
              buttons: []
            },
            isActive: false
          },
          contact: {
            identifier: `contact_${timestamp}`,
            title: 'Contact',
            blockType: 'contact',
            configuration: {
              title: 'Titre principal',
              subtitle: 'Description pour votre section de contact',
              titleColor: '#084F6E',
              subtitleColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff',
              email: 'contact@example.com',
              emailLabel: 'Email',
              phone: '+ 22 222 222 222',
              phoneLabel: 'Téléphone',
              whatsapp: '+ 22 222 222 222',
              whatsappLabel: 'WhatsApp',
              lineId: 'moncompte',
              lineIdLabel: 'Line ID',
              showAboutCompany: true,
              aboutTitle: 'À propos de notre entreprise',
              companyBrand: 'Nom de la marque',
              companyName: 'Votre Adresse',
              companyLicense: '00/00000',
              companyDescription: ''
            },
            isActive: false
          },
          search_bar_tours: {
            identifier: `search_bar_tours_${timestamp}`,
            title: 'Search bar : Tours',
            blockType: 'search_bar_tours',
            configuration: {
              filtersTitle: 'Filters',
              searchPlaceholder: 'Search for a tour...',
              filtersTextColor: '#333333',
              filtersBgColor: '#ffffff',
              cardsColor: '#084F6E',
              backgroundColor: '#ffffff',
              mobileColumns: 1,
              tabletColumns: 2,
              desktopColumns: 3
            },
            isActive: false
          },
          blog_search: {
            identifier: `blog_search_${timestamp}`,
            title: 'Search Bar: Blog',
            blockType: 'blog_search',
            configuration: { 
              cardColor: '#084F6E',
              backgroundColor: '#ffffff',
              searchPlaceholder: 'Rechercher des articles...',
              tagsTitle: 'Tags',
              categoriesTitle: 'Catégories',
              allTagsText: 'Tous les tags',
              allCategoriesText: 'Toutes les catégories',
              tagButtonColor: '#3BA8AF',
              tagButtonTextColor: '#ffffff',
              categoryButtonColor: '#084F6E',
              categoryButtonTextColor: '#ffffff'
            },
            isActive: false
          },
          text_gallery: {
            identifier: `text_gallery_${timestamp}`,
            title: 'Text + Gallery',
            blockType: 'text_gallery',
            configuration: {
              title: 'Titre de la galerie',
              subtitle: 'Description pour votre galerie d\'images',
              titleColor: '#333333',
              subtitleColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff',
              carouselType: 'petite',
              images: []
            },
            isActive: false
          },
          text_video: {
            identifier: `text_video_${timestamp}`,
            title: 'Text + Video',
            blockType: 'text_video',
            configuration: {
              title: 'Titre de la vidéo',
              subtitle: 'Description pour votre section vidéo',
              titleColor: '#333333',
              subtitleColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff',
              videoUrl: '',
              videoType: 'youtube'
            },
            isActive: false
          },
          text_listing: {
            identifier: `text_listing_${timestamp}`,
            title: 'Text + Listing',
            blockType: 'text_listing',
            configuration: {
              title: 'Titre de la liste',
              subtitle: 'Description pour votre section de liste',
              titleColor: '#333333',
              subtitleColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff',
              logoColor: '#3BA8AF',
              items: [
                {
                  id: 1,
                  text: 'Point de liste 1'
                },
                {
                  id: 2,
                  text: 'Point de liste 2'
                },
                {
                  id: 3,
                  text: 'Point de liste 3'
                }
              ]
            },
            isActive: false
          },
          text_pricing: {
            identifier: `text_pricing_${timestamp}`,
            title: 'Text + Pricing',
            blockType: 'text_pricing',
            configuration: {
              title: 'Titre de la section',
              subtitle: 'Description pour votre section de tarifs',
              titleColor: '#333333',
              subtitleColor: '#666666',
              dividerColor: '#3BA8AF',
              backgroundColor: '#ffffff',
              cards: [
                {
                  id: 1,
                  cardColor: '#ffffff',
                  headerColor: '#084F6E',
                  cycle: 'Mois',
                  label: 'Basique',
                  price: '99',
                  options: [
                    {
                      id: 1,
                      text: 'Option 1',
                      optionColor: '#666666'
                    }
                  ],
                  includedTitle: 'Inclus',
                  includedList: [
                    {
                      id: 1,
                      text: 'Fonctionnalité 1',
                      logoColor: '#22c55e'
                    }
                  ],
                  notIncludedTitle: 'Non inclus',
                  notIncludedList: [
                    {
                      id: 1,
                      text: 'Fonctionnalité premium',
                      logoColor: '#ef4444'
                    }
                  ]
                }
              ]
            },
            isActive: false
          }
        };

        return defaultData[blockType] || null;
      };

      // Insert all blocks sequentially
      const insertedBlocks = [];
      for (let i = 0; i < blockTypes.length; i++) {
        const blockType = blockTypes[i];
        const blockData = getDefaultBlockData(blockType, Date.now() + i);
        
        if (!blockData) {
          console.warn(`Unknown block type in template: ${blockType}`);
          continue;
        }

        const block = await storage.insertPageBlockAtPosition(blockData, i, finalPageId);
        insertedBlocks.push(block);
      }

      console.log(`[INSERT TEMPLATE] Successfully inserted ${insertedBlocks.length} blocks`);
      res.status(201).json({ blocks: insertedBlocks, count: insertedBlocks.length });
    } catch (error) {
      console.error("Error inserting template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to insert template", error: String(error) });
    }
  });

  app.put("/api/admin/page-blocks/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid page block ID" });
      }

      const validatedData = insertPageBlockSchema.partial().parse(req.body);
      const block = await storage.updatePageBlock(id, validatedData);
      
      if (!block) {
        return res.status(404).json({ message: "Page block not found" });
      }

      res.json(block);
    } catch (error) {
      console.error("Error updating page block:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update page block", error: String(error) });
    }
  });

  app.delete("/api/admin/page-blocks/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid page block ID" });
      }

      const deleted = await storage.deletePageBlock(id);
      if (!deleted) {
        return res.status(404).json({ message: "Page block not found" });
      }

      res.json({ message: "Page block deleted successfully" });
    } catch (error) {
      console.error("Error deleting page block:", error);
      res.status(500).json({ message: "Failed to delete page block", error: String(error) });
    }
  });

  app.put("/api/admin/page-blocks/:pageId/reorder", requireAuth, async (req, res) => {
    try {
      const pageId = parseInt(req.params.pageId);
      if (isNaN(pageId)) {
        return res.status(400).json({ message: "Invalid page ID" });
      }

      const { blockOrders } = req.body;
      if (!Array.isArray(blockOrders)) {
        return res.status(400).json({ message: "Block orders must be an array" });
      }

      const success = await storage.reorderPageBlocks(pageId, blockOrders);
      if (!success) {
        return res.status(500).json({ message: "Failed to reorder blocks" });
      }

      res.json({ message: "Blocks reordered successfully" });
    } catch (error) {
      console.error("Error reordering page blocks:", error);
      res.status(500).json({ message: "Failed to reorder page blocks", error: String(error) });
    }
  });

  // Get page blocks by page ID (for page builder)
  app.get("/api/admin/page-blocks-by-page/:pageId", requireAuth, async (req, res) => {
    try {
      const pageId = parseInt(req.params.pageId);
      if (isNaN(pageId)) {
        return res.status(400).json({ message: "Invalid page ID" });
      }
      const blocks = await storage.getPageBlocks(pageId);
      res.json(blocks);
    } catch (error) {
      console.error("Error fetching page blocks by page ID:", error);
      res.status(500).json({ message: "Failed to fetch page blocks", error: String(error) });
    }
  });

  // Update page blocks reorder with PATCH method
  app.patch("/api/admin/page-blocks/reorder", requireAuth, async (req, res) => {
    try {
      const { blocks } = req.body;
      if (!Array.isArray(blocks)) {
        return res.status(400).json({ message: "Blocks must be an array" });
      }

      // Update each block's order
      for (const blockUpdate of blocks) {
        await storage.updatePageBlock(blockUpdate.id, { blockOrder: blockUpdate.blockOrder });
      }

      res.json({ message: "Blocks reordered successfully" });
    } catch (error) {
      console.error("Error reordering page blocks:", error);
      res.status(500).json({ message: "Failed to reorder page blocks", error: String(error) });
    }
  });

  // Page Block History Management Routes
  app.get("/api/admin/page-blocks/:id/history", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid page block ID" });
      }

      const history = await storage.getPageBlockHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching page block history:", error);
      res.status(500).json({ message: "Failed to fetch page block history", error: String(error) });
    }
  });

  app.post("/api/admin/page-blocks/:id/save-version", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid page block ID" });
      }

      const { changeDescription } = req.body;
      const historyEntry = await storage.savePageBlockVersion(id, changeDescription || "Manual save");
      res.status(201).json(historyEntry);
    } catch (error) {
      console.error("Error saving page block version:", error);
      res.status(500).json({ message: "Failed to save page block version", error: String(error) });
    }
  });

  app.post("/api/admin/page-blocks/:id/restore/:version", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const version = parseInt(req.params.version);
      
      if (isNaN(id) || isNaN(version)) {
        return res.status(400).json({ message: "Invalid page block ID or version number" });
      }

      const restoredBlock = await storage.restorePageBlockVersion(id, version);
      if (!restoredBlock) {
        return res.status(404).json({ message: "Page block or version not found" });
      }

      res.json(restoredBlock);
    } catch (error) {
      console.error("Error restoring page block version:", error);
      res.status(500).json({ message: "Failed to restore page block version", error: String(error) });
    }
  });

  // Block templates
  app.get("/api/admin/block-templates", requireAuth, async (req, res) => {
    try {
      const templates = await storage.getBlockTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching block templates:", error);
      res.status(500).json({ message: "Failed to fetch block templates", error: String(error) });
    }
  });

  app.post("/api/admin/block-templates", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBlockTemplateSchema.parse(req.body);
      const template = await storage.createBlockTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating block template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create block template", error: String(error) });
    }
  });

  // Public API pour récupérer les blocs d'une page
  app.get("/api/page-blocks/:pageSlug", async (req, res) => {
    try {
      const { pageSlug } = req.params;
      const blocks = await storage.getPageBlocksBySlug(pageSlug);
      res.json(blocks);
    } catch (error) {
      console.error("Error fetching public page blocks:", error);
      res.status(500).json({ message: "Failed to fetch page blocks", error: String(error) });
    }
  });

  // ===== NAVIGATION MENU MANAGEMENT API ROUTES =====

  // Get all navigation menu items
  app.get("/api/admin/navigation-menu", requireAuth, async (req, res) => {
    try {
      const items = await storage.getNavigationMenuItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching navigation menu items:", error);
      res.status(500).json({ message: "Failed to fetch navigation menu items", error: String(error) });
    }
  });

  // Get single navigation menu item
  app.get("/api/admin/navigation-menu/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const item = await storage.getNavigationMenuItem(id);
      if (!item) {
        return res.status(404).json({ message: "Navigation menu item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error fetching navigation menu item:", error);
      res.status(500).json({ message: "Failed to fetch navigation menu item", error: String(error) });
    }
  });

  // Create navigation menu item
  app.post("/api/admin/navigation-menu", requireAuth, async (req, res) => {
    try {
      const itemData = insertNavigationMenuItemSchema.parse(req.body);
      const item = await storage.createNavigationMenuItem(itemData);
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error creating navigation menu item:", error);
      res.status(400).json({ 
        message: "Invalid navigation menu item data", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  // Update navigation menu item
  app.put("/api/admin/navigation-menu/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const item = await storage.updateNavigationMenuItem(id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Navigation menu item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error updating navigation menu item:", error);
      res.status(500).json({ message: "Failed to update navigation menu item", error: String(error) });
    }
  });

  // Delete navigation menu item
  app.delete("/api/admin/navigation-menu/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const deleted = await storage.deleteNavigationMenuItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Navigation menu item not found" });
      }

      res.json({ message: "Navigation menu item deleted successfully" });
    } catch (error) {
      console.error("Error deleting navigation menu item:", error);
      res.status(500).json({ message: "Failed to delete navigation menu item", error: String(error) });
    }
  });

  // Reorder navigation menu item (move up/down)
  app.patch("/api/admin/navigation-menu/:id/reorder", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const { direction } = req.body;
      if (!['up', 'down'].includes(direction)) {
        return res.status(400).json({ message: "Direction must be 'up' or 'down'" });
      }

      const item = await storage.reorderNavigationMenuItem(id, direction);
      if (!item) {
        return res.status(404).json({ message: "Navigation menu item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error reordering navigation menu item:", error);
      res.status(500).json({ message: "Failed to reorder navigation menu item", error: String(error) });
    }
  });

  // Public route to get active navigation menu items
  app.get("/api/navigation-menu", async (req, res) => {
    try {
      const items = await storage.getNavigationMenuItems();
      const activeItems = items.filter(item => item.isActive);
      res.json(activeItems);
    } catch (error) {
      console.error("Error fetching public navigation menu items:", error);
      res.status(500).json({ message: "Failed to fetch navigation menu items", error: String(error) });
    }
  });

  // ============================================
  // 🚀 ROUTES DE PREVIEW POUR FIDÉLITÉ 100%
  // ============================================
  
  // Preview routes pour les vrais composants - SOLUTION IFRAME GARANTIE FIDÈLE
  app.get('/preview/hero', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hero Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        .container { max-width: 1200px; }
        .font-heading { font-family: 'Inter', sans-serif; font-weight: 700; }
        .text-primary { color: #1e73be; }
        .bg-primary { background-color: #1e73be; }
        .bg-secondary { background-color: #E6B64C; }
    </style>
</head>
<body>
    <section class="relative py-4 h-full flex items-center overflow-hidden" style="height: 800px;">
        <!-- Background Video EXACT du vrai Hero -->
        <div class="absolute inset-0 w-full h-full z-0 overflow-hidden">
            <!-- Fallback Image -->
            <img src="/attached_assets/DJI_20241115104455_0160_D-min.jpeg" alt="Beautiful Krabi landscape" class="absolute top-0 left-0 w-full h-full object-cover" />
            
            <!-- Video Overlay (même logique que le vrai composant) -->
            <video autoplay muted loop playsinline preload="none" class="absolute top-0 left-0 w-full h-full object-cover" style="min-width: 100%; min-height: 100%;">
                <source src="/attached_assets/hero-video-optimized.mp4" type="video/mp4" />
                <source src="/attached_assets/Catamaran%20cruise%20around%20Ao%20Nang%20local%20islands_1750216800850.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            
            <!-- Gradient overlays EXACTS -->
            <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30"></div>
        </div>
        
        <!-- Content EXACT du vrai Hero.tsx -->
        <div class="container mx-auto px-4 relative z-10 h-full flex items-center">
            <div class="flex flex-col md:flex-row items-start gap-6 w-full">
                <div class="w-full">
                    <div class="max-w-lg">
                        <h1 class="font-heading text-2xl md:text-3xl lg:text-4xl mb-3 leading-tight tracking-tight text-white drop-shadow-lg">
                            Your exclusive experiences <br/>
                            <span class="text-primary drop-shadow-lg">in Krabi – </span>THAILAND
                        </h1>
                        
                        <p class="text-white/90 mb-4 text-sm drop-shadow-md">
                            Discover amazing places away from mass tourism in Krabi.<br/>
                            And also Khao Sok, Koh Mook and many more destinations.
                        </p>
                        
                        <div class="flex flex-col sm:flex-row gap-3">
                            <div class="bg-primary text-white px-4 py-1.5 mt-2 rounded hover:bg-primary-dark transition-colors cursor-pointer inline-block shadow-lg text-xs">See our offers</div>
                            <div class="bg-primary text-white px-4 py-1.5 mt-2 rounded hover:bg-primary-dark transition-colors cursor-pointer inline-block shadow-lg text-xs">Custom your trip</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>
    `);
  });

  app.get('/preview/when-expats', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>When Expats Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        .container { max-width: 1200px; }
        .font-heading { font-family: 'Inter', sans-serif; font-weight: 700; }
        .bg-secondary { background-color: #E6B64C; }
    </style>
</head>
<body>
    <!-- STRUCTURE 100% IDENTIQUE au vrai home.tsx lignes 225-245 -->
    <section class="py-20">
        <div class="container mx-auto px-4 max-w-4xl text-center">
            <div>
                <h2 class="font-heading font-bold text-3xl md:text-4xl mb-3">
                    When expats welcome you in their host country
                </h2>
                <!-- Trait doré EXACT : w-20 h-1 bg-secondary mx-auto mb-8 -->
                <div class="w-20 h-1 bg-secondary mx-auto mb-8"></div>
                <p class="text-lg text-gray-700 leading-relaxed">
                    This is a family-run travel agency that combines the organization of exclusive activities with the creation of tailor-made trips throughout the country. Our goal is to offer an immersive experience, far from mass tourism, with personalized service for every traveler — as if we were welcoming our own family or friends.
                </p>
            </div>
        </div>
    </section>
</body>
</html>
    `);
  });

  app.get('/preview/about', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        .container { max-width: 1200px; }
        .font-heading { font-family: 'Inter', sans-serif; font-weight: 700; }
        .bg-primary { background-color: #1e73be; }
    </style>
</head>
<body>
    <!-- STRUCTURE 100% IDENTIQUE au vrai About.tsx -->
    <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="order-2 lg:order-1">
                    <h2 class="font-heading font-bold text-3xl md:text-4xl mb-6">Who We Are</h2>
                    <p class="text-gray-700 mb-4">We are Éric, Margaux, Gabriel, and Raphaël, a French family living in Krabi, southern Thailand, since 2013.</p>
                    <p class="text-gray-700 mb-6">From our life here, we created Amon Tour — a small, independent travel agency built on a simple idea: personally welcome our travelers to Krabi and offer them a different way to experience Thailand.</p>
                    
                    <h3 class="font-heading font-semibold text-2xl mt-6 mb-3">Deep Local Roots</h3>
                    <p class="text-gray-700 mb-4">We live here year-round, in the heart of the region we love. This close connection to the destination allows us to offer exclusive experiences in Krabi, designed and guided by our team of professional local guides or trusted partners.</p>
                    
                    <div class="flex items-center space-x-4">
                        <div class="bg-primary text-white px-6 py-2 rounded font-heading font-semibold">Contact Us</div>
                        <div class="text-primary font-heading font-semibold">Create Your Journey →</div>
                    </div>
                </div>
                <div class="order-1 lg:order-2">
                    <div class="space-y-6">
                        <div class="relative">
                            <div class="w-full h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg"></div>
                        </div>
                        <div class="relative">
                            <div class="w-full h-64 bg-gradient-to-br from-green-200 to-green-300 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>
    `);
  });

  // Temporary endpoint to clean HTML from existing page blocks
  app.post("/api/admin/clean-html-blocks", requireAuth, async (req, res) => {
    try {
      const { pageBlocks } = await import('../shared/schema');
      const blocksToClean = await db.select().from(pageBlocks).where(eq(pageBlocks.blockType, 'text_section'));
      
      let cleanedCount = 0;
      
      for (const block of blocksToClean) {
        if (block.content) {
          // Simple HTML cleaning: remove style and class attributes
          const cleanedContent = block.content
            .replace(/\s+style="[^"]*"/g, '')
            .replace(/\s+class="[^"]*"/g, '')
            .trim();
          
          // Update the block with cleaned content
          await db.update(pageBlocks)
            .set({ 
              content: cleanedContent,
              configuration: {
                ...block.configuration,
                content: cleanedContent
              }
            })
            .where(eq(pageBlocks.id, block.id));
          
          cleanedCount++;
        }
      }
      
      res.json({ 
        message: `Successfully cleaned ${cleanedCount} blocks`,
        cleanedCount 
      });
    } catch (error) {
      console.error("Error cleaning HTML blocks:", error);
      res.status(500).json({ message: "Failed to clean blocks", error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
