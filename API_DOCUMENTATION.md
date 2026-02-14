# SyncTracker API Documentation

## Base URL
```
http://localhost:5000/api
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## Authentication

Currently uses Replit authentication. Include authentication headers with all requests.

## Rate Limiting

- **Default**: 100 requests per 15 minutes
- **Strict endpoints**: 10 requests per 15 minutes
- Rate limit headers included in all responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Health & Monitoring

### Health Check
Check overall system health including database connectivity and memory usage.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-17T10:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 15
    },
    "memory": {
      "status": "ok",
      "used": 50000000,
      "total": 100000000,
      "percentage": 50.0
    },
    "environment": {
      "nodeEnv": "production",
      "nodeVersion": "v22.22.0"
    }
  }
}
```

### Readiness Check
Check if the service is ready to accept traffic.

**Endpoint**: `GET /ready`

**Response**:
```json
{
  "ready": true,
  "timestamp": "2026-01-17T10:00:00.000Z"
}
```

### Liveness Check
Check if the service is alive.

**Endpoint**: `GET /live`

**Response**:
```json
{
  "alive": true,
  "timestamp": "2026-01-17T10:00:00.000Z",
  "uptime": 3600
}
```

---

## Songs

### List Songs
Get a paginated list of all songs.

**Endpoint**: `GET /api/songs`

**Query Parameters**:
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 50, max: 100) - Items per page
- `search` (string) - Search term for title, artist, or album
- `genre` (string) - Filter by genre
- `artist` (string) - Filter by artist

**Example Request**:
```
GET /api/songs?page=1&limit=10&search=love&genre=pop
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Love Song",
      "artist": "John Doe",
      "album": "Greatest Hits",
      "genre": "Pop",
      "bpm": 120,
      "duration": 210,
      "publishingOwnership": "50.00",
      "masterOwnership": "100.00",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Get Song by ID
Get detailed information about a specific song.

**Endpoint**: `GET /api/songs/:id`

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Love Song",
    "artist": "John Doe",
    "album": "Greatest Hits",
    "composer": "John Doe, Jane Smith",
    "producer": "Big Producer",
    "publisher": "Music Publishing Co.",
    "genre": "Pop",
    "mood": "Happy",
    "tempo": 120,
    "duration": 210,
    "key": "C Major",
    "bpm": 120,
    "description": "An upbeat love song",
    "tags": ["love", "happy", "commercial"],
    "publishingOwnership": "50.00",
    "masterOwnership": "100.00",
    "composerPublishers": [
      {
        "composer": "John Doe",
        "publisher": "Music Publishing Co.",
        "publishingOwnership": "50.00",
        "isMine": true,
        "jonasShare": "25.00"
      }
    ],
    "artistLabels": [
      {
        "artist": "John Doe",
        "label": "Indie Records",
        "labelOwnership": "100.00",
        "isMine": true,
        "jonasShare": "50.00"
      }
    ],
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### Create Song
Add a new song to the catalog.

**Endpoint**: `POST /api/songs`

**Request Body**:
```json
{
  "title": "New Song",
  "artist": "Artist Name",
  "album": "Album Name",
  "genre": "Pop",
  "mood": "Energetic",
  "tempo": 128,
  "duration": 180,
  "key": "A Minor",
  "bpm": 128,
  "description": "Description of the song",
  "tags": ["energetic", "commercial"],
  "publishingOwnership": "50.00",
  "masterOwnership": "100.00"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "New Song",
    ...
  }
}
```

### Update Song
Update an existing song.

**Endpoint**: `PATCH /api/songs/:id`

**Request Body** (partial update supported):
```json
{
  "title": "Updated Title",
  "genre": "Rock"
}
```

### Delete Song
Delete a song from the catalog.

**Endpoint**: `DELETE /api/songs/:id`

**Example Response**:
```json
{
  "success": true,
  "data": {
    "message": "Song deleted successfully"
  }
}
```

---

## Contacts

### List Contacts
Get a paginated list of all contacts.

**Endpoint**: `GET /api/contacts`

**Query Parameters**:
- `page` (integer) - Page number
- `limit` (integer) - Items per page
- `search` (string) - Search by name, email, or company

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Jane Producer",
      "email": "jane@example.com",
      "phone": "+1-555-1234",
      "company": "ABC Productions",
      "role": "Music Supervisor",
      "notes": "Works on major TV shows",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

### Create Contact
Add a new contact.

**Endpoint**: `POST /api/contacts`

**Request Body**:
```json
{
  "name": "New Contact",
  "email": "contact@example.com",
  "phone": "+1-555-5678",
  "company": "XYZ Studios",
  "role": "Creative Director",
  "notes": "Met at music conference"
}
```

---

## Deals

### List Deals
Get a paginated list of all deals.

**Endpoint**: `GET /api/deals`

**Query Parameters**:
- `page` (integer) - Page number
- `limit` (integer) - Items per page
- `status` (string) - Filter by status (new request, quoted, use confirmed, completed, etc.)
- `projectType` (string) - Filter by project type (tv, film, commercial, etc.)
- `contactId` (integer) - Filter by contact
- `songId` (integer) - Filter by song

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "projectName": "Summer TV Campaign",
      "episodeNumber": "S01E05",
      "projectType": "commercial",
      "projectDescription": "National car commercial",
      "songId": 5,
      "contactId": 3,
      "status": "use confirmed",
      "dealValue": "5000.00",
      "usage": "background",
      "media": "TV",
      "territory": "worldwide",
      "term": "perpetual",
      "exclusivity": false,
      "createdAt": "2026-01-15T00:00:00.000Z",
      "song": {
        "id": 5,
        "title": "Summer Vibes",
        "artist": "Cool Artist"
      },
      "contact": {
        "id": 3,
        "name": "Jane Producer",
        "company": "ABC Productions"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "totalPages": 1
  }
}
```

### Get Deal by ID
Get detailed information about a specific deal.

**Endpoint**: `GET /api/deals/:id`

### Create Deal
Create a new deal.

**Endpoint**: `POST /api/deals`

**Request Body**:
```json
{
  "projectName": "New Project",
  "projectType": "tv",
  "projectDescription": "Episode description",
  "songId": 5,
  "contactId": 3,
  "status": "new request",
  "dealValue": "2500.00",
  "usage": "featured",
  "media": "TV",
  "territory": "North America",
  "term": "5 years"
}
```

### Update Deal Status
Update the status of a deal.

**Endpoint**: `PATCH /api/deals/:id/status`

**Request Body**:
```json
{
  "status": "use confirmed"
}
```

---

## Pitches

### Create Pitch
Submit a pitch for a deal.

**Endpoint**: `POST /api/pitches`

**Request Body**:
```json
{
  "dealId": 5,
  "notes": "Perfect fit for the emotional scene"
}
```

### Update Pitch Status
Update the status of a pitch.

**Endpoint**: `PATCH /api/pitches/:id`

**Request Body**:
```json
{
  "status": "responded",
  "notes": "Client loved it!"
}
```

---

## Playlists

### List Playlists
Get all playlists.

**Endpoint**: `GET /api/playlists`

### Create Playlist
Create a new playlist.

**Endpoint**: `POST /api/playlists`

**Request Body**:
```json
{
  "name": "Summer Vibes",
  "description": "Upbeat songs for summer campaigns",
  "type": "mood",
  "isPublic": false
}
```

### Add Songs to Playlist
Add songs to a playlist.

**Endpoint**: `POST /api/playlists/:id/songs`

**Request Body**:
```json
{
  "songIds": [1, 5, 12, 23]
}
```

---

## Analytics

### Dashboard Metrics
Get dashboard analytics and metrics.

**Endpoint**: `GET /api/analytics/dashboard`

**Example Response**:
```json
{
  "success": true,
  "data": {
    "activeDeals": 15,
    "totalRevenue": 125000.00,
    "pendingPayments": 25000.00,
    "totalSongs": 250,
    "dealsByStatus": {
      "new request": 5,
      "quoted": 3,
      "use confirmed": 4,
      "completed": 3
    },
    "recentActivity": [...],
    "urgentActions": [...]
  }
}
```

### Revenue Report
Get revenue analytics.

**Endpoint**: `GET /api/analytics/revenue`

**Query Parameters**:
- `startDate` (date) - Start date for report
- `endDate` (date) - End date for report

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_ID` | 400 | Invalid ID parameter |
| `INVALID_PAGE` | 400 | Invalid page parameter |
| `INVALID_LIMIT` | 400 | Invalid limit parameter |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database operation failed |

---

## Pagination

All list endpoints support pagination:
- Default page size: 50 items
- Maximum page size: 100 items
- Page numbers start at 1

Include pagination parameters in query string:
```
GET /api/songs?page=2&limit=25
```

Response includes meta information:
```json
{
  "meta": {
    "page": 2,
    "limit": 25,
    "total": 100,
    "totalPages": 4
  }
}
```

---

## Best Practices

1. **Always check the `success` field** in responses
2. **Handle pagination** for list endpoints
3. **Respect rate limits** - check response headers
4. **Use appropriate HTTP methods** (GET for reads, POST for creates, PATCH for updates, DELETE for deletions)
5. **Include error handling** for all API calls
6. **Validate input** before sending requests

---

## Support

For API support or to report issues, contact the development team.

**Last Updated**: January 17, 2026
