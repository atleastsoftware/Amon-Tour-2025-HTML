import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
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
  insertTourNinjaImageOverrideSchema,
  insertSiteSettingSchema,
  insertContentBlockSchema,
  insertStaticPageSchema,
  insertMediaLibrarySchema,
  insertPageConfigurationSchema,
  insertPageBlockSchema,
  insertBlockTemplateSchema,
  insertNavigationMenuItemSchema,
} from "@shared/schema";
import { createPaymentIntent, createOrRetrieveCustomer } from "./stripe";
import { upload, getPublicFileUrl } from "./upload";
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

  // In-memory cache for Tour Ninja data (6 hours TTL)
  let tourCache = {
    data: null as any,
    timestamp: 0,
    TTL: 6 * 60 * 60 * 1000 // 6 hours in milliseconds
  };

  // Clear cache to force fresh data fetch with presentation images
  tourCache.data = null;
  tourCache.timestamp = 0;

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

  // Image proxy for Tour Ninja images
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

  // Secure Tour Ninja API proxy route
  app.get("/api/proxy/tours", async (req, res) => {
    try {
      // Use working demo credentials until user gets valid API key
      const apiKey = "tourninja-showcase-2-amontour";
      const companyId = "2";
      
      console.log("Tour Ninja API Call:", {
        apiKey,
        companyId,
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

      // Force cache refresh to use correct API keys
      console.log("Forcing fresh data fetch to fix API key issue");
      tourCache.data = null;
      tourCache.timestamp = 0;

      // Try both API endpoints for maximum compatibility
      const useApiKey = process.env.TOUR_NINJA_API_KEY && process.env.TOUR_NINJA_COMPANY_ID;
      const primaryUrl = useApiKey 
        ? `https://www.tourninja.io/api/public/tours?apiKey=${apiKey}&companyId=${companyId}&limit=100`
        : `https://www.tourninja.io/api/public/tours/legacy?companyId=${companyId}`;
      const fallbackUrl = `https://www.tourninja.io/api/public/tours/legacy?companyId=${companyId}`;
      
      console.log("Fetching fresh data from Tour Ninja API", {
        url: primaryUrl,
        useApiKey,
        environment: process.env.NODE_ENV,
        hostname: req.hostname
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
      let tours = [];
      
      // The legacy API returns an object with tours array - structure confirmed by Tour Ninja agent
      if (apiResponse.success && apiResponse.tours && Array.isArray(apiResponse.tours)) {
        tours = apiResponse.tours.map((tour: any) => {
          // Build specific presentation image URL for each tour
          const presentationImageUrl = `https://www.tourninja.io/api/image-proxy/${tour.id}/presentation`;
          const fallbackImageUrl = tour.primaryImage;
          
          console.log(`Tour ${tour.name}: Trying presentation URL ${presentationImageUrl}`);
          
          return {
            id: tour.id,
            name: tour.name || tour.title,
            description: tour.description || '',
            shortDescription: tour.description ? tour.description.substring(0, 150) + '...' : '',
            images: tour.images || (tour.primaryImage ? [tour.primaryImage] : []),
            // Try presentation image first, fallback to original
            primaryImage: `/api/proxy/image?url=${encodeURIComponent(presentationImageUrl)}`,
            fallbackImage: fallbackImageUrl ? `/api/proxy/image?url=${encodeURIComponent(fallbackImageUrl)}` : null,
            presentationImageUrl: presentationImageUrl,
            originalPrimaryImage: tour.primaryImage,
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
          };
        });
      } else if (Array.isArray(apiResponse)) {
        // Legacy: Fallback if API returns array directly
        tours = apiResponse.map((tour: any) => ({
          ...tour,
          primaryImage: tour.image || (tour.images && tour.images[0]) || null,
          bookingUrl: tour.bookingUrl || `https://www.tourninja.io/book/${tour.id}`,
          detailsUrl: tour.bookingUrl || `https://www.tourninja.io/book/${tour.id}`,
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
      
      // Update cache
      tourCache.data = tours;
      tourCache.timestamp = Date.now();
      
      res.json({
        success: true,
        data: tours,
        cached: false,
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

  // Create new Tour Ninja image override
  app.post("/api/admin/tour-ninja-images", requireAuth, upload.single('image'), async (req, res) => {
    try {
      const { tourNinjaId, tourName, originalImageUrl } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const overrideData = insertTourNinjaImageOverrideSchema.parse({
        tourNinjaId,
        tourName,
        customImageUrl: getPublicFileUrl(req.file.filename),
        originalImageUrl: originalImageUrl || null
      });

      const override = await storage.createTourNinjaImageOverride(overrideData);
      res.status(201).json(override);
    } catch (error: any) {
      console.error("Error creating Tour Ninja image override:", error);
      res.status(400).json({ 
        message: "Failed to create image override", 
        error: error.errors || error.message || String(error) 
      });
    }
  });

  // Update Tour Ninja image override
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
      
      if (req.file) {
        updateData.customImageUrl = getPublicFileUrl(req.file.filename);
      }

      const updatedOverride = await storage.updateTourNinjaImageOverride(id, updateData);
      if (!updatedOverride) {
        return res.status(404).json({ message: "Image override not found" });
      }

      res.json(updatedOverride);
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

  // ===== SITE APPEARANCE API ROUTES =====

  // Site Settings routes
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
      const validatedData = insertPageConfigurationSchema.parse(req.body);
      const config = await storage.createPageConfiguration(validatedData);
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

  // Page blocks
  app.get("/api/admin/page-blocks/:pageSlug", requireAuth, async (req, res) => {
    try {
      const { pageSlug } = req.params;
      const blocks = await storage.getPageBlocksBySlug(pageSlug);
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

  const httpServer = createServer(app);
  return httpServer;
}
