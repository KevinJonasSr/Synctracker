import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { 
  insertSongSchema, insertContactSchema, insertDealSchema,
  insertPitchSchema, insertPaymentSchema, insertTemplateSchema,
  insertEmailTemplateSchema, insertAttachmentSchema, insertCalendarEventSchema,
  insertWorkflowAutomationSchema, insertAutomationExecutionSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow most file types for sync licensing
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|aiff|flac|m4a|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Songs endpoints
  app.get("/api/songs", async (req, res) => {
    try {
      const { search, genre, limit } = req.query;
      const songs = await dbStorage.getSongs(
        search as string,
        genre as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(songs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const song = await dbStorage.getSong(id);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch song" });
    }
  });

  app.post("/api/songs", async (req, res) => {
    try {
      const validatedData = insertSongSchema.parse(req.body);
      const song = await dbStorage.createSong(validatedData);
      res.json(song);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create song" });
    }
  });

  app.put("/api/songs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSongSchema.partial().parse(req.body);
      const song = await dbStorage.updateSong(id, validatedData);
      res.json(song);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update song" });
    }
  });

  app.delete("/api/songs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await dbStorage.deleteSong(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete song" });
    }
  });

  // Contacts endpoints
  app.get("/api/contacts", async (req, res) => {
    try {
      const { search, limit } = req.query;
      const contacts = await dbStorage.getContacts(
        search as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await dbStorage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await dbStorage.createContact(validatedData);
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContactSchema.partial().parse(req.body);
      const contact = await dbStorage.updateContact(id, validatedData);
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await dbStorage.deleteContact(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Deals endpoints
  app.get("/api/deals", async (req, res) => {
    try {
      const { status, limit } = req.query;
      const deals = await dbStorage.getDeals(
        status as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(deals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await dbStorage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deal" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      console.log('Received deal data:', req.body);
      const validatedData = insertDealSchema.parse(req.body);
      console.log('Validated data:', validatedData);
      
      // Convert date strings to Date objects for database insertion
      const processedData = {
        ...validatedData,
        airDate: validatedData.airDate && validatedData.airDate !== '' ? new Date(validatedData.airDate) : null,
        pitchDate: validatedData.pitchDate && validatedData.pitchDate !== '' ? new Date(validatedData.pitchDate) : null,
        responseDate: validatedData.responseDate && validatedData.responseDate !== '' ? new Date(validatedData.responseDate) : null,
        confirmationDate: validatedData.confirmationDate && validatedData.confirmationDate !== '' ? new Date(validatedData.confirmationDate) : null,
        completionDate: validatedData.completionDate && validatedData.completionDate !== '' ? new Date(validatedData.completionDate) : null,
        paymentDate: validatedData.paymentDate && validatedData.paymentDate !== '' ? new Date(validatedData.paymentDate) : null,
        paymentDueDate: validatedData.paymentDueDate && validatedData.paymentDueDate !== '' ? new Date(validatedData.paymentDueDate) : null,
        // Status change date fields
        pitchedDate: validatedData.pitchedDate && validatedData.pitchedDate !== '' ? new Date(validatedData.pitchedDate) : null,
        pendingApprovalDate: validatedData.pendingApprovalDate && validatedData.pendingApprovalDate !== '' ? new Date(validatedData.pendingApprovalDate) : null,
        quotedDate: validatedData.quotedDate && validatedData.quotedDate !== '' ? new Date(validatedData.quotedDate) : null,
        useConfirmedDate: validatedData.useConfirmedDate && validatedData.useConfirmedDate !== '' ? new Date(validatedData.useConfirmedDate) : null,
        beingDraftedDate: validatedData.beingDraftedDate && validatedData.beingDraftedDate !== '' ? new Date(validatedData.beingDraftedDate) : null,
        outForSignatureDate: validatedData.outForSignatureDate && validatedData.outForSignatureDate !== '' ? new Date(validatedData.outForSignatureDate) : null,
        paymentReceivedDate: validatedData.paymentReceivedDate && validatedData.paymentReceivedDate !== '' ? new Date(validatedData.paymentReceivedDate) : null,
        completedDate: validatedData.completedDate && validatedData.completedDate !== '' ? new Date(validatedData.completedDate) : null
      };
      
      console.log('Processed data:', processedData);
      const deal = await dbStorage.createDeal(processedData);
      
      // Auto-create calendar event for air date if provided
      if (processedData.airDate) {
        try {
          console.log('Creating calendar event for air date:', processedData.airDate);
          const calendarEvent = {
            title: `Air Date: ${deal.projectName}`,
            description: `Project "${deal.projectName}" (${deal.projectType}) is scheduled to air.`,
            startDate: processedData.airDate,
            endDate: processedData.airDate,
            allDay: true,
            entityType: 'deal' as const,
            entityId: deal.id,
            status: 'scheduled' as const,
            reminderMinutes: 1440 // 24 hours before
          };
          
          console.log('Calendar event data:', calendarEvent);
          const createdEvent = await dbStorage.createCalendarEvent(calendarEvent);
          console.log('Calendar event created successfully:', createdEvent);
        } catch (eventError) {
          console.error('Error creating calendar event for air date:', eventError);
          console.error('Error details:', eventError);
          // Don't fail the deal creation if calendar event fails
        }
      }
      
      res.json(deal);
    } catch (error: any) {
      console.error("Error creating deal:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create deal", details: error?.message || "Unknown error" });
    }
  });

  app.put("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("PUT /api/deals/:id - Updating deal:", id);
      console.log("Request body:", req.body);
      
      // Now validate with the updated schema that accepts string dates
      const validatedData = insertDealSchema.partial().parse(req.body);
      console.log("Validated data:", validatedData);
      
      const deal = await dbStorage.updateDeal(id, validatedData);
      console.log("Updated deal:", deal);
      
      res.json(deal);
    } catch (error: any) {
      console.error("Error updating deal:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update deal", details: error?.message || "Unknown error" });
    }
  });

  app.patch("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("PATCH /api/deals/:id - Updating deal:", id);
      console.log("Request body:", req.body);
      
      // Now validate with the updated schema that accepts string dates
      const validatedData = insertDealSchema.partial().parse(req.body);
      console.log("Validated data:", validatedData);
      
      // Convert date strings to Date objects for database insertion (same as POST route)
      const processedData = {
        ...validatedData,
        airDate: validatedData.airDate && validatedData.airDate !== '' ? new Date(validatedData.airDate) : null,
        pitchDate: validatedData.pitchDate && validatedData.pitchDate !== '' ? new Date(validatedData.pitchDate) : null,
        responseDate: validatedData.responseDate && validatedData.responseDate !== '' ? new Date(validatedData.responseDate) : null,
        confirmationDate: validatedData.confirmationDate && validatedData.confirmationDate !== '' ? new Date(validatedData.confirmationDate) : null,
        completionDate: validatedData.completionDate && validatedData.completionDate !== '' ? new Date(validatedData.completionDate) : null,
        paymentDate: validatedData.paymentDate && validatedData.paymentDate !== '' ? new Date(validatedData.paymentDate) : null,
        paymentDueDate: validatedData.paymentDueDate && validatedData.paymentDueDate !== '' ? new Date(validatedData.paymentDueDate) : null,
        // Status change date fields
        pitchedDate: validatedData.pitchedDate && validatedData.pitchedDate !== '' ? new Date(validatedData.pitchedDate) : null,
        pendingApprovalDate: validatedData.pendingApprovalDate && validatedData.pendingApprovalDate !== '' ? new Date(validatedData.pendingApprovalDate) : null,
        quotedDate: validatedData.quotedDate && validatedData.quotedDate !== '' ? new Date(validatedData.quotedDate) : null,
        useConfirmedDate: validatedData.useConfirmedDate && validatedData.useConfirmedDate !== '' ? new Date(validatedData.useConfirmedDate) : null,
        beingDraftedDate: validatedData.beingDraftedDate && validatedData.beingDraftedDate !== '' ? new Date(validatedData.beingDraftedDate) : null,
        outForSignatureDate: validatedData.outForSignatureDate && validatedData.outForSignatureDate !== '' ? new Date(validatedData.outForSignatureDate) : null,
        paymentReceivedDate: validatedData.paymentReceivedDate && validatedData.paymentReceivedDate !== '' ? new Date(validatedData.paymentReceivedDate) : null,
        completedDate: validatedData.completedDate && validatedData.completedDate !== '' ? new Date(validatedData.completedDate) : null,
      };
      
      const deal = await dbStorage.updateDeal(id, processedData as any);
      console.log("Updated deal:", deal);
      
      res.json(deal);
    } catch (error: any) {
      console.error("Error updating deal:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update deal", details: error?.message || "Unknown error" });
    }
  });

  app.delete("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await dbStorage.deleteDeal(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete deal" });
    }
  });

  // Pitches endpoints
  app.get("/api/pitches", async (req, res) => {
    try {
      const { dealId, limit } = req.query;
      const pitches = await dbStorage.getPitches(
        dealId ? parseInt(dealId as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(pitches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pitches" });
    }
  });

  app.post("/api/pitches", async (req, res) => {
    try {
      console.log("POST /api/pitches - Request body:", req.body);
      
      // Manual validation and processing since submissionDate is auto-generated
      const { dealId, customDealName, status, notes, followUpDate } = req.body;
      
      // Either dealId or customDealName must be provided
      if (!dealId && !customDealName) {
        return res.status(400).json({ error: "Either dealId or customDealName is required" });
      }
      
      const processedData = {
        dealId: dealId ? parseInt(dealId) : null,
        customDealName: customDealName || null,
        status: status || "pending",
        notes: notes || "",
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      };
      
      console.log("Processed pitch data:", processedData);
      const pitch = await dbStorage.createPitch(processedData);
      console.log("Created pitch:", pitch);
      res.json(pitch);
    } catch (error: any) {
      console.error("Error creating pitch:", error);
      res.status(500).json({ error: "Failed to create pitch", details: error?.message || "Unknown error" });
    }
  });

  app.put("/api/pitches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("PUT /api/pitches/:id - Updating pitch:", id);
      console.log("Request body:", req.body);
      
      const { status, notes, followUpDate } = req.body;
      
      const processedData = {
        status: status || undefined,
        notes: notes || undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      };
      
      // Remove undefined fields
      const updateData = Object.fromEntries(
        Object.entries(processedData).filter(([_, value]) => value !== undefined)
      );
      
      console.log("Processed update data:", updateData);
      const pitch = await dbStorage.updatePitch(id, updateData);
      console.log("Updated pitch:", pitch);
      res.json(pitch);
    } catch (error: any) {
      console.error("Error updating pitch:", error);
      res.status(500).json({ error: "Failed to update pitch", details: error?.message || "Unknown error" });
    }
  });

  // Payments endpoints
  app.get("/api/payments", async (req, res) => {
    try {
      const { status, limit } = req.query;
      const payments = await dbStorage.getPayments(
        status as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await dbStorage.createPayment(validatedData);
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPaymentSchema.partial().parse(req.body);
      const payment = await dbStorage.updatePayment(id, validatedData);
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  // Templates endpoints
  app.get("/api/templates", async (req, res) => {
    try {
      const { type } = req.query;
      const templates = await dbStorage.getTemplates(type as string);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await dbStorage.createTemplate(validatedData);
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  // Dashboard endpoint
  app.get("/api/dashboard", async (req, res) => {
    try {
      const metrics = await dbStorage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Business Intelligence Endpoints
  app.get("/api/dashboard/advanced-metrics", async (req, res) => {
    try {
      const { timeRange = '30d' } = req.query;
      const metrics = await dbStorage.getAdvancedMetrics(timeRange as string);
      res.json(metrics);
    } catch (error) {
      console.error('Advanced metrics error:', error);
      res.status(500).json({ error: "Failed to fetch advanced metrics" });
    }
  });

  app.get("/api/dashboard/smart-alerts", async (req, res) => {
    try {
      const alerts = await dbStorage.getSmartAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Smart alerts error:', error);
      res.status(500).json({ error: "Failed to fetch smart alerts" });
    }
  });

  app.get("/api/dashboard/market-insights", async (req, res) => {
    try {
      const { category } = req.query;
      const insights = await dbStorage.getMarketInsights(category as string);
      res.json(insights);
    } catch (error) {
      console.error('Market insights error:', error);
      res.status(500).json({ error: "Failed to fetch market insights" });
    }
  });

  app.get("/api/dashboard/client-relationships", async (req, res) => {
    try {
      const { contactId } = req.query;
      const data = await dbStorage.getClientRelationshipData(
        contactId ? parseInt(contactId as string) : undefined
      );
      res.json(data);
    } catch (error) {
      console.error('Client relationships error:', error);
      res.status(500).json({ error: "Failed to fetch client relationship data" });
    }
  });

  app.get("/api/dashboard/performance-benchmarks", async (req, res) => {
    try {
      const benchmarks = await dbStorage.getPerformanceBenchmarks();
      res.json(benchmarks);
    } catch (error) {
      console.error('Performance benchmarks error:', error);
      res.status(500).json({ error: "Failed to fetch performance benchmarks" });
    }
  });

  app.get("/api/dashboard/recommendations", async (req, res) => {
    try {
      const recommendations = await dbStorage.generateBusinessRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error('Business recommendations error:', error);
      res.status(500).json({ error: "Failed to generate business recommendations" });
    }
  });

  app.get("/api/dashboard/portfolio-risk", async (req, res) => {
    try {
      const riskAnalysis = await dbStorage.analyzePortfolioRisk();
      res.json(riskAnalysis);
    } catch (error) {
      console.error('Portfolio risk error:', error);
      res.status(500).json({ error: "Failed to analyze portfolio risk" });
    }
  });

  app.get("/api/dashboard/growth-opportunities", async (req, res) => {
    try {
      const opportunities = await dbStorage.identifyGrowthOpportunities();
      res.json(opportunities);
    } catch (error) {
      console.error('Growth opportunities error:', error);
      res.status(500).json({ error: "Failed to identify growth opportunities" });
    }
  });

  app.get("/api/dashboard/deal-probability/:id", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const probability = await dbStorage.calculateDealProbability(dealId);
      res.json({ dealId, probability });
    } catch (error) {
      console.error('Deal probability error:', error);
      res.status(500).json({ error: "Failed to calculate deal probability" });
    }
  });

  app.get("/api/dashboard/revenue-forecast", async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      const forecast = await dbStorage.generateRevenueForecasting(period as '30d' | '60d' | '90d');
      res.json(forecast);
    } catch (error) {
      console.error('Revenue forecast error:', error);
      res.status(500).json({ error: "Failed to generate revenue forecast" });
    }
  });

  // Email Templates endpoints
  app.get("/api/email-templates", async (req, res) => {
    try {
      const { stage } = req.query;
      const templates = await dbStorage.getEmailTemplates(stage as string);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  });

  app.get("/api/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await dbStorage.getEmailTemplate(id);
      if (!template) {
        return res.status(404).json({ error: "Email template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email template" });
    }
  });

  app.post("/api/email-templates", async (req, res) => {
    try {
      const data = insertEmailTemplateSchema.parse(req.body);
      const template = await dbStorage.createEmailTemplate(data);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ error: "Invalid email template data" });
    }
  });

  app.put("/api/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertEmailTemplateSchema.partial().parse(req.body);
      const template = await dbStorage.updateEmailTemplate(id, data);
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: "Invalid email template data" });
    }
  });

  app.delete("/api/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await dbStorage.deleteEmailTemplate(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete email template" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const { entityType, entityId, description } = req.body;
      
      const attachmentData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        entityType,
        entityId: parseInt(entityId),
        description
      };
      
      const attachment = await dbStorage.createAttachment(attachmentData);
      res.status(201).json(attachment);
    } catch (error) {
      res.status(400).json({ error: "File upload failed" });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    res.sendFile(filePath);
  });

  // Attachments endpoints
  app.get("/api/attachments", async (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      const attachments = await dbStorage.getAttachments(
        entityType as string,
        entityId ? parseInt(entityId as string) : undefined
      );
      res.json(attachments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attachments" });
    }
  });

  app.get("/api/attachments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const attachment = await dbStorage.getAttachment(id);
      if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
      }
      res.json(attachment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attachment" });
    }
  });

  app.post("/api/attachments", async (req, res) => {
    try {
      const data = insertAttachmentSchema.parse(req.body);
      const attachment = await dbStorage.createAttachment(data);
      res.status(201).json(attachment);
    } catch (error) {
      res.status(400).json({ error: "Invalid attachment data" });
    }
  });

  app.delete("/api/attachments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await dbStorage.deleteAttachment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete attachment" });
    }
  });

  // Calendar Events endpoints
  app.get("/api/calendar-events", async (req, res) => {
    try {
      const { entityType, entityId, startDate, endDate } = req.query;
      const events = await dbStorage.getCalendarEvents(
        entityType as string,
        entityId ? parseInt(entityId as string) : undefined,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });

  app.get("/api/calendar-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await dbStorage.getCalendarEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Calendar event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar event" });
    }
  });

  app.post("/api/calendar-events", async (req, res) => {
    try {
      // Convert string dates to Date objects before validation
      const processedData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      
      const data = insertCalendarEventSchema.parse(processedData);
      const event = await dbStorage.createCalendarEvent(data);
      res.status(201).json(event);
    } catch (error) {
      console.error('Calendar event validation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(400).json({ error: "Invalid calendar event data" });
    }
  });

  app.put("/api/calendar-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Convert string dates to Date objects before validation
      const processedData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      
      const data = insertCalendarEventSchema.partial().parse(processedData);
      const event = await dbStorage.updateCalendarEvent(id, data);
      
      // If this is an air date event for a deal, update the deal's air date too
      if (event.entityType === 'deal' && event.entityId && event.title.includes('Air Date:')) {
        try {
          await dbStorage.updateDeal(event.entityId, { 
            airDate: event.startDate as any
          });
        } catch (dealError) {
          console.error('Error updating deal air date:', dealError);
          // Don't fail the calendar update if deal update fails
        }
      }
      
      res.json(event);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(400).json({ error: "Invalid calendar event data" });
    }
  });

  app.delete("/api/calendar-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await dbStorage.deleteCalendarEvent(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete calendar event" });
    }
  });

  // Playlists endpoints
  app.get('/api/playlists', async (req, res) => {
    try {
      const playlists = await dbStorage.getPlaylists();
      res.json(playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      res.status(500).json({ error: 'Failed to fetch playlists' });
    }
  });

  app.post('/api/playlists', async (req, res) => {
    try {
      const playlist = await dbStorage.createPlaylist(req.body);
      res.status(201).json(playlist);
    } catch (error) {
      console.error('Error creating playlist:', error);
      res.status(500).json({ error: 'Failed to create playlist' });
    }
  });

  app.get('/api/playlist-songs/:playlistId', async (req, res) => {
    try {
      const songs = await dbStorage.getPlaylistSongs(parseInt(req.params.playlistId));
      res.json(songs);
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      res.status(500).json({ error: 'Failed to fetch playlist songs' });
    }
  });

  // Workflow Automation endpoints
  app.get('/api/workflow-automation', async (req, res) => {
    try {
      const automations = await dbStorage.getWorkflowAutomations();
      res.json(automations);
    } catch (error) {
      console.error('Error fetching workflow automations:', error);
      res.status(500).json({ error: 'Failed to fetch workflow automations' });
    }
  });

  app.post('/api/workflow-automation', async (req, res) => {
    try {
      const validatedData = insertWorkflowAutomationSchema.parse(req.body);
      const automation = await dbStorage.createWorkflowAutomation(validatedData);
      res.status(201).json(automation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating workflow automation:', error);
      res.status(500).json({ error: 'Failed to create workflow automation' });
    }
  });

  app.put('/api/workflow-automation/:id', async (req, res) => {
    try {
      const validatedData = insertWorkflowAutomationSchema.partial().parse(req.body);
      const automation = await dbStorage.updateWorkflowAutomation(parseInt(req.params.id), validatedData);
      res.json(automation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating workflow automation:', error);
      res.status(500).json({ error: 'Failed to update workflow automation' });
    }
  });

  app.delete('/api/workflow-automation/:id', async (req, res) => {
    try {
      await dbStorage.deleteWorkflowAutomation(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting workflow automation:', error);
      res.status(500).json({ error: 'Failed to delete workflow automation' });
    }
  });

  // Automation Execution endpoints
  app.get('/api/automation-executions', async (req, res) => {
    try {
      const { automationId, status } = req.query;
      const executions = await dbStorage.getAutomationExecutions(
        automationId ? parseInt(automationId as string) : undefined,
        status as string
      );
      res.json(executions);
    } catch (error) {
      console.error('Error fetching automation executions:', error);
      res.status(500).json({ error: 'Failed to fetch automation executions' });
    }
  });

  app.post('/api/automation-executions', async (req, res) => {
    try {
      const validatedData = insertAutomationExecutionSchema.parse(req.body);
      const execution = await dbStorage.createAutomationExecution(validatedData);
      res.status(201).json(execution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating automation execution:', error);
      res.status(500).json({ error: 'Failed to create automation execution' });
    }
  });

  // Team Assignment Rules endpoints
  app.get('/api/team-assignment-rules', async (req, res) => {
    try {
      const rules = await dbStorage.getTeamAssignmentRules();
      res.json(rules);
    } catch (error) {
      console.error('Error fetching team assignment rules:', error);
      res.status(500).json({ error: 'Failed to fetch team assignment rules' });
    }
  });

  app.get('/api/team-assignment-rules/:id', async (req, res) => {
    try {
      const rule = await dbStorage.getTeamAssignmentRule(parseInt(req.params.id));
      if (!rule) {
        return res.status(404).json({ error: 'Team assignment rule not found' });
      }
      res.json(rule);
    } catch (error) {
      console.error('Error fetching team assignment rule:', error);
      res.status(500).json({ error: 'Failed to fetch team assignment rule' });
    }
  });

  app.post('/api/team-assignment-rules', async (req, res) => {
    try {
      const rule = await dbStorage.createTeamAssignmentRule(req.body);
      res.status(201).json(rule);
    } catch (error) {
      console.error('Error creating team assignment rule:', error);
      res.status(500).json({ error: 'Failed to create team assignment rule' });
    }
  });

  app.put('/api/team-assignment-rules/:id', async (req, res) => {
    try {
      const rule = await dbStorage.updateTeamAssignmentRule(parseInt(req.params.id), req.body);
      res.json(rule);
    } catch (error) {
      console.error('Error updating team assignment rule:', error);
      res.status(500).json({ error: 'Failed to update team assignment rule' });
    }
  });

  app.delete('/api/team-assignment-rules/:id', async (req, res) => {
    try {
      await dbStorage.deleteTeamAssignmentRule(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting team assignment rule:', error);
      res.status(500).json({ error: 'Failed to delete team assignment rule' });
    }
  });

  // Revenue Calculation Rules endpoints
  app.get('/api/revenue-calculation-rules', async (req, res) => {
    try {
      const rules = await dbStorage.getRevenueCalculationRules();
      res.json(rules);
    } catch (error) {
      console.error('Error fetching revenue calculation rules:', error);
      res.status(500).json({ error: 'Failed to fetch revenue calculation rules' });
    }
  });

  app.get('/api/revenue-calculation-rules/:id', async (req, res) => {
    try {
      const rule = await dbStorage.getRevenueCalculationRule(parseInt(req.params.id));
      if (!rule) {
        return res.status(404).json({ error: 'Revenue calculation rule not found' });
      }
      res.json(rule);
    } catch (error) {
      console.error('Error fetching revenue calculation rule:', error);
      res.status(500).json({ error: 'Failed to fetch revenue calculation rule' });
    }
  });

  app.post('/api/revenue-calculation-rules', async (req, res) => {
    try {
      const rule = await dbStorage.createRevenueCalculationRule(req.body);
      res.status(201).json(rule);
    } catch (error) {
      console.error('Error creating revenue calculation rule:', error);
      res.status(500).json({ error: 'Failed to create revenue calculation rule' });
    }
  });

  app.put('/api/revenue-calculation-rules/:id', async (req, res) => {
    try {
      const rule = await dbStorage.updateRevenueCalculationRule(parseInt(req.params.id), req.body);
      res.json(rule);
    } catch (error) {
      console.error('Error updating revenue calculation rule:', error);
      res.status(500).json({ error: 'Failed to update revenue calculation rule' });
    }
  });

  app.delete('/api/revenue-calculation-rules/:id', async (req, res) => {
    try {
      await dbStorage.deleteRevenueCalculationRule(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting revenue calculation rule:', error);
      res.status(500).json({ error: 'Failed to delete revenue calculation rule' });
    }
  });

  // Notification Templates endpoints
  app.get('/api/notification-templates', async (req, res) => {
    try {
      const { category } = req.query;
      const templates = await dbStorage.getNotificationTemplates(category as string);
      res.json(templates);
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      res.status(500).json({ error: 'Failed to fetch notification templates' });
    }
  });

  app.get('/api/notification-templates/:id', async (req, res) => {
    try {
      const template = await dbStorage.getNotificationTemplate(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ error: 'Notification template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('Error fetching notification template:', error);
      res.status(500).json({ error: 'Failed to fetch notification template' });
    }
  });

  app.post('/api/notification-templates', async (req, res) => {
    try {
      const template = await dbStorage.createNotificationTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating notification template:', error);
      res.status(500).json({ error: 'Failed to create notification template' });
    }
  });

  app.put('/api/notification-templates/:id', async (req, res) => {
    try {
      const template = await dbStorage.updateNotificationTemplate(parseInt(req.params.id), req.body);
      res.json(template);
    } catch (error) {
      console.error('Error updating notification template:', error);
      res.status(500).json({ error: 'Failed to update notification template' });
    }
  });

  app.delete('/api/notification-templates/:id', async (req, res) => {
    try {
      await dbStorage.deleteNotificationTemplate(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting notification template:', error);
      res.status(500).json({ error: 'Failed to delete notification template' });
    }
  });

  // Automation Logs endpoints
  app.get('/api/automation-logs', async (req, res) => {
    try {
      const { automationId, level } = req.query;
      const logs = await dbStorage.getAutomationLogs(
        automationId ? parseInt(automationId as string) : undefined,
        level as string
      );
      res.json(logs);
    } catch (error) {
      console.error('Error fetching automation logs:', error);
      res.status(500).json({ error: 'Failed to fetch automation logs' });
    }
  });

  app.post('/api/automation-logs', async (req, res) => {
    try {
      const log = await dbStorage.createAutomationLog(req.body);
      res.status(201).json(log);
    } catch (error) {
      console.error('Error creating automation log:', error);
      res.status(500).json({ error: 'Failed to create automation log' });
    }
  });

  // Document Workflows endpoints
  app.get('/api/document-workflows', async (req, res) => {
    try {
      const { documentType } = req.query;
      const workflows = await dbStorage.getDocumentWorkflows(documentType as string);
      res.json(workflows);
    } catch (error) {
      console.error('Error fetching document workflows:', error);
      res.status(500).json({ error: 'Failed to fetch document workflows' });
    }
  });

  app.get('/api/document-workflows/:id', async (req, res) => {
    try {
      const workflow = await dbStorage.getDocumentWorkflow(parseInt(req.params.id));
      if (!workflow) {
        return res.status(404).json({ error: 'Document workflow not found' });
      }
      res.json(workflow);
    } catch (error) {
      console.error('Error fetching document workflow:', error);
      res.status(500).json({ error: 'Failed to fetch document workflow' });
    }
  });

  app.post('/api/document-workflows', async (req, res) => {
    try {
      const workflow = await dbStorage.createDocumentWorkflow(req.body);
      res.status(201).json(workflow);
    } catch (error) {
      console.error('Error creating document workflow:', error);
      res.status(500).json({ error: 'Failed to create document workflow' });
    }
  });

  app.put('/api/document-workflows/:id', async (req, res) => {
    try {
      const workflow = await dbStorage.updateDocumentWorkflow(parseInt(req.params.id), req.body);
      res.json(workflow);
    } catch (error) {
      console.error('Error updating document workflow:', error);
      res.status(500).json({ error: 'Failed to update document workflow' });
    }
  });

  app.delete('/api/document-workflows/:id', async (req, res) => {
    try {
      await dbStorage.deleteDocumentWorkflow(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting document workflow:', error);
      res.status(500).json({ error: 'Failed to delete document workflow' });
    }
  });

  // Bulk Operations endpoints
  app.get('/api/bulk-operations', async (req, res) => {
    try {
      const { status } = req.query;
      const operations = await dbStorage.getBulkOperations(status as string);
      res.json(operations);
    } catch (error) {
      console.error('Error fetching bulk operations:', error);
      res.status(500).json({ error: 'Failed to fetch bulk operations' });
    }
  });

  app.get('/api/bulk-operations/:id', async (req, res) => {
    try {
      const operation = await dbStorage.getBulkOperation(parseInt(req.params.id));
      if (!operation) {
        return res.status(404).json({ error: 'Bulk operation not found' });
      }
      res.json(operation);
    } catch (error) {
      console.error('Error fetching bulk operation:', error);
      res.status(500).json({ error: 'Failed to fetch bulk operation' });
    }
  });

  app.post('/api/bulk-operations', async (req, res) => {
    try {
      const operation = await dbStorage.createBulkOperation(req.body);
      res.status(201).json(operation);
    } catch (error) {
      console.error('Error creating bulk operation:', error);
      res.status(500).json({ error: 'Failed to create bulk operation' });
    }
  });

  app.put('/api/bulk-operations/:id', async (req, res) => {
    try {
      const operation = await dbStorage.updateBulkOperation(parseInt(req.params.id), req.body);
      res.json(operation);
    } catch (error) {
      console.error('Error updating bulk operation:', error);
      res.status(500).json({ error: 'Failed to update bulk operation' });
    }
  });

  // Automation Processing endpoints
  app.post('/api/automation/process', async (req, res) => {
    try {
      await dbStorage.processAutomations();
      res.json({ success: true, message: 'Automation processing started' });
    } catch (error) {
      console.error('Error processing automations:', error);
      res.status(500).json({ error: 'Failed to process automations' });
    }
  });

  app.post('/api/automation/execute/:id', async (req, res) => {
    try {
      const { entityId, entityType } = req.body;
      await dbStorage.executeAutomation(parseInt(req.params.id), entityId, entityType);
      res.json({ success: true, message: 'Automation executed successfully' });
    } catch (error) {
      console.error('Error executing automation:', error);
      res.status(500).json({ error: 'Failed to execute automation' });
    }
  });

  app.post('/api/automation/assign-deals', async (req, res) => {
    try {
      const { dealIds, ruleId } = req.body;
      await dbStorage.assignDealsToTeam(dealIds, ruleId);
      res.json({ success: true, message: 'Deals assigned successfully' });
    } catch (error) {
      console.error('Error assigning deals:', error);
      res.status(500).json({ error: 'Failed to assign deals' });
    }
  });

  app.post('/api/automation/calculate-revenue/:dealId', async (req, res) => {
    try {
      await dbStorage.calculateRevenue(parseInt(req.params.dealId));
      res.json({ success: true, message: 'Revenue calculated successfully' });
    } catch (error) {
      console.error('Error calculating revenue:', error);
      res.status(500).json({ error: 'Failed to calculate revenue' });
    }
  });

  app.post('/api/automation/generate-document/:dealId', async (req, res) => {
    try {
      const { documentType } = req.body;
      await dbStorage.generateDocument(parseInt(req.params.dealId), documentType);
      res.json({ success: true, message: 'Document generated successfully' });
    } catch (error) {
      console.error('Error generating document:', error);
      res.status(500).json({ error: 'Failed to generate document' });
    }
  });

  app.post('/api/automation/send-notification', async (req, res) => {
    try {
      const { templateId, entityId, entityType } = req.body;
      await dbStorage.sendNotification(templateId, entityId, entityType);
      res.json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // Saved Searches endpoints
  app.get('/api/saved-searches', async (req, res) => {
    try {
      const searches = await dbStorage.getSavedSearches();
      res.json(searches);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      res.status(500).json({ error: 'Failed to fetch saved searches' });
    }
  });

  app.post('/api/saved-searches', async (req, res) => {
    try {
      const search = await dbStorage.createSavedSearch(req.body);
      res.status(201).json(search);
    } catch (error) {
      console.error('Error creating saved search:', error);
      res.status(500).json({ error: 'Failed to create saved search' });
    }
  });

  // Smart Pitch Matching endpoints
  app.post('/api/smart-pitch-analyze', async (req, res) => {
    try {
      const { songs, projectBrief } = req.body;
      const { generatePitchRecommendations } = await import('./openai');
      
      const recommendations = await generatePitchRecommendations(songs, projectBrief);
      res.json(recommendations);
    } catch (error) {
      console.error('Error generating pitch recommendations:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  app.post('/api/analyze-lyrics', async (req, res) => {
    try {
      const { lyrics } = req.body;
      const { analyzeLyrics } = await import('./openai');
      
      const analysis = await analyzeLyrics(lyrics);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing lyrics:', error);
      res.status(500).json({ error: 'Failed to analyze lyrics' });
    }
  });

  app.post('/api/generate-contract', async (req, res) => {
    try {
      const { dealData, templateType } = req.body;
      const { generateContractFromTemplate } = await import('./openai');
      
      const contract = await generateContractFromTemplate(dealData, templateType);
      res.json({ contract });
    } catch (error) {
      console.error('Error generating contract:', error);
      res.status(500).json({ error: 'Failed to generate contract' });
    }
  });

  // Invoice Management endpoints
  app.get('/api/invoices', async (req, res) => {
    try {
      // Mock data for invoices since we haven't implemented the storage methods yet
      res.json([]);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  });

  app.post('/api/invoices', async (req, res) => {
    try {
      // Mock implementation - would store in database
      res.status(201).json({ id: Date.now(), ...req.body });
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  });

  // Expense Tracking endpoints
  app.get('/api/expenses', async (req, res) => {
    try {
      // Mock data for expenses since we haven't implemented the storage methods yet
      res.json([]);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  });

  app.post('/api/expenses', async (req, res) => {
    try {
      // Mock implementation - would store in database
      res.status(201).json({ id: Date.now(), ...req.body });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  });

  // Advanced Analytics endpoints
  app.get('/api/analytics/revenue', async (req, res) => {
    try {
      const { timeRange = '1y', startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const analytics = await dbStorage.getRevenueAnalytics(timeRange as string, start, end);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      res.status(500).json({ error: 'Failed to fetch revenue analytics' });
    }
  });

  app.get('/api/analytics/deal-performance', async (req, res) => {
    try {
      const { timeRange = '1y', startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const analytics = await dbStorage.getDealPerformanceAnalytics(timeRange as string, start, end);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching deal performance analytics:', error);
      res.status(500).json({ error: 'Failed to fetch deal performance analytics' });
    }
  });

  app.get('/api/analytics/music-catalog', async (req, res) => {
    try {
      const { timeRange = '1y', startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const analytics = await dbStorage.getMusicCatalogAnalytics(timeRange as string, start, end);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching music catalog analytics:', error);
      res.status(500).json({ error: 'Failed to fetch music catalog analytics' });
    }
  });

  app.get('/api/analytics/forecast', async (req, res) => {
    try {
      const { timeRange = '1y' } = req.query;
      
      const analytics = await dbStorage.getFinancialForecastAnalytics(timeRange as string);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching financial forecast analytics:', error);
      res.status(500).json({ error: 'Failed to fetch financial forecast analytics' });
    }
  });

  app.get('/api/analytics/comprehensive', async (req, res) => {
    try {
      const { timeRange = '1y', startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const analytics = await dbStorage.getComprehensiveAnalytics(timeRange as string, start, end);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error);
      res.status(500).json({ error: 'Failed to fetch comprehensive analytics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
