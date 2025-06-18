import {
  users,
  tours,
  customTourRequests,
  contactMessages,
  tourAvailability,
  reservations,
  tourCards,
  blogCategories,
  blogTags,
  blogPosts,
  blogPostTags,
  newsletterSubscriptions,
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
  type TourCard,
  type InsertTourCard,
  type BlogCategory,
  type InsertBlogCategory,
  type BlogTag,
  type InsertBlogTag,
  type BlogPost,
  type InsertBlogPost,
  type BlogPostTag,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
} from "@shared/schema";
import fs from "fs";
import path from "path";
import { db } from "./db";
import { eq, sql, and, or, like, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<User | undefined>;
  
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
  
  // TourCard operations
  createTourCard(tourCard: InsertTourCard): Promise<TourCard>;
  getTourCards(): Promise<TourCard[]>;
  getTourCard(id: string): Promise<TourCard | undefined>;
  updateTourCard(id: string, data: Partial<InsertTourCard>): Promise<TourCard | undefined>;
  deleteTourCard(id: string): Promise<boolean>;
  
  // Blog category operations
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  getBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(id: number): Promise<BlogCategory | undefined>;
  updateBlogCategory(id: number, data: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined>;
  deleteBlogCategory(id: number): Promise<boolean>;
  
  // Blog tag operations
  createBlogTag(tag: InsertBlogTag): Promise<BlogTag>;
  getBlogTags(): Promise<BlogTag[]>;
  getBlogTag(id: number): Promise<BlogTag | undefined>;
  updateBlogTag(id: number, data: Partial<InsertBlogTag>): Promise<BlogTag | undefined>;
  deleteBlogTag(id: number): Promise<boolean>;
  
  // Blog post operations
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPosts(filters?: { status?: string; category?: string; tag?: string; search?: string }): Promise<(BlogPost & { category?: BlogCategory; tags?: BlogTag[] })[]>;
  getPublishedBlogPosts(filters?: { category?: string; tag?: string; search?: string }): Promise<(BlogPost & { category?: BlogCategory; tags?: BlogTag[] })[]>;
  getBlogPost(id: number): Promise<(BlogPost & { category?: BlogCategory; tags?: BlogTag[] }) | undefined>;
  getBlogPostBySlug(slug: string): Promise<(BlogPost & { category?: BlogCategory; tags?: BlogTag[] }) | undefined>;
  updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  getRelatedBlogPosts(postId: number, limit?: number): Promise<(BlogPost & { category?: BlogCategory })[]>;
  
  // Newsletter subscription operations
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  createNewsletterSubscriptionConfirmed(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getNewsletterSubscriptions(filters?: { confirmed?: boolean; unsubscribed?: boolean }): Promise<NewsletterSubscription[]>;
  getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined>;
  getNewsletterSubscriptionByToken(token: string): Promise<NewsletterSubscription | undefined>;
  updateNewsletterSubscription(id: number, data: Partial<NewsletterSubscription>): Promise<NewsletterSubscription | undefined>;
  confirmNewsletterSubscription(token: string): Promise<NewsletterSubscription | undefined>;
  unsubscribeNewsletter(email: string): Promise<boolean>;
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
  
  async updateUserPassword(id: number, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
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
          max: sql<number>`MAX(${tours.id})` 
        }).from(tours);
        
        const nextId = (Number(max) || 0) + 1;
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
        ...insertRequest,
        interests: interests as string[]
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
      const price = availability.price || (await this.getTour(data.tourId))?.price || 0;
      data.totalAmount = price * data.numberOfPeople;
    }
    
    // Ensure totalAmount is properly defined
    const totalAmount = data.totalAmount ?? 0;
    
    // Create the reservation with proper data structure
    const reservationData = {
      ...data,
      totalAmount,
    };
    
    const [reservation] = await db
      .insert(reservations)
      .values([reservationData])
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

  // TourCard operations
  async createTourCard(tourCardData: InsertTourCard): Promise<TourCard> {
    // Ensure images is a proper array
    const cardData = {
      ...tourCardData,
      images: Array.isArray(tourCardData.images) ? tourCardData.images : []
    };
    
    const [tourCard] = await db
      .insert(tourCards)
      .values(cardData)
      .returning();
    return tourCard;
  }

  async getTourCards(): Promise<TourCard[]> {
    return db
      .select()
      .from(tourCards)
      .orderBy(tourCards.createdAt);
  }

  async getTourCard(id: string): Promise<TourCard | undefined> {
    const [tourCard] = await db
      .select()
      .from(tourCards)
      .where(eq(tourCards.id, id));
    return tourCard;
  }

  async updateTourCard(id: string, data: Partial<InsertTourCard>): Promise<TourCard | undefined> {
    // Create a clean update object with only valid fields
    const updateData: Record<string, any> = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.customLink !== undefined) updateData.customLink = data.customLink;
    if (data.images !== undefined) updateData.images = data.images;
    
    const [updatedTourCard] = await db
      .update(tourCards)
      .set(updateData)
      .where(eq(tourCards.id, id))
      .returning();
    return updatedTourCard;
  }

  async deleteTourCard(id: string): Promise<boolean> {
    const [deletedTourCard] = await db
      .delete(tourCards)
      .where(eq(tourCards.id, id))
      .returning();
    return !!deletedTourCard;
  }

  // Blog Category Operations
  async createBlogCategory(categoryData: InsertBlogCategory): Promise<BlogCategory> {
    const slug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [category] = await db
      .insert(blogCategories)
      .values({ ...categoryData, slug })
      .returning();
    return category;
  }

  async getBlogCategories(): Promise<BlogCategory[]> {
    return db.select().from(blogCategories).orderBy(asc(blogCategories.name));
  }

  async getBlogCategory(id: number): Promise<BlogCategory | undefined> {
    const [category] = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id));
    return category;
  }

  async updateBlogCategory(id: number, data: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    const updateData: Record<string, any> = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    updateData.updatedAt = new Date();

    const [category] = await db
      .update(blogCategories)
      .set(updateData)
      .where(eq(blogCategories.id, id))
      .returning();
    return category;
  }

  async deleteBlogCategory(id: number): Promise<boolean> {
    const [deletedCategory] = await db
      .delete(blogCategories)
      .where(eq(blogCategories.id, id))
      .returning();
    return !!deletedCategory;
  }

  // Blog Tag Operations
  async createBlogTag(tagData: InsertBlogTag): Promise<BlogTag> {
    const slug = tagData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [tag] = await db
      .insert(blogTags)
      .values({ ...tagData, slug })
      .returning();
    return tag;
  }

  async getBlogTags(): Promise<BlogTag[]> {
    return db.select().from(blogTags).orderBy(asc(blogTags.name));
  }

  async getBlogTag(id: number): Promise<BlogTag | undefined> {
    const [tag] = await db
      .select()
      .from(blogTags)
      .where(eq(blogTags.id, id));
    return tag;
  }

  async updateBlogTag(id: number, data: Partial<InsertBlogTag>): Promise<BlogTag | undefined> {
    const updateData: Record<string, any> = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const [tag] = await db
      .update(blogTags)
      .set(updateData)
      .where(eq(blogTags.id, id))
      .returning();
    return tag;
  }

  async deleteBlogTag(id: number): Promise<boolean> {
    const [deletedTag] = await db
      .delete(blogTags)
      .where(eq(blogTags.id, id))
      .returning();
    return !!deletedTag;
  }

  // Blog Post Operations
  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const slug = postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { tagIds, ...insertData } = postData;
    
    const [post] = await db
      .insert(blogPosts)
      .values({ ...insertData, slug })
      .returning();

    // Handle tag associations
    if (tagIds && tagIds.length > 0) {
      const tagAssociations = tagIds.map(tagId => ({
        postId: post.id,
        tagId
      }));
      await db.insert(blogPostTags).values(tagAssociations);
    }

    return post;
  }

  async getBlogPosts(filters?: { status?: string; category?: string; tag?: string; search?: string }): Promise<(BlogPost & { category?: BlogCategory; tags?: BlogTag[] })[]> {
    let query = db
      .select({
        post: blogPosts,
        category: blogCategories,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id));

    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(blogPosts.status, filters.status as any));
    }
    
    if (filters?.category) {
      conditions.push(eq(blogCategories.slug, filters.category));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          like(blogPosts.title, `%${filters.search}%`),
          like(blogPosts.excerpt, `%${filters.search}%`),
          like(blogPosts.content, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.orderBy(desc(blogPosts.createdAt));

    // Get tags for each post
    const postsWithTags = await Promise.all(
      results.map(async (result) => {
        const tags = await db
          .select({ tag: blogTags })
          .from(blogPostTags)
          .leftJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
          .where(eq(blogPostTags.postId, result.post.id));

        return {
          ...result.post,
          category: result.category || undefined,
          tags: tags.map(t => t.tag).filter(Boolean) as BlogTag[]
        };
      })
    );

    return postsWithTags;
  }

  async getPublishedBlogPosts(filters?: { category?: string; tag?: string; search?: string }): Promise<(BlogPost & { category?: BlogCategory; tags?: BlogTag[] })[]> {
    return this.getBlogPosts({ ...filters, status: 'published' });
  }

  async getBlogPost(id: number): Promise<(BlogPost & { category?: BlogCategory; tags?: BlogTag[] }) | undefined> {
    const [result] = await db
      .select({
        post: blogPosts,
        category: blogCategories,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(eq(blogPosts.id, id));

    if (!result) return undefined;

    const tags = await db
      .select({ tag: blogTags })
      .from(blogPostTags)
      .leftJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, result.post.id));

    return {
      ...result.post,
      category: result.category || undefined,
      tags: tags.map(t => t.tag).filter((tag): tag is BlogTag => tag !== null)
    };
  }

  async getBlogPostBySlug(slug: string): Promise<(BlogPost & { category?: BlogCategory; tags?: BlogTag[] }) | undefined> {
    const [result] = await db
      .select({
        post: blogPosts,
        category: blogCategories,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(eq(blogPosts.slug, slug));

    if (!result) return undefined;

    const tags = await db
      .select({ tag: blogTags })
      .from(blogPostTags)
      .leftJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, result.post.id));

    return {
      ...result.post,
      category: result.category || undefined,
      tags: tags.map(t => t.tag).filter((tag): tag is BlogTag => tag !== null)
    };
  }

  async updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const { tagIds, ...updateData } = data;
    
    if (data.title) {
      (updateData as any).slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    (updateData as any).updatedAt = new Date();

    const [post] = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();

    // Update tag associations if provided
    if (tagIds !== undefined) {
      // Remove existing associations
      await db.delete(blogPostTags).where(eq(blogPostTags.postId, id));
      
      // Add new associations
      if (tagIds.length > 0) {
        const tagAssociations = tagIds.map(tagId => ({
          postId: id,
          tagId
        }));
        await db.insert(blogPostTags).values(tagAssociations);
      }
    }

    return post;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    // Delete tag associations first
    await db.delete(blogPostTags).where(eq(blogPostTags.postId, id));
    
    // Delete the post
    const [deletedPost] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    return !!deletedPost;
  }

  async getRelatedBlogPosts(postId: number, limit = 3): Promise<(BlogPost & { category?: BlogCategory })[]> {
    const currentPost = await this.getBlogPost(postId);
    if (!currentPost) return [];

    // Build where conditions
    const baseConditions = [
      eq(blogPosts.status, 'published'),
      sql`${blogPosts.id} != ${postId}`
    ];

    // Add category condition if available
    if (currentPost.categoryId) {
      baseConditions.push(eq(blogPosts.categoryId, currentPost.categoryId));
    }

    const results = await db
      .select({
        post: blogPosts,
        category: blogCategories,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(and(...baseConditions))
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit);

    return results.map(result => ({
      ...result.post,
      category: result.category || undefined
    }));
  }

  // Newsletter Subscription Operations
  async createNewsletterSubscription(subscriptionData: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    // Generate a unique confirmation token
    const confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values({ ...subscriptionData, confirmationToken })
      .returning();
    
    // In a real app, you would send a confirmation email here
    console.log(`Newsletter subscription created for ${subscription.email}. Confirmation token: ${confirmationToken}`);
    
    return subscription;
  }

  async createNewsletterSubscriptionConfirmed(subscriptionData: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values({ 
        ...subscriptionData, 
        confirmed: true,
        confirmationToken: null
      })
      .returning();
    
    console.log(`Newsletter subscription confirmed immediately for ${subscription.email}`);
    
    return subscription;
  }

  async getNewsletterSubscriptions(filters?: { confirmed?: boolean; unsubscribed?: boolean }): Promise<NewsletterSubscription[]> {
    let query = db.select().from(newsletterSubscriptions);
    
    const conditions = [];
    
    if (filters?.confirmed !== undefined) {
      conditions.push(eq(newsletterSubscriptions.confirmed, filters.confirmed));
    }
    
    if (filters?.unsubscribed !== undefined) {
      conditions.push(eq(newsletterSubscriptions.unsubscribed, filters.unsubscribed));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return query.orderBy(desc(newsletterSubscriptions.subscribedAt));
  }

  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));
    return subscription;
  }

  async getNewsletterSubscriptionByToken(token: string): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.confirmationToken, token));
    return subscription;
  }

  async updateNewsletterSubscription(id: number, data: Partial<NewsletterSubscription>): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db
      .update(newsletterSubscriptions)
      .set(data)
      .where(eq(newsletterSubscriptions.id, id))
      .returning();
    return subscription;
  }

  async confirmNewsletterSubscription(token: string): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db
      .update(newsletterSubscriptions)
      .set({ confirmed: true, confirmationToken: null })
      .where(eq(newsletterSubscriptions.confirmationToken, token))
      .returning();
    return subscription;
  }

  async unsubscribeNewsletter(email: string): Promise<boolean> {
    const [subscription] = await db
      .update(newsletterSubscriptions)
      .set({ unsubscribed: true })
      .where(eq(newsletterSubscriptions.email, email))
      .returning();
    return !!subscription;
  }
}

export const storage = new DatabaseStorage();
