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
  krabiCelebrationRequests,
  partnershipRequests,
  groupRequests,
  tourNinjaImageOverrides,
  siteSettings,
  contentBlocks,
  staticPages,
  mediaLibrary,
  pageConfigurations,
  pageBlocks,
  blockTemplates,
  navigationMenuItems,
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
  type KrabiCelebrationRequest,
  type InsertKrabiCelebrationRequest,
  type PartnershipRequest,
  type InsertPartnershipRequest,
  type GroupRequest,
  type InsertGroupRequest,
  type TourNinjaImageOverride,
  type InsertTourNinjaImageOverride,
  type SiteSetting,
  type InsertSiteSetting,
  type ContentBlock,
  type InsertContentBlock,
  type StaticPage,
  type InsertStaticPage,
  type MediaLibrary,
  type InsertMediaLibrary,
  type PageConfiguration,
  type InsertPageConfiguration,
  type PageBlock,
  type InsertPageBlock,
  type BlockTemplate,
  type InsertBlockTemplate,
  type NavigationMenuItem,
  type InsertNavigationMenuItem,
} from "@shared/schema";
import fs from "fs";
import path from "path";
import { db } from "./db";
import { eq, sql, and, or, like, desc, asc, ilike, count, isNull } from "drizzle-orm";

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
  getCustomTourRequests(filters?: { status?: string; search?: string; sort?: string }): Promise<CustomTourRequest[]>;
  getCustomTourRequest(id: number): Promise<CustomTourRequest | undefined>;
  updateCustomTourRequest(id: number, data: Partial<CustomTourRequest>): Promise<CustomTourRequest | undefined>;
  updateCustomTourRequestStatus(id: number, status: 'new' | 'in_progress' | 'archived'): Promise<CustomTourRequest | undefined>;
  deleteCustomTourRequest(id: number): Promise<boolean>;
  getNewCustomTourRequestsCount(): Promise<number>;
  
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
  
  // Krabi Celebration Requests operations
  createKrabiCelebrationRequest(request: InsertKrabiCelebrationRequest): Promise<KrabiCelebrationRequest>;
  getKrabiCelebrationRequests(filters?: { read?: boolean }): Promise<KrabiCelebrationRequest[]>;
  getKrabiCelebrationRequest(id: number): Promise<KrabiCelebrationRequest | undefined>;
  updateKrabiCelebrationRequest(id: number, data: Partial<KrabiCelebrationRequest>): Promise<KrabiCelebrationRequest | undefined>;
  deleteKrabiCelebrationRequest(id: number): Promise<boolean>;
  markKrabiCelebrationRequestAsRead(id: number): Promise<KrabiCelebrationRequest | undefined>;
  
  // Partnership Requests operations
  createPartnershipRequest(request: InsertPartnershipRequest): Promise<PartnershipRequest>;
  getPartnershipRequests(filters?: { read?: boolean }): Promise<PartnershipRequest[]>;
  getPartnershipRequest(id: number): Promise<PartnershipRequest | undefined>;
  updatePartnershipRequest(id: number, data: Partial<PartnershipRequest>): Promise<PartnershipRequest | undefined>;
  deletePartnershipRequest(id: number): Promise<boolean>;
  markPartnershipRequestAsRead(id: number): Promise<PartnershipRequest | undefined>;
  
  // Group Requests operations
  createGroupRequest(request: InsertGroupRequest): Promise<GroupRequest>;
  getGroupRequests(filters?: { read?: boolean }): Promise<GroupRequest[]>;
  getGroupRequest(id: number): Promise<GroupRequest | undefined>;
  updateGroupRequest(id: number, data: Partial<GroupRequest>): Promise<GroupRequest | undefined>;
  deleteGroupRequest(id: number): Promise<boolean>;
  markGroupRequestAsRead(id: number): Promise<GroupRequest | undefined>;
  
  // Tour Ninja Image Override operations
  createTourNinjaImageOverride(override: InsertTourNinjaImageOverride): Promise<TourNinjaImageOverride>;
  getTourNinjaImageOverrides(): Promise<TourNinjaImageOverride[]>;
  getTourNinjaImageOverride(id: number): Promise<TourNinjaImageOverride | undefined>;
  getTourNinjaImageOverrideByTourId(tourNinjaId: string): Promise<TourNinjaImageOverride | undefined>;
  updateTourNinjaImageOverride(id: number, data: Partial<InsertTourNinjaImageOverride>): Promise<TourNinjaImageOverride | undefined>;
  deleteTourNinjaImageOverride(id: number): Promise<boolean>;
  toggleTourNinjaImageOverride(id: number): Promise<TourNinjaImageOverride | undefined>;

  // Site Settings operations
  createSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  getSiteSettings(section?: string): Promise<SiteSetting[]>;
  getSiteSetting(section: string, key: string): Promise<SiteSetting | undefined>;
  updateSiteSetting(section: string, key: string, value: string): Promise<SiteSetting | undefined>;
  deleteSiteSetting(id: number): Promise<boolean>;

  // Content Blocks operations
  createContentBlock(block: InsertContentBlock): Promise<ContentBlock>;
  getContentBlocks(pageLocation?: string): Promise<ContentBlock[]>;
  getContentBlock(id: number): Promise<ContentBlock | undefined>;
  getContentBlockByIdentifier(identifier: string): Promise<ContentBlock | undefined>;
  updateContentBlock(id: number, data: Partial<InsertContentBlock>): Promise<ContentBlock | undefined>;
  deleteContentBlock(id: number): Promise<boolean>;
  toggleContentBlock(id: number): Promise<ContentBlock | undefined>;

  // Static Pages operations
  createStaticPage(page: InsertStaticPage): Promise<StaticPage>;
  getStaticPages(): Promise<StaticPage[]>;
  getStaticPage(id: number): Promise<StaticPage | undefined>;
  getStaticPageBySlug(slug: string): Promise<StaticPage | undefined>;
  updateStaticPage(id: number, data: Partial<InsertStaticPage>): Promise<StaticPage | undefined>;
  deleteStaticPage(id: number): Promise<boolean>;
  toggleStaticPagePublished(id: number): Promise<StaticPage | undefined>;

  // Media Library operations
  createMediaLibraryItem(item: InsertMediaLibrary): Promise<MediaLibrary>;
  getMediaLibraryItems(folder?: string): Promise<MediaLibrary[]>;
  getMediaLibraryItem(id: number): Promise<MediaLibrary | undefined>;
  updateMediaLibraryItem(id: number, data: Partial<InsertMediaLibrary>): Promise<MediaLibrary | undefined>;
  deleteMediaLibraryItem(id: number): Promise<boolean>;
  markMediaAsUsed(id: number, isUsed: boolean): Promise<MediaLibrary | undefined>;
  
  // Page Configuration operations
  getPageConfigurations(): Promise<PageConfiguration[]>;
  getPageConfiguration(slug: string): Promise<PageConfiguration | undefined>;
  createPageConfiguration(config: InsertPageConfiguration): Promise<PageConfiguration>;
  updatePageConfiguration(id: number, data: Partial<InsertPageConfiguration>): Promise<PageConfiguration | undefined>;
  
  // Page Blocks operations
  getPageBlocks(pageId: number): Promise<PageBlock[]>;
  getPageBlocksBySlug(pageSlug: string): Promise<PageBlock[]>;
  createPageBlock(block: InsertPageBlock): Promise<PageBlock>;
  updatePageBlock(id: number, data: Partial<InsertPageBlock>): Promise<PageBlock | undefined>;
  deletePageBlock(id: number): Promise<boolean>;
  reorderPageBlocks(pageId: number, blockOrders: { blockId: number; order: number }[]): Promise<boolean>;
  
  // Block Templates operations
  getBlockTemplates(): Promise<BlockTemplate[]>;
  getBlockTemplate(id: number): Promise<BlockTemplate | undefined>;
  createBlockTemplate(template: InsertBlockTemplate): Promise<BlockTemplate>;
  updateBlockTemplate(id: number, data: Partial<InsertBlockTemplate>): Promise<BlockTemplate | undefined>;
  deleteBlockTemplate(id: number): Promise<boolean>;
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
        interests: interests
      })
      .returning();
    return request;
  }
  
  async getCustomTourRequests(filters?: { status?: string; search?: string; sort?: string }): Promise<CustomTourRequest[]> {
    const whereConditions: any[] = [];
    
    if (filters?.status) {
      whereConditions.push(eq(customTourRequests.status, filters.status as any));
    }
    
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      whereConditions.push(
        or(
          like(customTourRequests.fullName, searchTerm),
          like(customTourRequests.email, searchTerm)
        )
      );
    }
    
    const baseQuery = db.select().from(customTourRequests);
    
    if (whereConditions.length > 0) {
      return baseQuery
        .where(and(...whereConditions))
        .orderBy(desc(customTourRequests.createdAt));
    }
    
    return baseQuery.orderBy(desc(customTourRequests.createdAt));
  }

  async getCustomTourRequest(id: number): Promise<CustomTourRequest | undefined> {
    const [request] = await db
      .select()
      .from(customTourRequests)
      .where(eq(customTourRequests.id, id));
    return request || undefined;
  }

  async updateCustomTourRequest(id: number, data: Partial<CustomTourRequest>): Promise<CustomTourRequest | undefined> {
    const [updatedRequest] = await db
      .update(customTourRequests)
      .set(data)
      .where(eq(customTourRequests.id, id))
      .returning();
    return updatedRequest || undefined;
  }

  async updateCustomTourRequestStatus(id: number, status: 'new' | 'in_progress' | 'archived'): Promise<CustomTourRequest | undefined> {
    const updateData: any = { status };
    if (status === 'archived') {
      updateData.archivedAt = new Date();
    }
    
    const [updatedRequest] = await db
      .update(customTourRequests)
      .set(updateData)
      .where(eq(customTourRequests.id, id))
      .returning();
    return updatedRequest || undefined;
  }

  async deleteCustomTourRequest(id: number): Promise<boolean> {
    await db.delete(customTourRequests).where(eq(customTourRequests.id, id));
    return true;
  }

  async getNewCustomTourRequestsCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customTourRequests)
      .where(eq(customTourRequests.status, 'new'));
    return Number(result.count);
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
      images: Array.isArray(tourCardData.images) ? tourCardData.images : [],
      tags: Array.isArray(tourCardData.tags) ? tourCardData.tags as string[] : []
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

  // Krabi Celebration Requests operations
  async createKrabiCelebrationRequest(request: InsertKrabiCelebrationRequest): Promise<KrabiCelebrationRequest> {
    const [created] = await db
      .insert(krabiCelebrationRequests)
      .values(request)
      .returning();
    return created;
  }

  async getKrabiCelebrationRequests(filters?: { read?: boolean }): Promise<KrabiCelebrationRequest[]> {
    if (filters?.read !== undefined) {
      return await db.select().from(krabiCelebrationRequests)
        .where(eq(krabiCelebrationRequests.read, filters.read))
        .orderBy(desc(krabiCelebrationRequests.createdAt));
    }
    
    return await db.select().from(krabiCelebrationRequests)
      .orderBy(desc(krabiCelebrationRequests.createdAt));
  }

  async getKrabiCelebrationRequest(id: number): Promise<KrabiCelebrationRequest | undefined> {
    const [request] = await db
      .select()
      .from(krabiCelebrationRequests)
      .where(eq(krabiCelebrationRequests.id, id));
    return request;
  }

  async updateKrabiCelebrationRequest(id: number, data: Partial<KrabiCelebrationRequest>): Promise<KrabiCelebrationRequest | undefined> {
    const [updated] = await db
      .update(krabiCelebrationRequests)
      .set(data)
      .where(eq(krabiCelebrationRequests.id, id))
      .returning();
    return updated;
  }

  async deleteKrabiCelebrationRequest(id: number): Promise<boolean> {
    try {
      await db
        .delete(krabiCelebrationRequests)
        .where(eq(krabiCelebrationRequests.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting krabi celebration request:", error);
      return false;
    }
  }

  async markKrabiCelebrationRequestAsRead(id: number): Promise<KrabiCelebrationRequest | undefined> {
    return this.updateKrabiCelebrationRequest(id, { read: true });
  }

  // Partnership Requests operations
  async createPartnershipRequest(request: InsertPartnershipRequest): Promise<PartnershipRequest> {
    const [created] = await db
      .insert(partnershipRequests)
      .values(request)
      .returning();
    return created;
  }

  async getPartnershipRequests(filters?: { read?: boolean }): Promise<PartnershipRequest[]> {
    if (filters?.read !== undefined) {
      return await db.select().from(partnershipRequests)
        .where(eq(partnershipRequests.read, filters.read))
        .orderBy(desc(partnershipRequests.createdAt));
    }
    
    return await db.select().from(partnershipRequests)
      .orderBy(desc(partnershipRequests.createdAt));
  }

  async getPartnershipRequest(id: number): Promise<PartnershipRequest | undefined> {
    const [request] = await db
      .select()
      .from(partnershipRequests)
      .where(eq(partnershipRequests.id, id));
    return request;
  }

  async updatePartnershipRequest(id: number, data: Partial<PartnershipRequest>): Promise<PartnershipRequest | undefined> {
    const [updated] = await db
      .update(partnershipRequests)
      .set(data)
      .where(eq(partnershipRequests.id, id))
      .returning();
    return updated;
  }

  async deletePartnershipRequest(id: number): Promise<boolean> {
    try {
      await db
        .delete(partnershipRequests)
        .where(eq(partnershipRequests.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting partnership request:", error);
      return false;
    }
  }

  async markPartnershipRequestAsRead(id: number): Promise<PartnershipRequest | undefined> {
    return this.updatePartnershipRequest(id, { read: true });
  }

  // Group Requests operations
  async createGroupRequest(request: InsertGroupRequest): Promise<GroupRequest> {
    const [created] = await db
      .insert(groupRequests)
      .values(request)
      .returning();
    return created;
  }

  async getGroupRequests(filters?: { read?: boolean }): Promise<GroupRequest[]> {
    if (filters?.read !== undefined) {
      return await db.select().from(groupRequests)
        .where(eq(groupRequests.read, filters.read))
        .orderBy(desc(groupRequests.createdAt));
    }
    
    return await db.select().from(groupRequests)
      .orderBy(desc(groupRequests.createdAt));
  }

  async getGroupRequest(id: number): Promise<GroupRequest | undefined> {
    const [request] = await db
      .select()
      .from(groupRequests)
      .where(eq(groupRequests.id, id));
    return request;
  }

  async updateGroupRequest(id: number, data: Partial<GroupRequest>): Promise<GroupRequest | undefined> {
    const [updated] = await db
      .update(groupRequests)
      .set(data)
      .where(eq(groupRequests.id, id))
      .returning();
    return updated;
  }

  async deleteGroupRequest(id: number): Promise<boolean> {
    try {
      await db
        .delete(groupRequests)
        .where(eq(groupRequests.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting group request:", error);
      return false;
    }
  }

  async markGroupRequestAsRead(id: number): Promise<GroupRequest | undefined> {
    return this.updateGroupRequest(id, { read: true });
  }

  // Tour Ninja Image Override operations
  async createTourNinjaImageOverride(override: InsertTourNinjaImageOverride): Promise<TourNinjaImageOverride> {
    const [created] = await db
      .insert(tourNinjaImageOverrides)
      .values({
        ...override,
        updatedAt: new Date()
      })
      .returning();
    return created;
  }

  async getTourNinjaImageOverrides(): Promise<TourNinjaImageOverride[]> {
    return db.select().from(tourNinjaImageOverrides).orderBy(desc(tourNinjaImageOverrides.createdAt));
  }

  async getTourNinjaImageOverride(id: number): Promise<TourNinjaImageOverride | undefined> {
    const [override] = await db
      .select()
      .from(tourNinjaImageOverrides)
      .where(eq(tourNinjaImageOverrides.id, id));
    return override || undefined;
  }

  async getTourNinjaImageOverrideByTourId(tourNinjaId: string): Promise<TourNinjaImageOverride | undefined> {
    const [override] = await db
      .select()
      .from(tourNinjaImageOverrides)
      .where(and(
        eq(tourNinjaImageOverrides.tourNinjaId, tourNinjaId),
        eq(tourNinjaImageOverrides.isActive, true)
      ));
    return override || undefined;
  }

  async updateTourNinjaImageOverride(id: number, data: Partial<InsertTourNinjaImageOverride>): Promise<TourNinjaImageOverride | undefined> {
    const [updated] = await db
      .update(tourNinjaImageOverrides)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(tourNinjaImageOverrides.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTourNinjaImageOverride(id: number): Promise<boolean> {
    const result = await db
      .delete(tourNinjaImageOverrides)
      .where(eq(tourNinjaImageOverrides.id, id))
      .returning({ id: tourNinjaImageOverrides.id });
    return result.length > 0;
  }

  async toggleTourNinjaImageOverride(id: number): Promise<TourNinjaImageOverride | undefined> {
    const current = await this.getTourNinjaImageOverride(id);
    if (!current) return undefined;
    
    const [updated] = await db
      .update(tourNinjaImageOverrides)
      .set({ 
        isActive: !current.isActive,
        updatedAt: new Date()
      })
      .where(eq(tourNinjaImageOverrides.id, id))
      .returning();
    return updated || undefined;
  }

  // Site Settings operations
  async createSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const [created] = await db
      .insert(siteSettings)
      .values({
        ...setting,
        updatedAt: new Date()
      })
      .returning();
    return created;
  }

  async getSiteSettings(section?: string): Promise<SiteSetting[]> {
    if (section) {
      return db.select().from(siteSettings).where(eq(siteSettings.section, section));
    }
    return db.select().from(siteSettings).orderBy(siteSettings.section, siteSettings.key);
  }

  async getSiteSetting(section: string, key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(and(
        eq(siteSettings.section, section),
        eq(siteSettings.key, key)
      ));
    return setting || undefined;
  }

  async updateSiteSetting(section: string, key: string, value: string): Promise<SiteSetting | undefined> {
    // Try to update first
    const [updated] = await db
      .update(siteSettings)
      .set({ 
        value,
        updatedAt: new Date()
      })
      .where(and(
        eq(siteSettings.section, section),
        eq(siteSettings.key, key)
      ))
      .returning();
    
    // If no update happened, create new setting
    if (!updated) {
      return this.createSiteSetting({
        section,
        key,
        value,
        type: 'text'
      });
    }
    
    return updated;
  }

  async deleteSiteSetting(id: number): Promise<boolean> {
    const result = await db
      .delete(siteSettings)
      .where(eq(siteSettings.id, id))
      .returning({ id: siteSettings.id });
    return result.length > 0;
  }

  // Content Blocks operations
  async createContentBlock(block: InsertContentBlock): Promise<ContentBlock> {
    const [created] = await db
      .insert(contentBlocks)
      .values({
        ...block,
        updatedAt: new Date()
      })
      .returning();
    return created;
  }

  async getContentBlocks(pageLocation?: string): Promise<ContentBlock[]> {
    if (pageLocation) {
      return db.select().from(contentBlocks)
        .where(eq(contentBlocks.pageLocation, pageLocation))
        .orderBy(contentBlocks.displayOrder, contentBlocks.id);
    }
    return db.select().from(contentBlocks).orderBy(contentBlocks.pageLocation, contentBlocks.displayOrder);
  }

  async getContentBlock(id: number): Promise<ContentBlock | undefined> {
    const [block] = await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.id, id));
    return block || undefined;
  }

  async getContentBlockByIdentifier(identifier: string): Promise<ContentBlock | undefined> {
    const [block] = await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.identifier, identifier));
    return block || undefined;
  }

  async updateContentBlock(id: number, data: Partial<InsertContentBlock>): Promise<ContentBlock | undefined> {
    const [updated] = await db
      .update(contentBlocks)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(contentBlocks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteContentBlock(id: number): Promise<boolean> {
    const result = await db
      .delete(contentBlocks)
      .where(eq(contentBlocks.id, id))
      .returning({ id: contentBlocks.id });
    return result.length > 0;
  }

  async toggleContentBlock(id: number): Promise<ContentBlock | undefined> {
    const current = await this.getContentBlock(id);
    if (!current) return undefined;
    
    const [updated] = await db
      .update(contentBlocks)
      .set({ 
        isActive: !current.isActive,
        updatedAt: new Date()
      })
      .where(eq(contentBlocks.id, id))
      .returning();
    return updated || undefined;
  }

  // Static Pages operations
  async createStaticPage(page: InsertStaticPage): Promise<StaticPage> {
    const [created] = await db
      .insert(staticPages)
      .values({
        ...page,
        updatedAt: new Date()
      })
      .returning();
    return created;
  }

  async getStaticPages(): Promise<StaticPage[]> {
    return db.select().from(staticPages).orderBy(staticPages.title);
  }

  async getStaticPage(id: number): Promise<StaticPage | undefined> {
    const [page] = await db
      .select()
      .from(staticPages)
      .where(eq(staticPages.id, id));
    return page || undefined;
  }

  async getStaticPageBySlug(slug: string): Promise<StaticPage | undefined> {
    const [page] = await db
      .select()
      .from(staticPages)
      .where(eq(staticPages.slug, slug));
    return page || undefined;
  }

  async updateStaticPage(id: number, data: Partial<InsertStaticPage>): Promise<StaticPage | undefined> {
    const [updated] = await db
      .update(staticPages)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(staticPages.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteStaticPage(id: number): Promise<boolean> {
    const result = await db
      .delete(staticPages)
      .where(eq(staticPages.id, id))
      .returning({ id: staticPages.id });
    return result.length > 0;
  }

  async toggleStaticPagePublished(id: number): Promise<StaticPage | undefined> {
    const current = await this.getStaticPage(id);
    if (!current) return undefined;
    
    const [updated] = await db
      .update(staticPages)
      .set({ 
        isPublished: !current.isPublished,
        updatedAt: new Date()
      })
      .where(eq(staticPages.id, id))
      .returning();
    return updated || undefined;
  }

  // Media Library operations
  async createMediaLibraryItem(item: InsertMediaLibrary): Promise<MediaLibrary> {
    const [created] = await db
      .insert(mediaLibrary)
      .values({
        ...item,
        updatedAt: new Date()
      })
      .returning();
    return created;
  }

  async getMediaLibraryItems(folder?: string): Promise<MediaLibrary[]> {
    if (folder) {
      return db.select().from(mediaLibrary)
        .where(eq(mediaLibrary.folder, folder))
        .orderBy(desc(mediaLibrary.createdAt));
    }
    return db.select().from(mediaLibrary).orderBy(desc(mediaLibrary.createdAt));
  }

  async getMediaLibraryItem(id: number): Promise<MediaLibrary | undefined> {
    const [item] = await db
      .select()
      .from(mediaLibrary)
      .where(eq(mediaLibrary.id, id));
    return item || undefined;
  }

  async updateMediaLibraryItem(id: number, data: Partial<InsertMediaLibrary>): Promise<MediaLibrary | undefined> {
    const [updated] = await db
      .update(mediaLibrary)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(mediaLibrary.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteMediaLibraryItem(id: number): Promise<boolean> {
    const result = await db
      .delete(mediaLibrary)
      .where(eq(mediaLibrary.id, id))
      .returning({ id: mediaLibrary.id });
    return result.length > 0;
  }

  async markMediaAsUsed(id: number, isUsed: boolean): Promise<MediaLibrary | undefined> {
    const [updated] = await db
      .update(mediaLibrary)
      .set({ 
        isUsed,
        updatedAt: new Date()
      })
      .where(eq(mediaLibrary.id, id))
      .returning();
    return updated || undefined;
  }

  // Page Configuration operations
  async getPageConfigurations(): Promise<PageConfiguration[]> {
    return db.select().from(pageConfigurations).orderBy(asc(pageConfigurations.pageType), asc(pageConfigurations.pageName));
  }

  async getPageConfiguration(slug: string): Promise<PageConfiguration | undefined> {
    const [config] = await db
      .select()
      .from(pageConfigurations)
      .where(eq(pageConfigurations.pageSlug, slug));
    return config || undefined;
  }

  async createPageConfiguration(config: InsertPageConfiguration): Promise<PageConfiguration> {
    const [created] = await db
      .insert(pageConfigurations)
      .values({
        ...config,
        updatedAt: new Date()
      })
      .returning();
    return created;
  }

  async updatePageConfiguration(id: number, data: Partial<InsertPageConfiguration>): Promise<PageConfiguration | undefined> {
    const [updated] = await db
      .update(pageConfigurations)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(pageConfigurations.id, id))
      .returning();
    return updated || undefined;
  }

  // Page Blocks operations
  async getPageBlocks(pageId: number): Promise<PageBlock[]> {
    return db.select()
      .from(pageBlocks)
      .where(and(eq(pageBlocks.pageId, pageId), eq(pageBlocks.isActive, true)))
      .orderBy(asc(pageBlocks.blockOrder));
  }

  async getPageBlocksBySlug(pageSlug: string): Promise<PageBlock[]> {
    const config = await this.getPageConfiguration(pageSlug);
    if (!config) return [];
    return this.getPageBlocks(config.id);
  }

  async createPageBlock(block: InsertPageBlock): Promise<PageBlock> {
    const [created] = await db
      .insert(pageBlocks)
      .values({
        ...block,
        updatedAt: new Date()
      })
      .returning();
    return created;
  }

  async updatePageBlock(id: number, data: Partial<InsertPageBlock>): Promise<PageBlock | undefined> {
    const [updated] = await db
      .update(pageBlocks)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(pageBlocks.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePageBlock(id: number): Promise<boolean> {
    const result = await db
      .delete(pageBlocks)
      .where(eq(pageBlocks.id, id))
      .returning({ id: pageBlocks.id });
    return result.length > 0;
  }

  async reorderPageBlocks(pageId: number, blockOrders: { blockId: number; order: number }[]): Promise<boolean> {
    try {
      await db.transaction(async (tx) => {
        for (const { blockId, order } of blockOrders) {
          await tx
            .update(pageBlocks)
            .set({ 
              blockOrder: order,
              updatedAt: new Date()
            })
            .where(and(eq(pageBlocks.id, blockId), eq(pageBlocks.pageId, pageId)));
        }
      });
      return true;
    } catch (error) {
      console.error('Error reordering page blocks:', error);
      return false;
    }
  }

  // Block Templates operations
  async getBlockTemplates(): Promise<BlockTemplate[]> {
    return db.select()
      .from(blockTemplates)
      .where(eq(blockTemplates.isActive, true))
      .orderBy(asc(blockTemplates.templateName));
  }

  async getBlockTemplate(id: number): Promise<BlockTemplate | undefined> {
    const [template] = await db
      .select()
      .from(blockTemplates)
      .where(eq(blockTemplates.id, id));
    return template || undefined;
  }

  async createBlockTemplate(template: InsertBlockTemplate): Promise<BlockTemplate> {
    const [created] = await db
      .insert(blockTemplates)
      .values(template)
      .returning();
    return created;
  }

  async updateBlockTemplate(id: number, data: Partial<InsertBlockTemplate>): Promise<BlockTemplate | undefined> {
    const [updated] = await db
      .update(blockTemplates)
      .set(data)
      .where(eq(blockTemplates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBlockTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(blockTemplates)
      .where(eq(blockTemplates.id, id))
      .returning({ id: blockTemplates.id });
    return result.length > 0;
  }

  // Navigation Menu Management
  async getNavigationMenuItems(): Promise<NavigationMenuItem[]> {
    return db.select()
      .from(navigationMenuItems)
      .orderBy(asc(navigationMenuItems.displayOrder), asc(navigationMenuItems.id));
  }

  async getNavigationMenuItem(id: number): Promise<NavigationMenuItem | undefined> {
    const [item] = await db.select()
      .from(navigationMenuItems)
      .where(eq(navigationMenuItems.id, id));
    return item || undefined;
  }

  async createNavigationMenuItem(data: InsertNavigationMenuItem): Promise<NavigationMenuItem> {
    const [item] = await db
      .insert(navigationMenuItems)
      .values(data)
      .returning();
    return item;
  }

  async updateNavigationMenuItem(id: number, data: Partial<InsertNavigationMenuItem>): Promise<NavigationMenuItem | undefined> {
    const [item] = await db
      .update(navigationMenuItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(navigationMenuItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteNavigationMenuItem(id: number): Promise<boolean> {
    const result = await db
      .delete(navigationMenuItems)
      .where(eq(navigationMenuItems.id, id))
      .returning({ id: navigationMenuItems.id });
    return result.length > 0;
  }

  async reorderNavigationMenuItem(id: number, direction: 'up' | 'down'): Promise<NavigationMenuItem | undefined> {
    // Get current item
    const currentItem = await this.getNavigationMenuItem(id);
    if (!currentItem) return undefined;

    // Get all items in same parent group
    const allItems = await db.select()
      .from(navigationMenuItems)
      .where(currentItem.parentId 
        ? eq(navigationMenuItems.parentId, currentItem.parentId) 
        : isNull(navigationMenuItems.parentId)
      )
      .orderBy(asc(navigationMenuItems.displayOrder));

    const currentIndex = allItems.findIndex(item => item.id === id);
    if (currentIndex === -1) return undefined;

    let targetIndex: number;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < allItems.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      return currentItem; // No move needed
    }

    const targetItem = allItems[targetIndex];
    
    // Swap display orders
    await db.transaction(async (tx) => {
      await tx.update(navigationMenuItems)
        .set({ displayOrder: targetItem.displayOrder, updatedAt: new Date() })
        .where(eq(navigationMenuItems.id, currentItem.id));
      
      await tx.update(navigationMenuItems)
        .set({ displayOrder: currentItem.displayOrder, updatedAt: new Date() })
        .where(eq(navigationMenuItems.id, targetItem.id));
    });

    return await this.getNavigationMenuItem(id);
  }
}

export const storage = new DatabaseStorage();
