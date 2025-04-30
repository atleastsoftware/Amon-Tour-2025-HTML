import {
  users,
  tours,
  customTourRequests,
  contactMessages,
  type User,
  type InsertUser,
  type Tour,
  type InsertTour,
  type CustomTourRequest,
  type InsertCustomTourRequest,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";
import fs from "fs";
import path from "path";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tour operations
  getTours(): Promise<Tour[]>;
  getTour(id: number): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: number, tour: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: number): Promise<boolean>;
  getFeaturedTours(): Promise<Tour[]>;
  
  // Custom tour request operations
  createCustomTourRequest(request: InsertCustomTourRequest): Promise<CustomTourRequest>;
  getCustomTourRequests(): Promise<CustomTourRequest[]>;
  
  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tours: Map<number, Tour>;
  private customTourRequests: Map<number, CustomTourRequest>;
  private contactMessages: Map<number, ContactMessage>;
  
  private userCurrentId: number;
  private tourCurrentId: number;
  private customTourRequestCurrentId: number;
  private contactMessageCurrentId: number;
  
  private readonly dataPath = path.join(process.cwd(), "data");
  private readonly toursPath = path.join(this.dataPath, "tours.json");
  
  constructor() {
    this.users = new Map();
    this.tours = new Map();
    this.customTourRequests = new Map();
    this.contactMessages = new Map();
    
    this.userCurrentId = 1;
    this.tourCurrentId = 1;
    this.customTourRequestCurrentId = 1;
    this.contactMessageCurrentId = 1;
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
    });
    
    // Load tours from file if exists
    this.loadToursFromFile();
  }
  
  private loadToursFromFile() {
    try {
      if (!fs.existsSync(this.dataPath)) {
        fs.mkdirSync(this.dataPath, { recursive: true });
      }
      
      if (fs.existsSync(this.toursPath)) {
        const data = fs.readFileSync(this.toursPath, 'utf8');
        const toursData = JSON.parse(data);
        
        if (Array.isArray(toursData) && toursData.length > 0) {
          toursData.forEach(tour => {
            this.tours.set(tour.id, tour);
            this.tourCurrentId = Math.max(this.tourCurrentId, tour.id + 1);
          });
        }
      }
    } catch (error) {
      console.error("Error loading tours:", error);
    }
  }
  
  private saveToursToFile() {
    try {
      const toursData = Array.from(this.tours.values());
      fs.writeFileSync(this.toursPath, JSON.stringify(toursData, null, 2), 'utf8');
    } catch (error) {
      console.error("Error saving tours:", error);
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Tour operations
  async getTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }
  
  async getTour(id: number): Promise<Tour | undefined> {
    return this.tours.get(id);
  }
  
  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = this.tourCurrentId++;
    const tour: Tour = { ...insertTour, id };
    this.tours.set(id, tour);
    this.saveToursToFile();
    return tour;
  }
  
  async updateTour(id: number, tourData: Partial<InsertTour>): Promise<Tour | undefined> {
    const existingTour = this.tours.get(id);
    if (!existingTour) return undefined;
    
    const updatedTour: Tour = { ...existingTour, ...tourData };
    this.tours.set(id, updatedTour);
    this.saveToursToFile();
    return updatedTour;
  }
  
  async deleteTour(id: number): Promise<boolean> {
    const result = this.tours.delete(id);
    if (result) {
      this.saveToursToFile();
    }
    return result;
  }
  
  async getFeaturedTours(): Promise<Tour[]> {
    return Array.from(this.tours.values()).filter(tour => tour.featured);
  }
  
  // Custom tour request operations
  async createCustomTourRequest(insertRequest: InsertCustomTourRequest): Promise<CustomTourRequest> {
    const id = this.customTourRequestCurrentId++;
    const request: CustomTourRequest = { 
      ...insertRequest, 
      id,
      createdAt: new Date()
    };
    this.customTourRequests.set(id, request);
    return request;
  }
  
  async getCustomTourRequests(): Promise<CustomTourRequest[]> {
    return Array.from(this.customTourRequests.values());
  }
  
  // Contact message operations
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageCurrentId++;
    const message: ContactMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date()
    };
    this.contactMessages.set(id, message);
    return message;
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
}

export const storage = new MemStorage();
