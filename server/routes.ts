import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { 
  insertSongSchema, insertContactSchema, insertDealSchema,
  insertPitchSchema, insertPaymentSchema, insertTemplateSchema,
  insertEmailTemplateSchema, insertAttachmentSchema, insertCalendarEventSchema,
  type InsertTemplate
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

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
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|aiff|flac|m4a|zip|rar|xlsx|xls|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'text/csv';
    
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
      
      res.json(deal);
    } catch (error) {
      console.error("Error creating deal:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create deal", details: error.message });
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
    } catch (error) {
      console.error("Error updating deal:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update deal", details: error.message });
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
      
      const deal = await dbStorage.updateDeal(id, processedData);
      console.log("Updated deal:", deal);
      
      res.json(deal);
    } catch (error) {
      console.error("Error updating deal:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update deal", details: error.message });
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

  // Bulk import deals endpoints
  app.post("/api/deals/import/parse", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      let workbook;
      if (fileExtension === '.csv') {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        workbook = XLSX.read(fileContent, { type: 'string' });
      } else {
        workbook = XLSX.readFile(filePath);
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      // Get headers
      const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        headers,
        preview: jsonData.slice(0, 10), // First 10 rows for preview
        data: jsonData, // Full dataset for import
        totalRows: jsonData.length
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error("Error cleaning up file:", cleanupError);
        }
      }
      res.status(500).json({ error: "Failed to parse file", details: error.message });
    }
  });

  app.post("/api/deals/import/create", async (req, res) => {
    try {
      const { data, mapping, autoCreateSongs, autoCreateContacts } = req.body;

      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format" });
      }

      if (!mapping || typeof mapping !== 'object') {
        return res.status(400).json({ error: "Missing column mapping" });
      }

      const results = {
        created: 0,
        failed: 0,
        errors: [] as Array<{ row: number; error: string }>
      };

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          
          // Map columns to deal fields
          const dealData: any = {
            projectName: row[mapping.projectName] || 'Untitled Project',
            projectType: row[mapping.projectType] || 'other',
            songId: null,
            contactId: null,
            status: row[mapping.status] || 'new_request',
            territory: row[mapping.territory] || 'worldwide',
            exclusivity: row[mapping.exclusivity]?.toLowerCase() === 'exclusive' || row[mapping.exclusivity]?.toLowerCase() === 'true',
            projectDescription: row[mapping.projectDescription] || null,
            term: row[mapping.term] || null,
            usage: row[mapping.usage] || null,
            totalFee: row[mapping.totalFee] ? parseFloat(row[mapping.totalFee]) : null,
            publishingFee: row[mapping.publishingFee] ? parseFloat(row[mapping.publishingFee]) : null,
            recordingFee: row[mapping.recordingFee] ? parseFloat(row[mapping.recordingFee]) : null,
            notes: row[mapping.notes] || null,
            airDate: row[mapping.airDate] ? new Date(row[mapping.airDate]) : null
          };

          // Handle song - find existing or create new
          if (mapping.songTitle && row[mapping.songTitle]) {
            const songTitle = row[mapping.songTitle];
            const songs = await dbStorage.getSongs(songTitle);
            let song = songs.find(s => s.title.toLowerCase() === songTitle.toLowerCase());
            
            if (!song && autoCreateSongs) {
              // Create new song
              const songData: any = {
                title: songTitle,
                artist: row[mapping.songArtist] || 'Unknown Artist'
              };
              if (mapping.songComposer && row[mapping.songComposer]) {
                songData.composer = row[mapping.songComposer];
              }
              if (mapping.songPublisher && row[mapping.songPublisher]) {
                songData.publisher = row[mapping.songPublisher];
              }
              song = await dbStorage.createSong(songData);
            }
            
            if (song) {
              dealData.songId = song.id;
            }
          }

          // Handle contact - find existing or create new
          if (mapping.contactName && row[mapping.contactName]) {
            const contactName = row[mapping.contactName];
            const contacts = await dbStorage.getContacts(contactName);
            let contact = contacts.find(c => c.name.toLowerCase() === contactName.toLowerCase());
            
            if (!contact && autoCreateContacts) {
              // Create new contact
              const contactData: any = {
                name: contactName,
                email: row[mapping.contactEmail] || null,
                phone: row[mapping.contactPhone] || null,
                company: row[mapping.contactCompany] || null
              };
              contact = await dbStorage.createContact(contactData);
            }
            
            if (contact) {
              dealData.contactId = contact.id;
            }
          }

          // Create the deal
          await dbStorage.createDeal(dealData);
          results.created++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error importing deals:", error);
      res.status(500).json({ error: "Failed to import deals", details: error.message });
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
    } catch (error) {
      console.error("Error creating pitch:", error);
      res.status(500).json({ error: "Failed to create pitch", details: error.message });
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
    } catch (error) {
      console.error("Error updating pitch:", error);
      res.status(500).json({ error: "Failed to update pitch", details: error.message });
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

  app.post("/api/templates/:id/duplicate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      const templates = await dbStorage.getTemplates();
      const original = templates.find(t => t.id === id);
      
      if (!original) {
        return res.status(404).json({ error: "Template not found" });
      }

      const copyData: InsertTemplate = {
        name: name || `${original.name} (Copy)`,
        type: original.type,
        content: original.content,
      };

      const newTemplate = await dbStorage.createTemplate(copyData);
      res.json(newTemplate);
    } catch (error) {
      res.status(500).json({ error: "Failed to duplicate template" });
    }
  });

  app.get("/api/templates/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const templates = await dbStorage.getTemplates();
      const template = templates.find(t => t.id === id);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const filename = `${template.name || 'template'}.txt`;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(template.content);
    } catch (error) {
      res.status(500).json({ error: "Failed to download template" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await dbStorage.updateTemplate(id, validatedData);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await dbStorage.deleteTemplate(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
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
            airDate: event.startDate 
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
      const automation = await dbStorage.createWorkflowAutomation(req.body);
      res.status(201).json(automation);
    } catch (error) {
      console.error('Error creating workflow automation:', error);
      res.status(500).json({ error: 'Failed to create workflow automation' });
    }
  });

  app.put('/api/workflow-automation/:id', async (req, res) => {
    try {
      const automation = await dbStorage.updateWorkflowAutomation(parseInt(req.params.id), req.body);
      res.json(automation);
    } catch (error) {
      console.error('Error updating workflow automation:', error);
      res.status(500).json({ error: 'Failed to update workflow automation' });
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

  const httpServer = createServer(app);
  return httpServer;
}
