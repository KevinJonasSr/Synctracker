import { 
  songs, contacts, deals, pitches, payments, templates, emailTemplates, attachments, calendarEvents,
  type Song, type InsertSong, type Contact, type InsertContact,
  type Deal, type InsertDeal, type Pitch, type InsertPitch,
  type Payment, type InsertPayment, type Template, type InsertTemplate,
  type EmailTemplate, type InsertEmailTemplate, type Attachment, type InsertAttachment,
  type CalendarEvent, type InsertCalendarEvent,
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
  createDeal(deal: InsertDeal): Promise<Deal>;
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
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(songs.createdAt)).limit(limit);
  }

  async getSong(id: number): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song || undefined;
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [created] = await db.insert(songs).values(song).returning();
    return created;
  }

  async updateSong(id: number, song: Partial<InsertSong>): Promise<Song> {
    const [updated] = await db
      .update(songs)
      .set({ ...song, updatedAt: new Date() })
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
      );
    }
    
    return query.orderBy(asc(contacts.name)).limit(limit);
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
      query = query.where(eq(deals.status, status));
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

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [created] = await db.insert(deals).values(deal).returning();
    return created;
  }

  async updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal> {
    const [updated] = await db
      .update(deals)
      .set({ ...deal, updatedAt: new Date() })
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
      query = query.where(eq(pitches.dealId, dealId));
    }
    
    return query.orderBy(desc(pitches.createdAt)).limit(limit);
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
      query = query.where(eq(payments.status, status));
    }
    
    return query.orderBy(desc(payments.createdAt)).limit(limit);
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
      query = query.where(eq(templates.type, type));
    }
    
    return query.orderBy(asc(templates.name));
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
      query = query.where(eq(emailTemplates.stage, stage));
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
      query = query.where(and(...conditions));
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
      query = query.where(and(...conditions));
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
}

export const storage = new DatabaseStorage();
