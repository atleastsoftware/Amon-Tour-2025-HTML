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
      const staticPages = [
        { url: '/', changefreq: 'daily', priority: '1.0' },
        { url: '/tours', changefreq: 'weekly', priority: '0.9' },
        { url: '/experiences', changefreq: 'weekly', priority: '0.8' },
        { url: '/stays', changefreq: 'weekly', priority: '0.8' },
        { url: '/external-stays', changefreq: 'weekly', priority: '0.7' },
        { url: '/custom-tour', changefreq: 'monthly', priority: '0.7' },
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${'lastmod' in page ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
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

  // Clear cache to force fresh data fetch with legacy endpoint
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

  // Secure Tour Ninja API proxy route
  app.get("/api/proxy/tours", async (req, res) => {
    try {
      const apiKey = "tourninja-showcase-2-amontour";
      const companyId = "2";
      
      console.log("Tour Ninja API Call:", {
        apiKey,
        companyId,
        fullUrl: `https://www.tourninja.io/api/public/tours?apiKey=${apiKey}&companyId=${companyId}`
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

      // Check cache first
      const now = Date.now();
      if (tourCache.data && (now - tourCache.timestamp) < tourCache.TTL) {
        console.log("Returning cached Tour Ninja data");
        return res.json({
          success: true,
          data: tourCache.data,
          cached: true,
          timestamp: tourCache.timestamp
        });
      }

      console.log("Fetching fresh data from Tour Ninja API", {
        url: `https://www.tourninja.io/api/public/tours?apiKey=${apiKey}&companyId=${companyId}`,
        environment: process.env.NODE_ENV,
        hostname: req.hostname
      });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      // Simple fetch call as recommended
      const nodeFetch = (await import('node-fetch')).default;
      
      const response = await nodeFetch(
        `https://www.tourninja.io/api/public/tours?apiKey=${apiKey}&companyId=${companyId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        }
      );
      
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
        console.error("Failed to parse Tour Ninja response:", e);
        throw new Error("Invalid JSON response from Tour Ninja API");
      }
      
      // Extract and enhance tours data from the API response  
      let tours = [];
      
      // The API returns an object with tours array (August 2025 API structure)
      if (apiResponse.tours && Array.isArray(apiResponse.tours)) {
        tours = apiResponse.tours.map((tour: any) => ({
          id: tour.id,
          name: tour.name,
          description: tour.description || '',
          shortDescription: tour.description ? tour.description.substring(0, 150) + '...' : '',
          images: tour.image ? [tour.image] : [],
          primaryImage: tour.image || null,
          price: tour.price || 0,
          currency: tour.currency || 'THB',
          duration: tour.duration || 1,
          location: tour.location || 'Krabi, Thailand',
          bookingUrl: tour.bookingUrl || `https://www.tourninja.io/book/${tour.id}`,
          detailsUrl: tour.bookingUrl || `https://www.tourninja.io/book/${tour.id}`,
          externalId: tour.id,
          isActive: true,
          category: tour.type || '',
          tags: [],
          maxGuests: tour.maxParticipants || 0,
          minGuests: 1,
        }));
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
      
      // Update cache
      tourCache.data = tours;
      tourCache.timestamp = now;
      
      res.json({
        success: true,
        data: tours,
        cached: false,
        timestamp: now
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
      
      // Return empty array to prevent site from breaking
      console.log("Tour Ninja API unavailable, returning empty array");
      
      // Add a message about the API status
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isServerError = errorMessage.includes('500') || errorMessage.includes('Internal Server Error');
      
      res.json({ 
        success: true,
        data: [],
        cached: false,
        message: isServerError 
          ? "Tour Ninja service is temporarily down for maintenance" 
          : "Tour Ninja API temporarily unavailable", 
        apiStatus: isServerError ? "server_error" : "unavailable",
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  });

  // Cache management route (admin only)
  app.post("/api/proxy/tours/refresh", requireAuth, async (req, res) => {
    try {
      // Clear cache
      tourCache.data = null;
      tourCache.timestamp = 0;
      
      res.json({ 
        success: true, 
        message: "Tour cache cleared successfully" 
      });
    } catch (error) {
      console.error("Error clearing tour cache:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to clear cache", 
        error: String(error) 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
