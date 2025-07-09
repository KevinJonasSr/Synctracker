import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb, real, date, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  composer: text("composer"),
  producer: text("producer"),
  publisher: text("publisher"),
  irc: text("irc"), // International Recording Code
  isrc: text("isrc"), // International Standard Recording Code
  upcEan: text("upc_ean"), // UPC/EAN barcode
  pNumbers: text("p_numbers"), // (P) Numbers
  proCueSheetId: text("pro_cue_sheet_id"),
  genreSubGenre: text("genre_sub_genre"),
  moodTheme: text("mood_theme"),
  bpmKey: text("bpm_key"),
  vocalInstrumentation: text("vocal_instrumentation"),
  explicitContent: boolean("explicit_content").default(false),
  lyrics: text("lyrics"),
  durationFormatted: text("duration_formatted"), // MM:SS format
  version: text("version"),
  coverArtDescription: text("cover_art_description"),
  fileTypeSampleRate: text("file_type_sample_rate"),
  contentRepresentationCode: text("content_representation_code"),
  masterRightsContact: text("master_rights_contact"),
  publishingRightsContact: text("publishing_rights_contact"),
  syncRepresentation: text("sync_representation"),
  contentRepresented: text("content_represented"),
  smartLinkQrCode: text("smart_link_qr_code"),
  // Legacy fields for backward compatibility
  genre: text("genre"),
  mood: text("mood"),
  tempo: integer("tempo"),
  duration: integer("duration"), // in seconds
  key: text("key"),
  bpm: integer("bpm"),
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
  episodeNumber: text("episode_number"),
  projectType: text("project_type").notNull(), // commercial, film, game, promos, sports, trailers, tv, etc.
  projectDescription: text("project_description"),
  songId: integer("song_id").references(() => songs.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  
  // Contact Information
  licenseeCompanyName: text("licensee_company_name"),
  licenseeAddress: text("licensee_address"),
  licenseeContactName: text("licensee_contact_name"),
  licenseeContactEmail: text("licensee_contact_email"),
  licenseeContactPhone: text("licensee_contact_phone"),
  
  musicSupervisorName: text("music_supervisor_name"),
  musicSupervisorAddress: text("music_supervisor_address"),
  musicSupervisorContactName: text("music_supervisor_contact_name"),
  musicSupervisorContactEmail: text("music_supervisor_contact_email"),
  musicSupervisorContactPhone: text("music_supervisor_contact_phone"),
  
  clearanceCompanyName: text("clearance_company_name"),
  clearanceCompanyAddress: text("clearance_company_address"),
  clearanceCompanyContactName: text("clearance_company_contact_name"),
  clearanceCompanyContactEmail: text("clearance_company_contact_email"),
  clearanceCompanyContactPhone: text("clearance_company_contact_phone"),
  
  status: text("status").notNull().default("pitched"), // Pitched, Pending Approval, Quoted, Use Confirmed, Being Drafted, Out for Signature, Payment Received, Completed
  
  // Status change dates
  pitchedDate: timestamp("pitched_date"),
  pendingApprovalDate: timestamp("pending_approval_date"),
  quotedDate: timestamp("quoted_date"),
  useConfirmedDate: timestamp("use_confirmed_date"),
  beingDraftedDate: timestamp("being_drafted_date"),
  outForSignatureDate: timestamp("out_for_signature_date"),
  paymentReceivedDate: timestamp("payment_received_date"),
  completedDate: timestamp("completed_date"),
  dealValue: decimal("deal_value", { precision: 10, scale: 2 }),
  fullSongValue: decimal("full_song_value", { precision: 10, scale: 2 }),
  ourFee: decimal("our_fee", { precision: 10, scale: 2 }),
  fullRecordingFee: decimal("full_recording_fee", { precision: 10, scale: 2 }),
  ourRecordingFee: decimal("our_recording_fee", { precision: 10, scale: 2 }),
  usage: text("usage"), // background, featured, opening, etc.
  media: text("media"), // TV, Film, Commercial, etc.
  territory: text("territory").default("worldwide"),
  term: text("term"), // perpetual, 1 year, etc.
  exclusivity: boolean("exclusivity").default(false),
  exclusivityRestrictions: text("exclusivity_restrictions"),
  
  // Song Information
  writers: text("writers"),
  publishingInfo: text("publishing_info"),
  splits: text("splits"),
  artist: text("artist"),
  label: text("label"),
  artistLabelSplits: text("artist_label_splits"),
  
  notes: text("notes"),
  airDate: timestamp("air_date"),
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

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'client', 'genre', 'mood', 'project', 'custom'
  clientId: integer("client_id"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playlistSongs = pgTable("playlist_songs", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  songId: integer("song_id").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  searchCriteria: text("search_criteria").notNull(), // JSON string
  entityType: text("entity_type").notNull(), // 'songs', 'deals', 'contacts', etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bulkPitches = pgTable("bulk_pitches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  contactId: integer("contact_id").notNull(),
  playlistId: integer("playlist_id"),
  emailTemplateId: integer("email_template_id"),
  status: text("status").default("draft"), // 'draft', 'sent', 'responded'
  sentDate: timestamp("sent_date"),
  responseDate: timestamp("response_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bulkPitchSongs = pgTable("bulk_pitch_songs", {
  id: serial("id").primaryKey(),
  bulkPitchId: integer("bulk_pitch_id").notNull(),
  songId: integer("song_id").notNull(),
  status: text("status").default("pending"), // 'pending', 'accepted', 'rejected', 'maybe'
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientProfiles = pgTable("client_profiles", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  preferredGenres: text("preferred_genres").array(),
  preferredMoods: text("preferred_moods").array(),
  budgetRange: text("budget_range"),
  projectTypes: text("project_types").array(),
  communicationPreferences: text("communication_preferences"),
  successRate: real("success_rate").default(0),
  totalDeals: integer("total_deals").default(0),
  averageDealValue: real("average_deal_value").default(0),
  lastContactDate: timestamp("last_contact_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowAutomation = pgTable("workflow_automation", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  triggerType: text("trigger_type").notNull(), // 'date', 'status_change', 'time_elapsed'
  triggerCondition: text("trigger_condition").notNull(), // JSON string
  actionType: text("action_type").notNull(), // 'email', 'notification', 'status_update'
  actionData: text("action_data").notNull(), // JSON string
  isActive: boolean("is_active").default(true),
  entityType: text("entity_type").notNull(), // 'deal', 'pitch', 'payment'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // 'song_pitched', 'deal_created', 'payment_received'
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  metadata: text("metadata"), // JSON string
  value: real("value"), // monetary value if applicable
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Rights Clearance Tracker
export const rightsClearances = pgTable("rights_clearances", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").references(() => songs.id, { onDelete: 'cascade' }),
  publishingSplits: jsonb("publishing_splits"), // Array of {publisher, percentage}
  mechanicalRights: text("mechanical_rights").default("cleared"), // cleared, pending, issues
  syncClearance: text("sync_clearance").default("cleared"), // cleared, pending, issues
  masterOwner: text("master_owner"),
  publishingAdmin: text("publishing_admin"),
  clearanceNotes: text("clearance_notes"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Version Control System
export const songVersions = pgTable("song_versions", {
  id: serial("id").primaryKey(),
  originalSongId: integer("original_song_id").references(() => songs.id, { onDelete: 'cascade' }),
  versionType: text("version_type").notNull(), // mix, edit, stem, instrumental, etc.
  versionName: text("version_name").notNull(),
  duration: integer("duration"), // in seconds
  fileUrl: text("file_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Smart Pitch Matching with Themes
export const smartPitchMatches = pgTable("smart_pitch_matches", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").references(() => songs.id, { onDelete: 'cascade' }),
  dealId: integer("deal_id").references(() => deals.id, { onDelete: 'cascade' }),
  matchScore: decimal("match_score", { precision: 3, scale: 2 }), // 0-10
  analysis: jsonb("analysis").notNull(), // Full AI analysis
  themes: jsonb("themes"), // Christmas, Mother's Day, Siblings, etc.
  seasonality: jsonb("seasonality"), // Holiday, Summer, etc.
  occasions: jsonb("occasions"), // Wedding, Graduation, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Invoice Generation
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id, { onDelete: 'cascade' }),
  invoiceNumber: text("invoice_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("draft"), // draft, sent, paid, overdue
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expense Tracking
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").references(() => songs.id, { onDelete: 'cascade' }),
  category: text("category").notNull(), // production, marketing, legal, etc.
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  receipt: text("receipt_url"),
  taxDeductible: boolean("tax_deductible").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Integrated Messaging
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id"), // For future user system
  toContactId: integer("to_contact_id").references(() => contacts.id, { onDelete: 'cascade' }),
  dealId: integer("deal_id").references(() => deals.id, { onDelete: 'cascade' }),
  subject: text("subject"),
  message: text("message").notNull(),
  messageType: text("message_type").default("email"), // email, sms, chat
  status: text("status").default("sent"), // sent, delivered, read, replied
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Approval Workflows
export const approvalWorkflows = pgTable("approval_workflows", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id, { onDelete: 'cascade' }),
  workflowType: text("workflow_type").notNull(), // contract, deal, payment
  currentStage: text("current_stage").notNull(),
  stages: jsonb("stages").notNull(), // Array of approval stages
  approvers: jsonb("approvers").notNull(), // Array of approver info
  status: text("status").default("pending"), // pending, approved, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const songsRelations = relations(songs, ({ many }) => ({
  deals: many(deals),
  playlistSongs: many(playlistSongs),
}));

export const contactsRelations = relations(contacts, ({ many, one }) => ({
  deals: many(deals),
  clientProfile: one(clientProfiles, {
    fields: [contacts.id],
    references: [clientProfiles.contactId],
  }),
  bulkPitches: many(bulkPitches),
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

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  client: one(contacts, {
    fields: [playlists.clientId],
    references: [contacts.id],
  }),
  songs: many(playlistSongs),
  bulkPitches: many(bulkPitches),
}));

export const playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistSongs.playlistId],
    references: [playlists.id],
  }),
  song: one(songs, {
    fields: [playlistSongs.songId],
    references: [songs.id],
  }),
}));

export const bulkPitchesRelations = relations(bulkPitches, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [bulkPitches.contactId],
    references: [contacts.id],
  }),
  playlist: one(playlists, {
    fields: [bulkPitches.playlistId],
    references: [playlists.id],
  }),
  emailTemplate: one(emailTemplates, {
    fields: [bulkPitches.emailTemplateId],
    references: [emailTemplates.id],
  }),
  songs: many(bulkPitchSongs),
}));

export const bulkPitchSongsRelations = relations(bulkPitchSongs, ({ one }) => ({
  bulkPitch: one(bulkPitches, {
    fields: [bulkPitchSongs.bulkPitchId],
    references: [bulkPitches.id],
  }),
  song: one(songs, {
    fields: [bulkPitchSongs.songId],
    references: [songs.id],
  }),
}));

export const clientProfilesRelations = relations(clientProfiles, ({ one }) => ({
  contact: one(contacts, {
    fields: [clientProfiles.contactId],
    references: [contacts.id],
  }),
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
}).extend({
  // Allow string dates from forms that get converted server-side
  airDate: z.string().optional().nullable(),
  pitchDate: z.string().optional().nullable(), 
  responseDate: z.string().optional().nullable(),
  confirmationDate: z.string().optional().nullable(),
  completionDate: z.string().optional().nullable(),
  paymentDate: z.string().optional().nullable(),
  paymentDueDate: z.string().optional().nullable(),
  // Status date fields
  pitchedDate: z.string().optional().nullable(),
  pendingApprovalDate: z.string().optional().nullable(),
  quotedDate: z.string().optional().nullable(),
  useConfirmedDate: z.string().optional().nullable(),
  beingDraftedDate: z.string().optional().nullable(),
  outForSignatureDate: z.string().optional().nullable(),
  paymentReceivedDate: z.string().optional().nullable(),
  completedDate: z.string().optional().nullable(),
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

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlaylistSongSchema = createInsertSchema(playlistSongs).omit({
  id: true,
  createdAt: true,
});

export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBulkPitchSchema = createInsertSchema(bulkPitches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBulkPitchSongSchema = createInsertSchema(bulkPitchSongs).omit({
  id: true,
  createdAt: true,
});

export const insertClientProfileSchema = createInsertSchema(clientProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowAutomationSchema = createInsertSchema(workflowAutomation).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  timestamp: true,
});

export const insertRightsClearanceSchema = createInsertSchema(rightsClearances).omit({
  id: true,
  lastUpdated: true,
});

export const insertSongVersionSchema = createInsertSchema(songVersions).omit({
  id: true,
  createdAt: true,
});

export const insertSmartPitchMatchSchema = createInsertSchema(smartPitchMatches).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertApprovalWorkflowSchema = createInsertSchema(approvalWorkflows).omit({
  id: true,
  createdAt: true,
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
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
export type InsertPlaylistSong = z.infer<typeof insertPlaylistSongSchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type BulkPitch = typeof bulkPitches.$inferSelect;
export type InsertBulkPitch = z.infer<typeof insertBulkPitchSchema>;
export type BulkPitchSong = typeof bulkPitchSongs.$inferSelect;
export type InsertBulkPitchSong = z.infer<typeof insertBulkPitchSongSchema>;
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;
export type WorkflowAutomation = typeof workflowAutomation.$inferSelect;
export type InsertWorkflowAutomation = z.infer<typeof insertWorkflowAutomationSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

export type RightsClearance = typeof rightsClearances.$inferSelect;
export type InsertRightsClearance = z.infer<typeof insertRightsClearanceSchema>;
export type SongVersion = typeof songVersions.$inferSelect;
export type InsertSongVersion = z.infer<typeof insertSongVersionSchema>;
export type SmartPitchMatch = typeof smartPitchMatches.$inferSelect;
export type InsertSmartPitchMatch = z.infer<typeof insertSmartPitchMatchSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ApprovalWorkflow = typeof approvalWorkflows.$inferSelect;
export type InsertApprovalWorkflow = z.infer<typeof insertApprovalWorkflowSchema>;

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
