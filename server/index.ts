import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";
import { migrateTours } from "./migration";
import bcrypt from "bcrypt";

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
        
        log("Initialization tasks completed successfully");
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
