import {
  users,
  tours,
  customTourRequests,
  contactMessages,
  tourAvailability,
  reservations,
  type User,
  type InsertUser,
  type Tour,
  type InsertTour,
  type CustomTourRequest,
  type InsertCustomTourRequest,
  type ContactMessage,
  type InsertContactMessage,
  type TourAvailability,
  type InsertTourAvailability,
  type Reservation,
  type InsertReservation,
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
  
  // Tour availability operations
  createTourAvailability(availability: InsertTourAvailability): Promise<TourAvailability>;
  getTourAvailability(id: number): Promise<TourAvailability | undefined>;
  getTourAvailabilities(tourId: number): Promise<TourAvailability[]>;
  updateTourAvailability(id: number, data: Partial<InsertTourAvailability>): Promise<TourAvailability | undefined>;
  deleteTourAvailability(id: number): Promise<boolean>;
  getAvailabilitiesByDateRange(tourId: number, startDate: Date, endDate: Date): Promise<TourAvailability[]>;
  
  // Reservation operations
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  getReservation(id: number): Promise<Reservation | undefined>;
  getReservations(): Promise<Reservation[]>;
  getTourReservations(tourId: number): Promise<Reservation[]>;
  updateReservation(id: number, data: Partial<Reservation>): Promise<Reservation | undefined>;
  updateReservationStatus(id: number, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<Reservation | undefined>;
  updateReservationPayment(id: number, paymentIntentId: string, customerId: string): Promise<Reservation | undefined>;
  updateReservationWithOmise(id: number, chargeId: string): Promise<Reservation | undefined>;
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
  
  // Implémentation des méthodes de gestion des disponibilités
  async createTourAvailability(data: InsertTourAvailability): Promise<TourAvailability> {
    const [availability] = await db
      .insert(tourAvailability)
      .values(data)
      .returning();
    return availability;
  }

  async getTourAvailability(id: number): Promise<TourAvailability | undefined> {
    const [availability] = await db
      .select()
      .from(tourAvailability)
      .where(eq(tourAvailability.id, id));
    return availability || undefined;
  }

  async getTourAvailabilities(tourId: number): Promise<TourAvailability[]> {
    return db
      .select()
      .from(tourAvailability)
      .where(eq(tourAvailability.tourId, tourId));
  }

  async updateTourAvailability(id: number, data: Partial<InsertTourAvailability>): Promise<TourAvailability | undefined> {
    const [updatedAvailability] = await db
      .update(tourAvailability)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tourAvailability.id, id))
      .returning();
    return updatedAvailability || undefined;
  }

  async deleteTourAvailability(id: number): Promise<boolean> {
    await db.delete(tourAvailability).where(eq(tourAvailability.id, id));
    return true;
  }

  async getAvailabilitiesByDateRange(tourId: number, startDate: Date, endDate: Date): Promise<TourAvailability[]> {
    return db
      .select()
      .from(tourAvailability)
      .where(
        sql`${tourAvailability.tourId} = ${tourId} 
        AND ${tourAvailability.date} >= ${startDate} 
        AND ${tourAvailability.date} <= ${endDate}`
      );
  }

  // Implémentation des méthodes de gestion des réservations
  async createReservation(data: InsertReservation): Promise<Reservation> {
    // Get the availability to calculate total amount if not provided
    if (!data.totalAmount) {
      const availability = await this.getTourAvailability(data.availabilityId);
      if (!availability) {
        throw new Error("Tour availability not found");
      }
      
      // Use the price from availability or fallback to tour price
      const adultPrice = availability.price || (await this.getTour(data.tourId))?.price || 0;
      const childPrice = availability.childPrice || (await this.getTour(data.tourId))?.childPrice || adultPrice * 0.5; // 50% par défaut si non spécifié
      
      // Calculer le prix de base (adultes + enfants)
      const baseAdultAmount = adultPrice * (data.numberOfPeople - (data.numberOfChildren || 0));
      const baseChildAmount = childPrice * (data.numberOfChildren || 0);
      const baseAmount = baseAdultAmount + baseChildAmount;
      
      // Ajouter la taxe de 5% par personne
      const taxPerAdult = Math.round(adultPrice * 0.05);
      const taxPerChild = Math.round(childPrice * 0.05);
      const totalTax = (taxPerAdult * (data.numberOfPeople - (data.numberOfChildren || 0))) + 
                       (taxPerChild * (data.numberOfChildren || 0));
      
      // Montant total avec taxe
      data.totalAmount = baseAmount + totalTax;
    }
    
    // Create the reservation
    const [reservation] = await db
      .insert(reservations)
      .values(data)
      .returning();
      
    // Update the current bookings count for this availability
    if (reservation) {
      const availability = await this.getTourAvailability(data.availabilityId);
      if (availability) {
        await this.updateTourAvailability(
          data.availabilityId, 
          { currentBookings: availability.currentBookings + data.numberOfPeople }
        );
      }
    }
    
    return reservation;
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id));
    return reservation || undefined;
  }

  async getReservations(): Promise<Reservation[]> {
    return db.select().from(reservations);
  }

  async getTourReservations(tourId: number): Promise<Reservation[]> {
    return db
      .select()
      .from(reservations)
      .where(eq(reservations.tourId, tourId));
  }

  async updateReservation(id: number, data: Partial<Reservation>): Promise<Reservation | undefined> {
    const [updatedReservation] = await db
      .update(reservations)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(reservations.id, id))
      .returning();
    return updatedReservation || undefined;
  }

  async updateReservationStatus(id: number, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<Reservation | undefined> {
    return this.updateReservation(id, { status });
  }

  async updateReservationPayment(id: number, paymentIntentId: string, customerId: string): Promise<Reservation | undefined> {
    return this.updateReservation(id, { 
      stripePaymentIntentId: paymentIntentId, 
      stripeCustomerId: customerId,
      status: 'confirmed'
    });
  }
  
  async updateReservationWithOmise(id: number, chargeId: string): Promise<Reservation | undefined> {
    return this.updateReservation(id, { 
      omiseChargeId: chargeId, 
      status: 'confirmed'
    });
  }
}

export const storage = new DatabaseStorage();
