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
      log("Creating admin user");
      const hashedPassword = await bcrypt.hash("Amontour2025", 10);
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
      });
      log("Admin user created successfully - Username: admin, Password: Amontour2025");
    } else {
      // Update existing admin password to new secure password
      log("Updating admin user password to new secure password");
      const hashedPassword = await bcrypt.hash("Amontour2025", 10);
      await storage.updateUserPassword(existingAdmin.id, hashedPassword);
      log("Admin password updated successfully - Username: admin, Password: Amontour2025");
    }
  } catch (error) {
    log(`Error ensuring admin user: ${error}`);
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
const PgSession = connectPg(session);
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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
  // Ensure admin user exists in database
  await ensureAdminUser();
  
  // Migrate tours from JSON to database
  await migrateTours();
  
  // Seed authentic blocks for pages
  try {
    // Import locally to avoid dependency issues
    const { seedAuthenticBlocks } = await import('./seeds/authentic-blocks');
    await seedAuthenticBlocks();
  } catch (error) {
    log('Warning: Could not seed authentic blocks:', error);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
