import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  genre: text("genre"),
  mood: text("mood"),
  tempo: integer("tempo"),
  duration: integer("duration"), // in seconds
  key: text("key"),
  bpm: integer("bpm"),
  lyrics: text("lyrics"),
  description: text("description"),
  tags: text("tags").array(),
  filePath: text("file_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  role: text("role"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  projectName: text("project_name").notNull(),
  projectType: text("project_type").notNull(), // film, tv, commercial, game, etc.
  projectDescription: text("project_description"),
  songId: integer("song_id").references(() => songs.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  status: text("status").notNull().default("pitched"), // pitched, under_review, confirmed, completed, paid, rejected
  dealValue: decimal("deal_value", { precision: 10, scale: 2 }),
  usage: text("usage"), // background, featured, opening, etc.
  territory: text("territory").default("worldwide"),
  term: text("term"), // perpetual, 1 year, etc.
  exclusivity: boolean("exclusivity").default(false),
  notes: text("notes"),
  pitchDate: timestamp("pitch_date"),
  responseDate: timestamp("response_date"),
  confirmationDate: timestamp("confirmation_date"),
  completionDate: timestamp("completion_date"),
  paymentDate: timestamp("payment_date"),
  paymentDueDate: timestamp("payment_due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pitches = pgTable("pitches", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id).notNull(),
  submissionDate: timestamp("submission_date").notNull(),
  followUpDate: timestamp("follow_up_date"),
  status: text("status").notNull().default("pending"), // pending, responded, no_response
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // contract, quote, invoice, etc.
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stage: text("stage").notNull(), // 'initial_pitch', 'follow_up', 'negotiation', 'contract_sent', etc.
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  variables: jsonb("variables").default([]), // placeholders like {{clientName}}, {{songTitle}}
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  entityType: text("entity_type").notNull(), // 'deal', 'song', 'contact', 'pitch'
  entityId: integer("entity_id").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  allDay: boolean("all_day").default(false),
  entityType: text("entity_type").notNull(), // 'deal', 'pitch', 'payment'
  entityId: integer("entity_id").notNull(),
  reminderMinutes: integer("reminder_minutes").default(60),
  status: text("status").default('scheduled'), // 'scheduled', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const songsRelations = relations(songs, ({ many }) => ({
  deals: many(deals),
}));

export const contactsRelations = relations(contacts, ({ many }) => ({
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  song: one(songs, { fields: [deals.songId], references: [songs.id] }),
  contact: one(contacts, { fields: [deals.contactId], references: [contacts.id] }),
  pitches: many(pitches),
  payments: many(payments),
}));

export const pitchesRelations = relations(pitches, ({ one }) => ({
  deal: one(deals, { fields: [pitches.dealId], references: [deals.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  deal: one(deals, { fields: [payments.dealId], references: [deals.id] }),
}));

// Insert schemas
export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPitchSchema = createInsertSchema(pitches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Pitch = typeof pitches.$inferSelect;
export type InsertPitch = z.infer<typeof insertPitchSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

// Extended types for API responses
export type DealWithRelations = Deal & {
  song: Song;
  contact: Contact;
  pitches: Pitch[];
  payments: Payment[];
};

export type DashboardMetrics = {
  activeDeals: number;
  totalRevenue: number;
  pendingPayments: number;
  totalSongs: number;
  dealsByStatus: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: 'payment' | 'deal' | 'pitch' | 'song';
    message: string;
    timestamp: Date;
    metadata?: any;
  }>;
  urgentActions: Array<{
    id: string;
    type: 'overdue_payment' | 'pending_response' | 'contract_approval';
    message: string;
    dueDate?: Date;
    metadata?: any;
  }>;
};
