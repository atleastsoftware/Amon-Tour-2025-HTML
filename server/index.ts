import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { db } from "./db";
import translateRoutes from "./api/translate";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";
import { migrateTours } from "./migration";
import bcrypt from "bcrypt";
import { globalElementTranslationService } from "./services/globalElementTranslationService";
import { translationFileService } from "./services/translationFileService";

// Function to initialize global element translations on first startup
async function initializeGlobalElementTranslations() {
  try {
    // Check if translations already exist
    const footerContactSection = await translationFileService.getSection('en', 'footer_contact_info');
    const alreadyInitialized = footerContactSection && Object.keys(footerContactSection).length > 0;
    
    if (alreadyInitialized) {
      log("Global element translations already initialized");
      return;
    }
    
    log("🔄 Initializing global element translations from dashboard data...");
    
    // Initialize Footer sections
    const footerSections = ['contact_info', 'useful_links', 'social_media', 'newsletter_config', 'copyright_config'];
    for (const subsection of footerSections) {
      const setting = await storage.getSiteSetting('footer', subsection);
      if (setting && setting.value) {
        log(`📝 Initializing footer.${subsection}...`);
        // Parse JSON value if it's a JSON string (starts with [ or {)
        let value = setting.value;
        if (typeof value === 'string' && (value.trim().startsWith('[') || value.trim().startsWith('{'))) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            log(`⚠️  Failed to parse JSON for footer.${subsection}`);
          }
        }
        await globalElementTranslationService.syncFooterTranslations(subsection, null, value);
      } else {
        log(`⚠️  No data found for footer.${subsection}`);
      }
    }
    
    // Initialize Navigation Menu items
    const menuItems = await storage.getNavigationMenuItems();
    for (const item of menuItems) {
      await globalElementTranslationService.syncNavigationMenuTranslations(item.id, null, item);
    }
    
    // Initialize Announcement Bar
    const notificationBar = await storage.getSiteSetting('theme', 'notification_bar');
    if (notificationBar && notificationBar.value) {
      const value = notificationBar.type === 'json' ? JSON.parse(notificationBar.value) : notificationBar.value;
      await globalElementTranslationService.syncAnnouncementBarTranslations(null, value);
    }
    
    // Initialize Pop-up
    const popup = await storage.getSiteSetting('theme', 'popup_settings');
    if (popup && popup.value) {
      const value = popup.type === 'json' ? JSON.parse(popup.value) : popup.value;
      await globalElementTranslationService.syncPopupTranslations(null, value);
    }
    
    log("✅ Global element translations initialized successfully");
  } catch (error) {
    log(`Error initializing global element translations: ${error}`);
    // Non-critical error, don't stop server startup
  }
}

// Function to ensure admin user exists
async function ensureAdminUser() {
  try {
    // Check if admin user exists
    const [existingAdmin] = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (!existingAdmin) {
      // Create admin user if it doesn't exist
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        if (app.get("env") === "production") {
          throw new Error("ADMIN_PASSWORD environment variable is required in production");
        } else {
          log("WARNING: No ADMIN_PASSWORD set. Using default password for development only.");
        }
      }
      
      log("Creating admin user");
      const passwordToUse = adminPassword || "ChangeThisPassword123!";
      const hashedPassword = await bcrypt.hash(passwordToUse, 10);
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
      });
      log("Admin user created successfully");
    } else {
      // Admin user already exists, don't update password automatically
      log("Admin user already exists, skipping password update");
    }
  } catch (error) {
    log(`Error ensuring admin user: ${error}`);
    throw error; // Re-throw to prevent app startup with insecure configuration
  }
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Trust proxy for Cloud Run deployment
if (app.get("env") === "production") {
  app.set('trust proxy', 1);
}

// Session configuration
const PgSession = connectPg(session);
// Validate required environment variables in production
if (app.get("env") === "production") {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required in production");
  }
}

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: app.get("env") === "production", // Secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files for uploaded images (persistent on Replit)
app.use('/uploads', express.static('uploads'));
app.use('/attached_assets', express.static('attached_assets'));
console.log('✅ Serving persistent images from /uploads/tours/');

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Register translation routes
  app.use(translateRoutes);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT environment variable for Cloud Run deployment, fallback to 5000 for local development
  // Cloud Run requires listening on the PORT environment variable
  const port = parseInt(process.env.PORT ?? "5000", 10);
  
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
    
    // Do initialization tasks AFTER the server starts listening
    // This ensures the port opens immediately for Cloud Run deployment
    (async () => {
      try {
        log("Starting initialization tasks...");
        
        // Ensure admin user exists in database
        await ensureAdminUser();
        
        // Migrate tours from JSON to database only in development
        // In production, the database should already be populated
        if (app.get("env") === "development") {
          await migrateTours();
        }
        
        // Initialize global element translations from dashboard data (one-time)
        await initializeGlobalElementTranslations();
        
        log("Initialization tasks completed successfully");
        
        // Pre-load Tour Ninja tours asynchronously AFTER server is ready
        // This prevents health check timeout during deployment
        setTimeout(async () => {
          log("Pre-loading Tour Ninja tours into cache (async)...");
          try {
            const nodeFetch = (await import('node-fetch')).default;
            const { tourCache } = await import('./tourCache');
            const apiKey = "tourninja-showcase-2-amontour";
            const companyId = "2";
            const url = `https://www.tourninja.io/api/public/tours?apiKey=${apiKey}&companyId=${companyId}&limit=100`;
            
            const response = await nodeFetch(url, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            });
            
            if (response.ok) {
              const text = await response.text();
              const data = JSON.parse(text);
              
              if (data.success && data.tours && data.tours.length > 0) {
                // Process and cache the tours data like the main route does
                const tours = data.tours.map((tour: any) => {
                  const hasImage = !!(tour.image || tour.primaryImage);
                  const cachedImage = tour.image || tour.primaryImage || null;
                  const imageUrl = hasImage ? `/api/image-proxy/${tour.id}/presentation` : null;
                  
                  return {
                    id: tour.id,
                    name: tour.name || tour.title,
                    description: tour.description || '',
                    shortDescription: tour.description ? tour.description.substring(0, 150) + '...' : '',
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
                    _serverCachedImage: cachedImage
                  };
                });
                
                // Populate the cache
                tourCache.data = tours;
                tourCache.timestamp = Date.now();
                log(`Tour Ninja cache pre-loaded with ${tours.length} tours`);
              }
            }
          } catch (error) {
            log(`Failed to pre-load Tour Ninja tours (non-critical): ${error}`);
            // This is not critical, the cache will be populated on first request
          }
        }, 1000); // Delay by 1 second to let health checks pass
      } catch (error) {
        log(`Error during initialization: ${error}`);
        
        // In production, critical configuration errors should stop the app
        if (app.get("env") === "production") {
          log("Critical initialization error in production. Shutting down.");
          process.exit(1);
        }
        // In development, allow the app to continue serving requests
      }
    })();
  });
})();
