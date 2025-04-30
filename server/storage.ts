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
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getTours(): Promise<Tour[]> {
    return db.select().from(tours);
  }
  
  async getTour(id: number): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour || undefined;
  }
  
  async createTour(insertTour: InsertTour): Promise<Tour> {
    try {
      const [tour] = await db
        .insert(tours)
        .values(insertTour)
        .returning();
      return tour;
    } catch (error: any) {
      // Check if it's a duplicate key error
      if (error.code === '23505' && error.constraint === 'tours_pkey') {
        console.log("Handling duplicate key error by using custom query");
        // Get the highest ID from the tours table and increment it
        const [{ max }] = await db.select({ 
          max: sql`MAX(${tours.id})` 
        }).from(tours);
        
        const nextId = (max || 0) + 1;
        console.log(`Next available ID: ${nextId}`);
        
        // Reset the sequence to the next available ID
        await db.execute(sql`SELECT setval('tours_id_seq', ${nextId}, false)`);
        
        // Try again with the sequence reset
        const [tour] = await db
          .insert(tours)
          .values(insertTour)
          .returning();
        return tour;
      }
      // If it's not a duplicate key error, rethrow
      throw error;
    }
  }
  
  async updateTour(id: number, tourData: Partial<InsertTour>): Promise<Tour | undefined> {
    const [updatedTour] = await db
      .update(tours)
      .set(tourData)
      .where(eq(tours.id, id))
      .returning();
    return updatedTour || undefined;
  }
  
  async deleteTour(id: number): Promise<boolean> {
    const result = await db.delete(tours).where(eq(tours.id, id));
    return true; // In PostgreSQL we don't get the count of affected rows directly
  }
  
  async getFeaturedTours(): Promise<Tour[]> {
    return db.select().from(tours).where(eq(tours.featured, true));
  }
  
  async createCustomTourRequest(insertRequest: InsertCustomTourRequest): Promise<CustomTourRequest> {
    // Ensure interests is always a string array
    const interests = Array.isArray(insertRequest.interests) 
      ? insertRequest.interests 
      : [];
    
    const [request] = await db
      .insert(customTourRequests)
      .values({
        name: insertRequest.name,
        email: insertRequest.email,
        travelers: insertRequest.travelers,
        duration: insertRequest.duration,
        interests: interests,
        message: insertRequest.message
      })
      .returning();
    return request;
  }
  
  async getCustomTourRequests(): Promise<CustomTourRequest[]> {
    return db.select().from(customTourRequests);
  }
  
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages);
  }
}

export const storage = new DatabaseStorage();
