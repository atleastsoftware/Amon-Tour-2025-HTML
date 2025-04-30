import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTourSchema, insertCustomTourRequestSchema, insertContactMessageSchema } from "@shared/schema";
import { upload, getPublicFileUrl } from "./upload";
import path from "path";
import session from "express-session";
import MemoryStore from "memorystore";
import { v4 as uuidv4 } from "uuid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session store
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "senthang-siam-tour-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 24 hours
      store: new SessionStore({ checkPeriod: 86400000 }), // 24 hours
    })
  );

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.user) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Authentication routes
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    req.session.user = { id: user.id, username: user.username };
    res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
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

  const httpServer = createServer(app);
  return httpServer;
}
