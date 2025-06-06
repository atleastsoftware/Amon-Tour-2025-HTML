import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTourSchema, 
  insertCustomTourRequestSchema, 
  insertContactMessageSchema,
  insertTourAvailabilitySchema,
  insertReservationSchema,
  insertTourCardSchema
} from "@shared/schema";
import { createPaymentIntent, createOrRetrieveCustomer } from "./stripe";
import { upload, getPublicFileUrl } from "./upload";
import path from "path";
import session from "express-session";
import MemoryStore from "memorystore";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session store
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "senthang-siam-tour-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === "production", 
        maxAge: 86400000, // 24 hours
        httpOnly: true,   // Prevent client-side JS from reading the cookie
        sameSite: 'lax'   // CSRF protection
      },
      store: new SessionStore({ checkPeriod: 86400000 }), // 24 hours
    })
  );
  
  // Configure rate limiting for login attempts
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per windowMs
    message: { message: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.user) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
  
  // Authentication routes
  app.post("/api/login", loginLimiter, async (req, res) => {
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
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.session.user);
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

  // In-memory cache for Tour Ninja data (6 hours TTL)
  let tourCache = {
    data: null as any,
    timestamp: 0,
    TTL: 6 * 60 * 60 * 1000 // 6 hours in milliseconds
  };

  // Clear cache to force fresh data fetch with updated API URL and credentials
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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
      
      const response = await fetch(
        `https://www.tourninja.io/api/public/tours?apiKey=${apiKey}&companyId=${companyId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'AmonTour-Website/1.0'
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Tour Ninja API error: ${response.status} ${response.statusText}`);
      }

      const apiResponse = await response.json();
      
      // Extract tours data from the API response  
      let tours = [];
      if (apiResponse.success && Array.isArray(apiResponse.tours)) {
        tours = apiResponse.tours;
      } else if (Array.isArray(apiResponse.data)) {
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
      
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch tours from Tour Ninja", 
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
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
