import { 
  songs, contacts, deals, pitches, payments, templates, emailTemplates, attachments, calendarEvents,
  playlists, playlistSongs, savedSearches, workflowAutomation, clientProfiles, analyticsEvents,
  type Song, type InsertSong, type Contact, type InsertContact,
  type Deal, type InsertDeal, type Pitch, type InsertPitch,
  type Payment, type InsertPayment, type Template, type InsertTemplate,
  type EmailTemplate, type InsertEmailTemplate, type Attachment, type InsertAttachment,
  type CalendarEvent, type InsertCalendarEvent,
  type Playlist, type InsertPlaylist, type PlaylistSong, type InsertPlaylistSong,
  type SavedSearch, type InsertSavedSearch, type WorkflowAutomation, type InsertWorkflowAutomation,
  type ClientProfile, type InsertClientProfile, type AnalyticsEvent, type InsertAnalyticsEvent,
  type DealWithRelations, type DashboardMetrics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, count, sum, and, or, gte, lte, like } from "drizzle-orm";

export interface IStorage {
  // Songs
  getSongs(search?: string, genre?: string, limit?: number): Promise<Song[]>;
  getSong(id: number): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: number, song: Partial<InsertSong>): Promise<Song>;
  deleteSong(id: number): Promise<void>;

  // Contacts
  getContacts(search?: string, limit?: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Deals
  getDeals(status?: string, limit?: number): Promise<DealWithRelations[]>;
  getDeal(id: number): Promise<DealWithRelations | undefined>;
  createDeal(deal: any): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal>;
  deleteDeal(id: number): Promise<void>;

  // Pitches
  getPitches(dealId?: number, limit?: number): Promise<Pitch[]>;
  getPitch(id: number): Promise<Pitch | undefined>;
  createPitch(pitch: InsertPitch): Promise<Pitch>;
  updatePitch(id: number, pitch: Partial<InsertPitch>): Promise<Pitch>;
  deletePitch(id: number): Promise<void>;

  // Payments
  getPayments(status?: string, limit?: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment>;
  deletePayment(id: number): Promise<void>;

  // Templates
  getTemplates(type?: string): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template>;
  deleteTemplate(id: number): Promise<void>;

  // Email Templates
  getEmailTemplates(stage?: string): Promise<EmailTemplate[]>;
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: number): Promise<void>;

  // Attachments
  getAttachments(entityType?: string, entityId?: number): Promise<Attachment[]>;
  getAttachment(id: number): Promise<Attachment | undefined>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: number): Promise<void>;

  // Calendar Events
  getCalendarEvents(entityType?: string, entityId?: number, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]>;
  getCalendarEvent(id: number): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: number): Promise<void>;

  // Dashboard
  getDashboardMetrics(): Promise<DashboardMetrics>;

  // Playlists
  getPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist>;
  deletePlaylist(id: number): Promise<void>;

  // Playlist Songs
  getPlaylistSongs(playlistId: number): Promise<PlaylistSong[]>;
  addSongToPlaylist(playlistSong: InsertPlaylistSong): Promise<PlaylistSong>;
  removeSongFromPlaylist(playlistId: number, songId: number): Promise<void>;

  // Saved Searches
  getSavedSearches(): Promise<SavedSearch[]>;
  getSavedSearch(id: number): Promise<SavedSearch | undefined>;
  createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch>;
  deleteSavedSearch(id: number): Promise<void>;

  // Workflow Automation
  getWorkflowAutomations(): Promise<WorkflowAutomation[]>;
  getWorkflowAutomation(id: number): Promise<WorkflowAutomation | undefined>;
  createWorkflowAutomation(automation: InsertWorkflowAutomation): Promise<WorkflowAutomation>;
  updateWorkflowAutomation(id: number, automation: Partial<InsertWorkflowAutomation>): Promise<WorkflowAutomation>;
  deleteWorkflowAutomation(id: number): Promise<void>;

  // Client Profiles
  getClientProfiles(): Promise<ClientProfile[]>;
  getClientProfile(id: number): Promise<ClientProfile | undefined>;
  createClientProfile(profile: InsertClientProfile): Promise<ClientProfile>;
  updateClientProfile(id: number, profile: Partial<InsertClientProfile>): Promise<ClientProfile>;
  deleteClientProfile(id: number): Promise<void>;

  // Analytics Events
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;

  // Advanced Analytics
  getRevenueAnalytics(timeRange: string, startDate?: Date, endDate?: Date): Promise<any>;
  getDealPerformanceAnalytics(timeRange: string, startDate?: Date, endDate?: Date): Promise<any>;
  getMusicCatalogAnalytics(timeRange: string, startDate?: Date, endDate?: Date): Promise<any>;
  getFinancialForecastAnalytics(timeRange: string): Promise<any>;
  getComprehensiveAnalytics(timeRange: string, startDate?: Date, endDate?: Date): Promise<any>;

  // Contact extraction from deals
  extractContactsFromDeal(dealData: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Songs
  async getSongs(search?: string, genre?: string, limit = 50): Promise<Song[]> {
    let query = db.select().from(songs);
    
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(songs.title, `%${search}%`),
          like(songs.artist, `%${search}%`),
          like(songs.album, `%${search}%`)
        )
      );
    }
    if (genre) {
      conditions.push(eq(songs.genre, genre));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(songs.createdAt)).limit(limit);
  }

  async getSong(id: number): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song || undefined;
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [created] = await db.insert(songs).values([song] as any).returning();
    return created;
  }

  async updateSong(id: number, song: Partial<InsertSong>): Promise<Song> {
    // Handle decimal fields properly
    const updateData: any = {
      ...song,
      updatedAt: new Date()
    };
    
    // Convert number values to strings for decimal fields if needed
    if (updateData.publishingOwnership !== undefined) {
      updateData.publishingOwnership = updateData.publishingOwnership?.toString();
    }
    if (updateData.masterOwnership !== undefined) {
      updateData.masterOwnership = updateData.masterOwnership?.toString();
    }
    
    const [updated] = await db
      .update(songs)
      .set(updateData)
      .where(eq(songs.id, id))
      .returning();
    return updated;
  }

  async deleteSong(id: number): Promise<void> {
    await db.delete(songs).where(eq(songs.id, id));
  }

  // Contacts
  async getContacts(search?: string, limit = 50): Promise<Contact[]> {
    let query = db.select().from(contacts);
    
    if (search) {
      query = query.where(
        or(
          like(contacts.name, `%${search}%`),
          like(contacts.email, `%${search}%`),
          like(contacts.company, `%${search}%`)
        )
      ) as any;
    }
    
    return await query.orderBy(asc(contacts.name)).limit(limit);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [created] = await db.insert(contacts).values(contact).returning();
    return created;
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact> {
    const [updated] = await db
      .update(contacts)
      .set({ ...contact, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return updated;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Deals
  async getDeals(status?: string, limit = 50): Promise<DealWithRelations[]> {
    let query = db
      .select()
      .from(deals)
      .leftJoin(songs, eq(deals.songId, songs.id))
      .leftJoin(contacts, eq(deals.contactId, contacts.id))
      .leftJoin(pitches, eq(deals.id, pitches.dealId))
      .leftJoin(payments, eq(deals.id, payments.dealId));
    
    if (status) {
      query = query.where(eq(deals.status, status)) as any;
    }
    
    const results = await query.orderBy(desc(deals.createdAt)).limit(limit);
    
    // Transform the results to match DealWithRelations type
    const dealsMap = new Map<number, DealWithRelations>();
    
    results.forEach((row) => {
      const deal = row.deals;
      const song = row.songs;
      const contact = row.contacts;
      const pitch = row.pitches;
      const payment = row.payments;
      
      if (!dealsMap.has(deal.id)) {
        dealsMap.set(deal.id, {
          ...deal,
          song: song!,
          contact: contact!,
          pitches: [],
          payments: []
        });
      }
      
      const dealWithRelations = dealsMap.get(deal.id)!;
      
      if (pitch && !dealWithRelations.pitches.some(p => p.id === pitch.id)) {
        dealWithRelations.pitches.push(pitch);
      }
      
      if (payment && !dealWithRelations.payments.some(p => p.id === payment.id)) {
        dealWithRelations.payments.push(payment);
      }
    });
    
    return Array.from(dealsMap.values());
  }

  async getDeal(id: number): Promise<DealWithRelations | undefined> {
    const results = await db
      .select()
      .from(deals)
      .leftJoin(songs, eq(deals.songId, songs.id))
      .leftJoin(contacts, eq(deals.contactId, contacts.id))
      .leftJoin(pitches, eq(deals.id, pitches.dealId))
      .leftJoin(payments, eq(deals.id, payments.dealId))
      .where(eq(deals.id, id));
    
    if (results.length === 0) return undefined;
    
    const deal = results[0].deals;
    const song = results[0].songs;
    const contact = results[0].contacts;
    
    const pitchesData = results.filter(r => r.pitches).map(r => r.pitches!);
    const paymentsData = results.filter(r => r.payments).map(r => r.payments!);
    
    return {
      ...deal,
      song: song!,
      contact: contact!,
      pitches: pitchesData,
      payments: paymentsData
    };
  }

  async createDeal(deal: any): Promise<Deal> {
    try {
      // Auto-populate status change dates based on current status
      const now = new Date();
      const processedDeal = { ...deal };
      
      if (deal.status === 'pitched' && !deal.pitchedDate) {
        processedDeal.pitchedDate = now;
      } else if (deal.status === 'pending_approval' && !deal.pendingApprovalDate) {
        processedDeal.pendingApprovalDate = now;
      } else if (deal.status === 'quoted' && !deal.quotedDate) {
        processedDeal.quotedDate = now;
      } else if (deal.status === 'use_confirmed' && !deal.useConfirmedDate) {
        processedDeal.useConfirmedDate = now;
      } else if (deal.status === 'being_drafted' && !deal.beingDraftedDate) {
        processedDeal.beingDraftedDate = now;
      } else if (deal.status === 'out_for_signature' && !deal.outForSignatureDate) {
        processedDeal.outForSignatureDate = now;
      } else if (deal.status === 'payment_received' && !deal.paymentReceivedDate) {
        processedDeal.paymentReceivedDate = now;
      } else if (deal.status === 'completed' && !deal.completedDate) {
        processedDeal.completedDate = now;
      }
      
      // Extract contacts from deal data before creating the deal
      await this.extractContactsFromDeal(processedDeal);
      
      const [created] = await db.insert(deals).values(processedDeal).returning();
      return created;
    } catch (error) {
      console.error("Database error in createDeal:", error);
      throw error;
    }
  }

  async updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal> {
    // Convert ISO string dates to Date objects for database storage
    const processedDeal = {
      ...deal,
      // Status dates - convert from ISO strings to Date objects
      pitchedDate: deal.pitchedDate ? new Date(deal.pitchedDate) : deal.pitchedDate,
      pendingApprovalDate: deal.pendingApprovalDate ? new Date(deal.pendingApprovalDate) : deal.pendingApprovalDate,
      quotedDate: deal.quotedDate ? new Date(deal.quotedDate) : deal.quotedDate,
      useConfirmedDate: deal.useConfirmedDate ? new Date(deal.useConfirmedDate) : deal.useConfirmedDate,
      beingDraftedDate: deal.beingDraftedDate ? new Date(deal.beingDraftedDate) : deal.beingDraftedDate,
      outForSignatureDate: deal.outForSignatureDate ? new Date(deal.outForSignatureDate) : deal.outForSignatureDate,
      paymentReceivedDate: deal.paymentReceivedDate ? new Date(deal.paymentReceivedDate) : deal.paymentReceivedDate,
      completedDate: deal.completedDate ? new Date(deal.completedDate) : deal.completedDate,
      // Other dates
      airDate: deal.airDate ? new Date(deal.airDate) : deal.airDate,
      pitchDate: deal.pitchDate ? new Date(deal.pitchDate) : deal.pitchDate,
      updatedAt: new Date()
    };

    // Extract contacts from deal data when updating
    await this.extractContactsFromDeal(processedDeal);

    // Remove undefined values and ensure proper types
    const cleanedDeal: any = {};
    Object.keys(processedDeal).forEach(key => {
      const value = (processedDeal as any)[key];
      if (value !== undefined) {
        cleanedDeal[key] = value;
      }
    });
    
    const [updated] = await db
      .update(deals)
      .set(cleanedDeal)
      .where(eq(deals.id, id))
      .returning();
    return updated;
  }

  async deleteDeal(id: number): Promise<void> {
    await db.delete(deals).where(eq(deals.id, id));
  }

  // Pitches
  async getPitches(dealId?: number, limit = 50): Promise<Pitch[]> {
    let query = db.select().from(pitches);
    
    if (dealId) {
      query = query.where(eq(pitches.dealId, dealId)) as any;
    }
    
    return await query.orderBy(desc(pitches.createdAt)).limit(limit);
  }

  async getPitch(id: number): Promise<Pitch | undefined> {
    const [pitch] = await db.select().from(pitches).where(eq(pitches.id, id));
    return pitch || undefined;
  }

  async createPitch(pitch: InsertPitch): Promise<Pitch> {
    const [created] = await db.insert(pitches).values(pitch).returning();
    return created;
  }

  async updatePitch(id: number, pitch: Partial<InsertPitch>): Promise<Pitch> {
    const [updated] = await db
      .update(pitches)
      .set({ ...pitch, updatedAt: new Date() })
      .where(eq(pitches.id, id))
      .returning();
    return updated;
  }

  async deletePitch(id: number): Promise<void> {
    await db.delete(pitches).where(eq(pitches.id, id));
  }

  // Payments
  async getPayments(status?: string, limit = 50): Promise<Payment[]> {
    let query = db.select().from(payments);
    
    if (status) {
      query = query.where(eq(payments.status, status)) as any;
    }
    
    return await query.orderBy(desc(payments.createdAt)).limit(limit);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment> {
    const [updated] = await db
      .update(payments)
      .set({ ...payment, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  async deletePayment(id: number): Promise<void> {
    await db.delete(payments).where(eq(payments.id, id));
  }

  // Templates
  async getTemplates(type?: string): Promise<Template[]> {
    let query = db.select().from(templates);
    
    if (type) {
      query = query.where(eq(templates.type, type)) as any;
    }
    
    return await query.orderBy(asc(templates.name));
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [created] = await db.insert(templates).values(template).returning();
    return created;
  }

  async updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template> {
    const [updated] = await db
      .update(templates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return updated;
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  // Email Templates
  async getEmailTemplates(stage?: string): Promise<EmailTemplate[]> {
    let query = db.select().from(emailTemplates);
    
    if (stage) {
      query = query.where(eq(emailTemplates.stage, stage)) as any;
    }
    
    return await query.orderBy(asc(emailTemplates.name));
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template || undefined;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db.insert(emailTemplates).values(template).returning();
    return newTemplate;
  }

  async updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    const [updatedTemplate] = await db.update(emailTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteEmailTemplate(id: number): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  // Attachments
  async getAttachments(entityType?: string, entityId?: number): Promise<Attachment[]> {
    let query = db.select().from(attachments);
    
    const conditions = [];
    if (entityType) {
      conditions.push(eq(attachments.entityType, entityType));
    }
    if (entityId) {
      conditions.push(eq(attachments.entityId, entityId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(attachments.createdAt));
  }

  async getAttachment(id: number): Promise<Attachment | undefined> {
    const [attachment] = await db.select().from(attachments).where(eq(attachments.id, id));
    return attachment || undefined;
  }

  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const [newAttachment] = await db.insert(attachments).values(attachment).returning();
    return newAttachment;
  }

  async deleteAttachment(id: number): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id));
  }

  // Calendar Events
  async getCalendarEvents(entityType?: string, entityId?: number, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let query = db.select().from(calendarEvents);
    
    const conditions = [];
    if (entityType) {
      conditions.push(eq(calendarEvents.entityType, entityType));
    }
    if (entityId) {
      conditions.push(eq(calendarEvents.entityId, entityId));
    }
    if (startDate) {
      conditions.push(gte(calendarEvents.startDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(calendarEvents.startDate, endDate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(asc(calendarEvents.startDate));
  }

  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
    return event || undefined;
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db.insert(calendarEvents).values(event).returning();
    return newEvent;
  }

  async updateCalendarEvent(id: number, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [updatedEvent] = await db.update(calendarEvents)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(calendarEvents.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    
    // Get active deals count
    const [activeDealsResult] = await db
      .select({ count: count() })
      .from(deals)
      .where(eq(deals.status, 'confirmed'));
    
    // Get total revenue
    const [totalRevenueResult] = await db
      .select({ sum: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, 'paid'));
    
    // Get pending payments
    const [pendingPaymentsResult] = await db
      .select({ sum: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, 'pending'));
    
    // Get total songs
    const [totalSongsResult] = await db
      .select({ count: count() })
      .from(songs);
    
    // Get deals by status
    const dealsByStatusResults = await db
      .select({ status: deals.status, count: count() })
      .from(deals)
      .groupBy(deals.status);
    
    const dealsByStatus: Record<string, number> = {};
    dealsByStatusResults.forEach(row => {
      dealsByStatus[row.status] = row.count;
    });
    
    // Get recent activity (simplified)
    const recentDeals = await db
      .select()
      .from(deals)
      .orderBy(desc(deals.updatedAt))
      .limit(10);
    
    const recentActivity = recentDeals.map(deal => ({
      id: deal.id.toString(),
      type: 'deal' as const,
      message: `Deal ${deal.status}: ${deal.projectName}`,
      timestamp: deal.updatedAt,
      metadata: { dealId: deal.id, status: deal.status }
    }));
    
    // Get urgent actions
    const overduePayments = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.status, 'pending'),
          lte(payments.dueDate, now)
        )
      )
      .limit(10);
    
    const urgentActions = overduePayments.map(payment => ({
      id: payment.id.toString(),
      type: 'overdue_payment' as const,
      message: `Payment overdue: $${payment.amount}`,
      dueDate: payment.dueDate,
      metadata: { paymentId: payment.id, amount: payment.amount }
    }));
    
    return {
      activeDeals: activeDealsResult.count,
      totalRevenue: Number(totalRevenueResult.sum) || 0,
      pendingPayments: Number(pendingPaymentsResult.sum) || 0,
      totalSongs: totalSongsResult.count,
      dealsByStatus,
      recentActivity,
      urgentActions
    };
  }

  // Playlist methods
  async getPlaylists(): Promise<Playlist[]> {
    return await db.select().from(playlists).orderBy(desc(playlists.createdAt));
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist || undefined;
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const [newPlaylist] = await db.insert(playlists).values(playlist).returning();
    return newPlaylist;
  }

  async updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist> {
    const [updatedPlaylist] = await db
      .update(playlists)
      .set(playlist)
      .where(eq(playlists.id, id))
      .returning();
    return updatedPlaylist;
  }

  async deletePlaylist(id: number): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  // Playlist Songs methods
  async getPlaylistSongs(playlistId: number): Promise<PlaylistSong[]> {
    return await db.select().from(playlistSongs)
      .where(eq(playlistSongs.playlistId, playlistId))
      .orderBy(asc(playlistSongs.position));
  }

  async addSongToPlaylist(playlistSong: InsertPlaylistSong): Promise<PlaylistSong> {
    const [newPlaylistSong] = await db.insert(playlistSongs).values(playlistSong).returning();
    return newPlaylistSong;
  }

  async removeSongFromPlaylist(playlistId: number, songId: number): Promise<void> {
    await db.delete(playlistSongs)
      .where(and(
        eq(playlistSongs.playlistId, playlistId),
        eq(playlistSongs.songId, songId)
      ));
  }

  // Saved Searches methods
  async getSavedSearches(): Promise<SavedSearch[]> {
    return await db.select().from(savedSearches).orderBy(desc(savedSearches.createdAt));
  }

  async getSavedSearch(id: number): Promise<SavedSearch | undefined> {
    const [search] = await db.select().from(savedSearches).where(eq(savedSearches.id, id));
    return search || undefined;
  }

  async createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch> {
    const [newSearch] = await db.insert(savedSearches).values(search).returning();
    return newSearch;
  }

  async deleteSavedSearch(id: number): Promise<void> {
    await db.delete(savedSearches).where(eq(savedSearches.id, id));
  }

  // Workflow Automation methods
  async getWorkflowAutomations(): Promise<WorkflowAutomation[]> {
    return await db.select().from(workflowAutomation).orderBy(desc(workflowAutomation.createdAt));
  }

  async getWorkflowAutomation(id: number): Promise<WorkflowAutomation | undefined> {
    const [automation] = await db.select().from(workflowAutomation).where(eq(workflowAutomation.id, id));
    return automation || undefined;
  }

  async createWorkflowAutomation(automation: InsertWorkflowAutomation): Promise<WorkflowAutomation> {
    const [newAutomation] = await db.insert(workflowAutomation).values(automation).returning();
    return newAutomation;
  }

  async updateWorkflowAutomation(id: number, automation: Partial<InsertWorkflowAutomation>): Promise<WorkflowAutomation> {
    const [updatedAutomation] = await db
      .update(workflowAutomation)
      .set(automation)
      .where(eq(workflowAutomation.id, id))
      .returning();
    return updatedAutomation;
  }

  async deleteWorkflowAutomation(id: number): Promise<void> {
    await db.delete(workflowAutomation).where(eq(workflowAutomation.id, id));
  }

  // Client Profiles methods
  async getClientProfiles(): Promise<ClientProfile[]> {
    return await db.select().from(clientProfiles).orderBy(desc(clientProfiles.createdAt));
  }

  async getClientProfile(id: number): Promise<ClientProfile | undefined> {
    const [profile] = await db.select().from(clientProfiles).where(eq(clientProfiles.id, id));
    return profile || undefined;
  }

  async createClientProfile(profile: InsertClientProfile): Promise<ClientProfile> {
    const [newProfile] = await db.insert(clientProfiles).values(profile).returning();
    return newProfile;
  }

  async updateClientProfile(id: number, profile: Partial<InsertClientProfile>): Promise<ClientProfile> {
    const [updatedProfile] = await db
      .update(clientProfiles)
      .set(profile)
      .where(eq(clientProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  async deleteClientProfile(id: number): Promise<void> {
    await db.delete(clientProfiles).where(eq(clientProfiles.id, id));
  }

  // Analytics Events methods
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [newEvent] = await db.insert(analyticsEvents).values(event).returning();
    return newEvent;
  }

  // Advanced Analytics Methods
  async getRevenueAnalytics(timeRange: string, startDate?: Date, endDate?: Date): Promise<any> {
    const { start, end } = this.getDateRange(timeRange, startDate, endDate);
    
    // Total revenue and growth
    const [currentRevenue] = await db
      .select({ sum: sum(payments.amount) })
      .from(payments)
      .leftJoin(deals, eq(payments.dealId, deals.id))
      .where(and(
        eq(payments.status, 'paid'),
        gte(payments.paidDate, start),
        lte(payments.paidDate, end)
      ));

    const previousPeriod = this.getPreviousPeriod(start, end);
    const [previousRevenue] = await db
      .select({ sum: sum(payments.amount) })
      .from(payments)
      .leftJoin(deals, eq(payments.dealId, deals.id))
      .where(and(
        eq(payments.status, 'paid'),
        gte(payments.paidDate, previousPeriod.start),
        lte(payments.paidDate, previousPeriod.end)
      ));

    const total = Number(currentRevenue.sum) || 0;
    const previous = Number(previousRevenue.sum) || 0;
    const growth = previous > 0 ? ((total - previous) / previous) * 100 : 0;

    // Revenue by project type
    const byProjectType = await db
      .select({
        type: deals.projectType,
        revenue: sum(payments.amount),
        count: count(),
      })
      .from(payments)
      .leftJoin(deals, eq(payments.dealId, deals.id))
      .where(and(
        eq(payments.status, 'paid'),
        gte(payments.paidDate, start),
        lte(payments.paidDate, end)
      ))
      .groupBy(deals.projectType);

    const totalProjectRevenue = byProjectType.reduce((sum, item) => sum + Number(item.revenue), 0);
    const projectTypeData = byProjectType.map(item => ({
      type: item.type || 'Unknown',
      revenue: Number(item.revenue) || 0,
      count: item.count,
      percentage: totalProjectRevenue > 0 ? ((Number(item.revenue) / totalProjectRevenue) * 100) : 0,
      avgDealValue: item.count > 0 ? (Number(item.revenue) / item.count) : 0
    }));

    // Revenue by genre
    const byGenre = await db
      .select({
        genre: songs.genre,
        revenue: sum(payments.amount),
        count: count(),
      })
      .from(payments)
      .leftJoin(deals, eq(payments.dealId, deals.id))
      .leftJoin(songs, eq(deals.songId, songs.id))
      .where(and(
        eq(payments.status, 'paid'),
        gte(payments.paidDate, start),
        lte(payments.paidDate, end)
      ))
      .groupBy(songs.genre);

    const genreData = byGenre.map(item => ({
      genre: item.genre || 'Unknown',
      revenue: Number(item.revenue) || 0,
      count: item.count,
      percentage: total > 0 ? ((Number(item.revenue) / total) * 100) : 0,
      trend: 'stable' as const // Would need historical data for real trend calculation
    }));

    // Revenue by territory
    const byTerritory = await db
      .select({
        territory: deals.territory,
        revenue: sum(payments.amount),
        count: count(),
      })
      .from(payments)
      .leftJoin(deals, eq(payments.dealId, deals.id))
      .where(and(
        eq(payments.status, 'paid'),
        gte(payments.paidDate, start),
        lte(payments.paidDate, end)
      ))
      .groupBy(deals.territory);

    const territoryData = byTerritory.map(item => ({
      territory: item.territory || 'Unknown',
      revenue: Number(item.revenue) || 0,
      deals: item.count,
      percentage: total > 0 ? ((Number(item.revenue) / total) * 100) : 0
    }));

    // Revenue by client (using company from contacts)
    const byClient = await db
      .select({
        client: contacts.company,
        revenue: sum(payments.amount),
        dealCount: count(),
      })
      .from(payments)
      .leftJoin(deals, eq(payments.dealId, deals.id))
      .leftJoin(contacts, eq(deals.contactId, contacts.id))
      .where(and(
        eq(payments.status, 'paid'),
        gte(payments.paidDate, start),
        lte(payments.paidDate, end)
      ))
      .groupBy(contacts.company);

    const clientData = byClient.map(item => ({
      client: item.client || 'Unknown',
      revenue: Number(item.revenue) || 0,
      deals: item.dealCount,
      avgDealValue: item.dealCount > 0 ? (Number(item.revenue) / item.dealCount) : 0,
      successRate: 75 // Would need pitch data for real calculation
    }));

    return {
      total,
      growth,
      byPeriod: [], // Would implement monthly/quarterly breakdown
      byProjectType: projectTypeData,
      byGenre: genreData,
      byTerritory: territoryData,
      byClient: clientData,
      profitMargins: {
        grossProfit: total * 0.7, // Mock calculation
        netProfit: total * 0.5,
        margin: 50,
        costs: [
          { category: 'Operations', amount: total * 0.2, percentage: 20 },
          { category: 'Marketing', amount: total * 0.1, percentage: 10 },
          { category: 'Overhead', amount: total * 0.2, percentage: 20 }
        ]
      }
    };
  }

  async getDealPerformanceAnalytics(timeRange: string, startDate?: Date, endDate?: Date): Promise<any> {
    const { start, end } = this.getDateRange(timeRange, startDate, endDate);
    
    // Deal closure rate
    const [totalDeals] = await db
      .select({ count: count() })
      .from(deals)
      .where(and(
        gte(deals.createdAt, start),
        lte(deals.createdAt, end)
      ));

    const [closedDeals] = await db
      .select({ count: count() })
      .from(deals)
      .where(and(
        eq(deals.status, 'completed'),
        gte(deals.createdAt, start),
        lte(deals.createdAt, end)
      ));

    const closureRate = totalDeals.count > 0 ? (closedDeals.count / totalDeals.count) * 100 : 0;

    // Average deal value
    const [avgDealValue] = await db
      .select({ avg: sum(deals.dealValue) })
      .from(deals)
      .where(and(
        eq(deals.status, 'completed'),
        gte(deals.createdAt, start),
        lte(deals.createdAt, end)
      ));

    const averageDealValue = Number(avgDealValue.avg) / closedDeals.count || 0;

    // Success rate by status
    const dealsByStatus = await db
      .select({ status: deals.status, count: count() })
      .from(deals)
      .where(and(
        gte(deals.createdAt, start),
        lte(deals.createdAt, end)
      ))
      .groupBy(deals.status);

    const successRateByStatus: Record<string, number> = {};
    dealsByStatus.forEach(item => {
      successRateByStatus[item.status] = (item.count / totalDeals.count) * 100;
    });

    return {
      closureRate,
      averageDealValue,
      averageTimeToClose: 45, // Mock - would calculate from status dates
      successRateByStatus,
      velocity: {
        byStage: [
          { stage: 'Initial Contact', averageDays: 7, deals: 20 },
          { stage: 'Pitch Sent', averageDays: 14, deals: 18 },
          { stage: 'Under Review', averageDays: 21, deals: 12 },
          { stage: 'Negotiating', averageDays: 12, deals: 8 },
          { stage: 'Contract Sent', averageDays: 8, deals: 5 },
          { stage: 'Completed', averageDays: 3, deals: 4 }
        ],
        trends: [] // Mock data
      },
      topPerformers: {
        supervisors: [], // Would implement with real data
        clients: []
      },
      conversionFunnel: dealsByStatus.map((item, index) => ({
        stage: item.status,
        count: item.count,
        percentage: (item.count / totalDeals.count) * 100,
        dropOffRate: index > 0 ? 15 : 0 // Mock calculation
      }))
    };
  }

  async getMusicCatalogAnalytics(timeRange: string, startDate?: Date, endDate?: Date): Promise<any> {
    const { start, end } = this.getDateRange(timeRange, startDate, endDate);
    
    // Total songs
    const [totalSongs] = await db
      .select({ count: count() })
      .from(songs);

    // Songs with deals
    const [songsWithDeals] = await db
      .select({ count: count() })
      .from(songs)
      .leftJoin(deals, eq(songs.id, deals.songId))
      .where(and(
        gte(deals.createdAt, start),
        lte(deals.createdAt, end)
      ));

    const utilizationRate = totalSongs.count > 0 ? (songsWithDeals.count / totalSongs.count) * 100 : 0;

    // Top performing songs
    const topPerformingSongs = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        genre: songs.genre,
        deals: count(deals.id),
        revenue: sum(payments.amount)
      })
      .from(songs)
      .leftJoin(deals, eq(songs.id, deals.songId))
      .leftJoin(payments, and(eq(deals.id, payments.dealId), eq(payments.status, 'paid')))
      .where(and(
        gte(deals.createdAt, start),
        lte(deals.createdAt, end)
      ))
      .groupBy(songs.id, songs.title, songs.artist, songs.genre)
      .orderBy(desc(sum(payments.amount)))
      .limit(10);

    const songData = topPerformingSongs.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      genre: song.genre || 'Unknown',
      deals: song.deals,
      revenue: Number(song.revenue) || 0,
      revenuePerDeal: song.deals > 0 ? (Number(song.revenue) / song.deals) : 0,
      lastUsed: new Date() // Mock - would get from actual deal dates
    }));

    // Genre performance
    const genrePerformance = await db
      .select({
        genre: songs.genre,
        songCount: count(songs.id),
        deals: count(deals.id),
        revenue: sum(payments.amount)
      })
      .from(songs)
      .leftJoin(deals, eq(songs.id, deals.songId))
      .leftJoin(payments, and(eq(deals.id, payments.dealId), eq(payments.status, 'paid')))
      .groupBy(songs.genre);

    const genreData = genrePerformance.map(genre => ({
      genre: genre.genre || 'Unknown',
      songs: genre.songCount,
      deals: genre.deals,
      revenue: Number(genre.revenue) || 0,
      utilizationRate: genre.songCount > 0 ? (genre.deals / genre.songCount) * 100 : 0,
      marketTrend: 'stable' as const, // Mock
      avgRevenuePerSong: genre.songCount > 0 ? (Number(genre.revenue) / genre.songCount) : 0
    }));

    return {
      totalSongs: totalSongs.count,
      utilizationRate,
      topPerformingSongs: songData,
      genrePerformance: genreData,
      artistPerformance: [], // Would implement similar to genre
      underperformingSongs: [] // Would query songs with low deal counts
    };
  }

  async getFinancialForecastAnalytics(timeRange: string): Promise<any> {
    // Mock forecast data - would implement ML/statistical models for real forecasting
    return {
      revenueProjection: {
        nextMonth: 45000,
        nextQuarter: 135000,
        nextYear: 540000,
        confidence: 75,
        projectionBasis: 'Historical trends and pipeline analysis'
      },
      pipelineValue: {
        total: 250000,
        weightedValue: 187500,
        byStage: [
          { stage: 'quoted', value: 75000, deals: 15, probability: 60 },
          { stage: 'use_confirmed', value: 125000, deals: 20, probability: 80 },
          { stage: 'being_drafted', value: 50000, deals: 8, probability: 90 }
        ]
      },
      seasonalTrends: [], // Would implement with historical data
      budgetAnalysis: {
        planned: 500000,
        actual: 425000,
        variance: -75000,
        variancePercentage: -15,
        categories: []
      },
      cashFlowForecast: []
    };
  }

  async getComprehensiveAnalytics(timeRange: string, startDate?: Date, endDate?: Date): Promise<any> {
    const [revenue, dealPerformance, musicCatalog, forecast] = await Promise.all([
      this.getRevenueAnalytics(timeRange, startDate, endDate),
      this.getDealPerformanceAnalytics(timeRange, startDate, endDate),
      this.getMusicCatalogAnalytics(timeRange, startDate, endDate),
      this.getFinancialForecastAnalytics(timeRange)
    ]);

    return {
      timeRange,
      lastUpdated: new Date(),
      revenue,
      dealPerformance,
      musicCatalog,
      forecast,
      keyMetrics: {
        averageMonthlyRevenue: revenue.total / 12, // Simplified
        dealWinRate: dealPerformance.closureRate,
        customerLifetimeValue: 15000, // Mock
        revenuePerContact: revenue.total / (revenue.byClient?.length || 1),
        monthlyRecurringRevenue: 0, // Not applicable for sync licensing
        churnRate: 5 // Mock
      },
      benchmarks: {
        industryAverageDealValue: 3500,
        industrySuccessRate: 15,
        performanceRating: dealPerformance.closureRate > 20 ? 'excellent' : 
                          dealPerformance.closureRate > 15 ? 'good' : 
                          dealPerformance.closureRate > 10 ? 'average' : 'below_average',
        recommendations: [
          'Focus on high-performing genres for new acquisitions',
          'Develop relationships with top-converting clients',
          'Optimize pitch timing based on seasonal trends'
        ]
      }
    };
  }

  // Helper methods for date calculations
  private getDateRange(timeRange: string, startDate?: Date, endDate?: Date) {
    if (startDate && endDate) {
      return { start: startDate, end: endDate };
    }

    const now = new Date();
    const start = new Date();

    switch (timeRange) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case '2y':
        start.setFullYear(now.getFullYear() - 2);
        break;
      default:
        start.setFullYear(2020); // All time
    }

    return { start, end: now };
  }

  private getPreviousPeriod(start: Date, end: Date) {
    const duration = end.getTime() - start.getTime();
    return {
      start: new Date(start.getTime() - duration),
      end: new Date(start.getTime())
    };
  }

  // Contact extraction from deals
  async extractContactsFromDeal(dealData: any): Promise<void> {
    const contactsToCreate: InsertContact[] = [];
    
    // Extract Licensee/Production Company contact
    if (dealData.licenseeContactName && dealData.licenseeContactEmail) {
      const existingContact = await db.select()
        .from(contacts)
        .where(eq(contacts.email, dealData.licenseeContactEmail))
        .limit(1);
      
      if (existingContact.length === 0) {
        contactsToCreate.push({
          name: dealData.licenseeContactName,
          email: dealData.licenseeContactEmail,
          phone: dealData.licenseeContactPhone || "",
          company: dealData.licenseeCompanyName || "",
          role: "Licensee/Production Company Contact",
          notes: `Contact from ${dealData.projectName} deal. Address: ${dealData.licenseeAddress || "Not provided"}`
        });
      }
    }
    
    // Extract Music Supervisor contact
    if (dealData.musicSupervisorContactName && dealData.musicSupervisorContactEmail) {
      const existingContact = await db.select()
        .from(contacts)
        .where(eq(contacts.email, dealData.musicSupervisorContactEmail))
        .limit(1);
      
      if (existingContact.length === 0) {
        contactsToCreate.push({
          name: dealData.musicSupervisorContactName,
          email: dealData.musicSupervisorContactEmail,
          phone: dealData.musicSupervisorContactPhone || "",
          company: dealData.musicSupervisorName || "",
          role: "Music Supervisor",
          notes: `Contact from ${dealData.projectName} deal. Address: ${dealData.musicSupervisorAddress || "Not provided"}`
        });
      }
    }
    
    // Extract Clearance Company contact
    if (dealData.clearanceCompanyContactName && dealData.clearanceCompanyContactEmail) {
      const existingContact = await db.select()
        .from(contacts)
        .where(eq(contacts.email, dealData.clearanceCompanyContactEmail))
        .limit(1);
      
      if (existingContact.length === 0) {
        contactsToCreate.push({
          name: dealData.clearanceCompanyContactName,
          email: dealData.clearanceCompanyContactEmail,
          phone: dealData.clearanceCompanyContactPhone || "",
          company: dealData.clearanceCompanyName || "",
          role: "Clearance Company Contact",
          notes: `Contact from ${dealData.projectName} deal. Address: ${dealData.clearanceCompanyAddress || "Not provided"}`
        });
      }
    }
    
    // Create all new contacts
    if (contactsToCreate.length > 0) {
      await db.insert(contacts).values(contactsToCreate);
    }
  }
}

export const storage = new DatabaseStorage();
