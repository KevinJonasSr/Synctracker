# 🎵 SyncTracker App Preview

## What Your Sync Person Will See

---

## 🏠 Landing Page (Before Login)

When first accessing SyncTracker, users see a professional landing page featuring:
- **SyncTracker branding and logo**
- **Login with Replit** button (or your configured auth)
- Brief description of features
- Clean, modern design

---

## 📊 Dashboard (Main Screen)

After logging in, users land on the **Dashboard** - their command center:

### Top Metrics (4 Cards)
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  Active Deals   │  Total Revenue  │ Pending Payments│   Total Songs   │
│      15         │   $125,000      │    $25,000      │      250        │
│  ↑ 3 this week  │  ↑ $15K this mo │   3 invoices    │  ↑ 12 this mo   │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Deal Pipeline (Visual Chart)
Shows deals by status with counts:
- 🆕 New Request (5)
- ⏳ Pending Approval (2)
- 💰 Quoted (3)
- ✅ Use Confirmed (4)
- 📝 Being Drafted (1)
- ✍️ Out for Signature (0)
- 💸 Payment Received (0)
- ✔️ Completed (3)

### Recent Activity Feed
```
📝 Deal "Nike Summer Campaign" status changed to Quoted
🎵 New song "Summer Vibes" added to catalog
💰 Payment received for "ABC Productions - Episode 5"
👤 Contact "Jane Smith - Music Supervisor" updated
📧 Email sent to "John Doe" regarding "Ford Commercial"
```

### Urgent Actions (Alerts)
```
⚠️ Payment overdue: "ABC Productions - Episode 3" ($5,000)
⏰ Response due: Follow up on "Netflix Series" pitch
📄 Contract approval needed: "Coca-Cola Holiday Campaign"
```

### Quick Action Buttons
```
[+ Add New Song]  [+ Create Pitch]  [+ Add Contact]  [📊 View Reports]
```

---

## 🎵 Songs Page

Complete music catalog management:

### Header
```
Songs                                           [Search: ______] [+ Add Song]
Track your music catalog with ownership details
```

### Song List (Table View)
```
┌──────────────────────┬──────────────┬────────┬───────┬──────────────┬─────────┐
│ Title                │ Artist       │ Genre  │ BPM   │ Ownership    │ Actions │
├──────────────────────┼──────────────┼────────┼───────┼──────────────┼─────────┤
│ Summer Vibes         │ Cool Artist  │ Pop    │ 120   │ Pub: 50%     │ [Edit]  │
│                      │              │        │       │ Master: 100% │ [View]  │
├──────────────────────┼──────────────┼────────┼───────┼──────────────┼─────────┤
│ Midnight Dreams      │ Jazz Trio    │ Jazz   │ 90    │ Pub: 75%     │ [Edit]  │
│                      │              │        │       │ Master: 50%  │ [View]  │
└──────────────────────┴──────────────┴────────┴───────┴──────────────┴─────────┘
```

### Filters
- Genre dropdown
- Mood selector
- Ownership type
- Search by title/artist

### Add Song Form
Fields include:
- **Basic**: Title, Artist, Album, Genre, Mood
- **Technical**: BPM, Key, Duration, Tempo
- **Metadata**: Description, Tags, Lyrics
- **Ownership**: Publishing %, Master %, Splits
- **Publishing Details**: Composers, Publishers, Shares
- **Master Details**: Artists, Labels, Ownership %

---

## 💼 Deals Page

Track sync licensing opportunities:

### Deal Pipeline View
Visual board with columns for each status:
```
New Request    |  Quoted      |  Use Confirmed  |  Completed
───────────────┼──────────────┼─────────────────┼──────────
Nike Campaign  │ Ford Ad      │ Netflix S01E03  │ HBO Drama
$5,000        │ $3,500       │ $8,000          │ $12,000
              │              │                 │
ABC Series    │ Apple Spot   │                 │
$TBD          │ $2,000       │                 │
```

### Deal Details (Click any deal)
```
┌─────────────────────────────────────────────────────────┐
│ Nike Summer Campaign - Commercial                       │
├─────────────────────────────────────────────────────────┤
│ Song: "Summer Vibes" by Cool Artist                    │
│ Contact: Jane Smith - Music Supervisor @ Nike          │
│                                                         │
│ Project Details:                                        │
│ • Type: Commercial                                      │
│ • Usage: Background                                     │
│ • Territory: Worldwide                                  │
│ • Term: Perpetual                                       │
│                                                         │
│ Financial:                                              │
│ • Deal Value: $5,000                                    │
│ • Our Fee: $2,500 (after splits)                       │
│ • Status: Quoted                                        │
│ • Quoted Date: Jan 15, 2026                            │
│                                                         │
│ Timeline:                                               │
│ • Air Date: March 1, 2026                              │
│ • Payment Due: March 15, 2026                          │
│                                                         │
│ [Update Status ▼] [Send Email] [Generate Contract]     │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 Contacts Page

Client and music supervisor management:

### Contact List
```
┌─────────────────────┬──────────────────┬──────────────────┬──────────┐
│ Name                │ Company          │ Role             │ Deals    │
├─────────────────────┼──────────────────┼──────────────────┼──────────┤
│ Jane Smith          │ Nike             │ Music Supervisor │ 5 active │
│ jane@nike.com       │                  │                  │ 12 total │
├─────────────────────┼──────────────────┼──────────────────┼──────────┤
│ John Producer       │ ABC Productions  │ Creative Director│ 3 active │
│ john@abcprod.com    │                  │                  │ 8 total  │
└─────────────────────┴──────────────────┴──────────────────┴──────────┘
```

### Contact Profile View
```
Jane Smith - Music Supervisor
═══════════════════════════════

Contact Information:
📧 jane@nike.com
📱 +1-555-1234
🏢 Nike Inc., Portland, OR

Preferences:
🎵 Genres: Pop, Electronic, Indie
💰 Budget Range: $2,000 - $10,000
📺 Project Types: Commercials, Digital

Performance:
✅ Success Rate: 65% (13/20 pitches)
💵 Total Revenue: $45,000
📅 Last Contact: Jan 10, 2026

Recent Deals:
• Nike Summer Campaign - $5,000 (Quoted)
• Nike Holiday Spot 2025 - $8,000 (Completed)
• Nike App Launch - $3,500 (Completed)

Notes:
Prefers upbeat, modern tracks. Quick response time.
Typically approves within 48 hours. Pays on time.
```

---

## 📅 Calendar Page

Visual calendar with all important dates:

### Month View
```
January 2026
─────────────────────────────────────────────────────
Sun  Mon  Tue  Wed  Thu  Fri  Sat
                  1    2    3    4
 5    6    7    8    9   10   11
     📅        💰
12   13   14   15   16   17   18
          ✉️        📝
19   20   21   22   23   24   25
     💸             📺
26   27   28   29   30   31
```

Legend:
- 📅 Pitch follow-up due
- 💰 Payment due date
- ✉️ Contract deadline
- 📝 Contract signed
- 💸 Payment received
- 📺 Air date

### Day View (Click any date)
```
January 15, 2026
════════════════

10:00 AM  Follow up: Nike Summer Campaign
          Contact: Jane Smith
          Status: Quoted, waiting for approval
          [Send Follow-up Email]

2:00 PM   Payment Due: ABC Series Episode 3
          Amount: $5,000
          Status: Overdue ⚠️
          [Send Reminder]

5:00 PM   Air Date: Netflix Documentary
          Project: "Music in Motion"
          Song: "Midnight Dreams"
          [Add to Portfolio]
```

---

## 💰 Income Page

Revenue tracking and financial analytics:

### Overview Cards
```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ This Month       │ This Quarter     │ This Year        │ All Time         │
│   $15,000        │    $42,000       │   $125,000       │   $450,000       │
│   ↑ 25%          │    ↑ 15%         │    ↑ 35%         │                  │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

### Revenue Chart (Line Graph)
```
$20K │                                  ●
     │                            ●   ●
$15K │                      ●   ●
     │                ●   ●
$10K │          ●   ●
     │    ●   ●
$5K  │  ●
     └──────────────────────────────────
      Jan Feb Mar Apr May Jun Jul Aug
```

### Revenue by Source
```
┌──────────────────┬──────────┬──────────┐
│ Project Type     │ Deals    │ Revenue  │
├──────────────────┼──────────┼──────────┤
│ TV Commercials   │ 15       │ $65,000  │
│ Film             │ 8        │ $35,000  │
│ TV Series        │ 12       │ $20,000  │
│ Digital/Streaming│ 10       │ $5,000   │
└──────────────────┴──────────┴──────────┘
```

### Payment Status
```
Received: $100,000 (80%)  ████████░░
Pending:  $25,000  (20%)  ██░░░░░░░░
```

---

## 📊 Reports & Analytics

Detailed insights and metrics:

### Dashboard Sections

**1. Deal Performance**
- Win rate by genre
- Average deal size
- Time to close
- Conversion funnel

**2. Song Performance**
- Most licensed songs
- Revenue per song
- Success rate by mood/genre
- Catalog utilization

**3. Client Analytics**
- Top clients by revenue
- Response rates
- Average project value
- Client lifetime value

**4. Trend Analysis**
- Monthly revenue trends
- Seasonal patterns
- Genre popularity
- Market insights

### Export Options
- 📄 PDF Report
- 📊 Excel Spreadsheet
- 📈 CSV Data
- 📧 Email Report

---

## 📝 Email Templates Page

Manage communication templates:

### Template List
```
┌─────────────────────────┬──────────────┬────────────────┐
│ Template Name           │ Stage        │ Variables      │
├─────────────────────────┼──────────────┼────────────────┤
│ Initial Pitch           │ Pitching     │ 5 variables    │
│ Follow-up - No Response │ Follow-up    │ 4 variables    │
│ Quote Submitted         │ Negotiation  │ 7 variables    │
│ Contract Ready          │ Contracting  │ 6 variables    │
│ Payment Reminder        │ Collection   │ 5 variables    │
└─────────────────────────┴──────────────┴────────────────┘
```

### Template Editor
```
Template: Initial Pitch
Stage: Pitching
──────────────────────────

Subject: Perfect Song for {{projectName}}

Body:
Hi {{contactName}},

I hope this email finds you well! I wanted to reach out about
{{projectName}}. I have the perfect track for your project:

Song: {{songTitle}}
Artist: {{artistName}}
Genre: {{genre}}
Mood: {{mood}}

This track would be ideal because {{reasonForFit}}.

I've attached an MP3 for your review. Let me know if you'd like
to discuss licensing terms.

Best regards,
{{yourName}}

Available Variables:
• {{contactName}}  • {{projectName}}  • {{songTitle}}
• {{artistName}}   • {{genre}}        • {{mood}}
• {{reasonForFit}} • {{yourName}}

[Save Template]  [Preview]  [Send Test]
```

---

## 🎼 Playlists Page

Organize songs for pitching:

### Playlist Grid
```
┌────────────────────────┬────────────────────────┬────────────────────────┐
│ 🎅 Holiday 2026        │ 🏖️ Summer Vibes        │ 🎬 Cinematic           │
│ 45 songs               │ 32 songs               │ 28 songs               │
│ For seasonal campaigns │ Upbeat summer tracks   │ Epic orchestral        │
│ [Open]                 │ [Open]                 │ [Open]                 │
├────────────────────────┼────────────────────────┼────────────────────────┤
│ 📺 Nike Client         │ 🎵 Indie Acoustic      │ 💪 High Energy         │
│ 18 songs               │ 25 songs               │ 40 songs               │
│ Curated for Nike      │ Singer-songwriter      │ Workout & sports       │
│ [Open]                 │ [Open]                 │ [Open]                 │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

### Playlist Detail View
```
Holiday 2026 Playlist
═══════════════════════

Description: Curated collection of holiday songs for 2026 campaigns
Type: Seasonal
Songs: 45
Created: Oct 15, 2025
Last Updated: Jan 10, 2026

Songs in this playlist:
┌──────────────────────┬──────────────┬────────┬────────┐
│ Title                │ Artist       │ Genre  │ Added  │
├──────────────────────┼──────────────┼────────┼────────┤
│ Winter Wonderland    │ Jazz Ensemble│ Jazz   │ Oct 15 │
│ Jingle All The Way   │ Pop Stars    │ Pop    │ Oct 16 │
│ Silent Celebration   │ Choir        │ Classical│ Oct 20│
└──────────────────────┴──────────────┴────────┴────────┘

[Add Songs]  [Remove Selected]  [Share Playlist]  [Export]
```

---

## 🎯 Pitches Page

Track all song submissions:

### Pitch List
```
┌─────────────────────┬──────────────┬──────────┬────────────┬──────────┐
│ Project             │ Song         │ Contact  │ Status     │ Date     │
├─────────────────────┼──────────────┼──────────┼────────────┼──────────┤
│ Nike Campaign       │ Summer Vibes │ Jane S.  │ ⏳ Pending │ Jan 10   │
│ ABC Series Ep 5     │ Night Jazz   │ John P.  │ ✅ Accepted│ Jan 8    │
│ Ford Commercial     │ Drive Away   │ Lisa M.  │ ⏳ Pending │ Jan 5    │
│ Netflix Doc         │ Epic Journey │ Mike R.  │ ❌ Declined│ Jan 3    │
└─────────────────────┴──────────────┴──────────┴────────────┴──────────┘
```

### Filter & Sort
- Status: All / Pending / Accepted / Declined / No Response
- Date range picker
- Contact filter
- Song filter

### Pitch Details
```
Pitch: Nike Summer Campaign
═══════════════════════════════

Song: "Summer Vibes" by Cool Artist
Contact: Jane Smith (Nike)
Submitted: January 10, 2026
Follow-up Date: January 17, 2026

Status: ⏳ Pending Response

Project Brief:
National TV commercial for Nike's summer shoe line.
Looking for upbeat, energetic track with positive vibes.
Target audience: 18-35 year olds.

Why This Song:
Perfect tempo (120 BPM), upbeat mood matches brand energy,
lyrics align with summer/freedom theme.

Notes:
Jane mentioned she's reviewing 5 tracks total.
Typical response time: 3-5 business days.

[Send Follow-up]  [Update Status]  [View Deal]
```

---

## ⚙️ Settings & Profile

User preferences and account settings:

### Sections
- **Profile**: Name, email, photo
- **Preferences**: Notifications, email frequency
- **Integrations**: Spotify, Apple Music, Dropbox
- **Team**: Add users, set permissions
- **Billing**: Subscription, payment method
- **Data**: Export, backup, import

---

## 📱 Responsive Design

SyncTracker works on all devices:

### Desktop (1920x1080)
- Full sidebar navigation
- Multi-column layouts
- Detailed tables
- Rich visualizations

### Tablet (768x1024)
- Collapsible sidebar
- Responsive grids
- Touch-friendly buttons
- Optimized forms

### Mobile (375x667)
- Bottom navigation
- Single-column layouts
- Swipe gestures
- Mobile-optimized inputs

---

## 🎨 Design Features

### Color Scheme
- **Primary**: Blue (#3B82F6) - Actions, links
- **Secondary**: Emerald (#10B981) - Success, positive
- **Accent**: Purple (#8B5CF6) - Special features
- **Neutral**: Gray scale - Backgrounds, text

### Dark Mode Support
- Toggle in header
- Eye-friendly at night
- Reduced blue light
- Preserves contrast

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators

---

## 🔔 Notifications

Users get notified about:
- New deals created
- Status changes
- Payment received
- Upcoming deadlines
- Follow-up reminders
- Contract approvals
- Overdue payments

---

## 🚀 Key Features Summary

✅ **Music Catalog**: Complete song library with ownership tracking
✅ **Deal Pipeline**: Visual tracking from pitch to payment
✅ **Contact CRM**: Relationship management with profiles
✅ **Revenue Tracking**: Real-time financial analytics
✅ **Calendar**: Never miss deadlines or air dates
✅ **Email Templates**: Professional communications
✅ **Playlists**: Organize for efficient pitching
✅ **Reports**: Detailed insights and analytics
✅ **Smart Matching**: AI-powered pitch suggestions
✅ **Mobile Ready**: Works on all devices
✅ **Dark Mode**: Eye-friendly interface
✅ **Search**: Quick find across all data

---

## 💡 What Makes It Special

1. **Purpose-Built**: Designed specifically for sync licensing
2. **Complete Workflow**: Pitch to payment in one system
3. **Financial Focus**: Track ownership splits and revenue
4. **Relationship-Driven**: Build and maintain client relationships
5. **Time-Saving**: Templates, automation, quick actions
6. **Insightful**: Analytics help make better decisions
7. **Professional**: Polished interface for client-facing work
8. **Modern Stack**: Fast, reliable, secure

---

**This is what your sync person will experience every day - a professional, comprehensive tool for managing their sync licensing business!** 🎵

