# Media Sharing API - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture & Flow](#architecture--flow)
3. [Base URL & Configuration](#base-url--configuration)
4. [Data Models](#data-models)
5. [API Endpoints](#api-endpoints)
6. [Error Handling](#error-handling)
7. [Use Cases & Workflows](#use-cases--workflows)
8. [Frontend Integration Guide](#frontend-integration-guide)

---

## Overview

The Media Sharing API is a RESTful service that allows users to:
- Upload media files (images, videos, documents, etc.)
- Manage and view uploaded media
- Create shareable links for media with expiration dates and optional password protection
- Access shared media through secure links
- View analytics for shared links
- Filter and manage share links for specific media

### Key Features
- **File Upload**: Support for various file types with automatic metadata extraction
- **Share Links**: Generate both long and short URLs for media sharing
- **Security**: Optional password protection for share links
- **Expiration**: Time-based expiration for share links
- **Analytics**: Track usage statistics for shared links
- **Filtering**: Advanced filtering and pagination for share links

---

## Architecture & Flow

### System Architecture

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │
       │ HTTP Requests
       │
┌──────▼─────────────────────────────────────┐
│         Express.js API Server              │
│  ┌──────────────────────────────────────┐  │
│  │  Routes Layer                       │  │
│  │  - /api/media/*                    │  │
│  │  - /api/share-link/*               │  │
│  │  - /api/gallery/*                  │  │
│  └──────────┬─────────────────────────┘  │
│             │                            │
│  ┌──────────▼─────────────────────────┐  │
│  │  Controllers Layer                 │  │
│  │  - Media Controller                │  │
│  │  - ShareLink Controller           │  │
│  └──────────┬─────────────────────────┘  │
│             │                            │
│  ┌──────────▼─────────────────────────┐  │
│  │  Services/Utils                     │  │
│  │  - URL Shortener                   │  │
│  │  - File Upload (Multer)            │  │
│  └──────────┬─────────────────────────┘  │
└─────────────┼────────────────────────────┘
              │
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐      ┌──────▼──────┐
│ MongoDB │      │ File System │
│ Database│      │  (uploads/) │
└─────────┘      └─────────────┘
```

### Application Flow

#### 1. Media Upload Flow
```
User → POST /api/media/upload
  → Multer Middleware (File Processing)
  → Media Controller (Save to DB)
  → MongoDB (Store Metadata)
  → File System (Store File)
  → Response (Media Object with URL)
```

#### 2. Share Link Creation Flow
```
User → POST /api/share-link
  → Validate Media Exists
  → Create ShareLink Document (Get ID)
  → Generate Long URL: /api/gallery/{shareLinkId}
  → Call URL Shortener Service
  → Update ShareLink with Short Code
  → Response (ShareLink with Short & Long URLs)
```

#### 3. Share Link Access Flow
```
User → GET /api/gallery/{shareLinkId}?password=xxx
  → Find ShareLink by ID
  → Check Expiration
  → Validate Password (if required)
  → Fetch Associated Media
  → Response (Media Data)
```

#### 4. Analytics Flow
```
User → GET /api/share-link/{shareLinkId}/analytics
  → Find ShareLink by ID
  → Extract Short Code
  → Call URL Shortener Stats API
  → Response (Analytics Data)
```

---

## Base URL & Configuration

### Base URL
```
Development: http://localhost:3000
Production: [Your Production URL]
```

### API Prefix
All endpoints are prefixed with `/api`

### Environment Variables Required
- `MONGO_URI`: MongoDB connection string
- `SHORTNER_ENDPOINT`: URL shortener service endpoint (e.g., `https://spoo.me`)
- `PORT`: Server port (default: 3000)

### Content Types
- `application/json`: For JSON request/response bodies
- `multipart/form-data`: For file uploads
- `application/x-www-form-urlencoded`: For URL shortener service

---

## Data Models

### Media Model

```typescript
interface Media {
  id: string;                    // MongoDB ObjectId
  mediaPath: string;              // File system path
  title: string;                  // Media title/name
  size: number;                  // File size in bytes
  mimeType: string;              // MIME type (e.g., "image/jpeg")
  createdAt: Date;               // Creation timestamp
}
```

### ShareLink Model

```typescript
interface ShareLink {
  id: string;                    // MongoDB ObjectId
  mediaId: string;               // Reference to Media document
  shortCode: string;             // Short code from URL shortener
  shareUrl: string;              // Long accessible URL
  password: string | null;       // Optional password (plain text)
  expiresAt: Date | null;        // Expiration timestamp (null = no expiry)
  createdAt: Date;               // Creation timestamp
}
```

### Response Wrapper

All successful responses follow this structure:
```typescript
interface SuccessResponse<T> {
  message: string;
  data: T;
  count?: number;                // For list responses
  total?: number;                // For paginated responses
  filters?: object;              // For filtered responses
}
```

### Error Response

All error responses follow this structure:
```typescript
interface ErrorResponse {
  error: {
    message: string;
    details?: string;            // Additional error details
  };
}
```

---

## API Endpoints

### Media Endpoints

#### 1. Upload Media File

Upload a media file to the server.

**Endpoint:** `POST /api/media/upload`

**Content-Type:** `multipart/form-data`

**Request Body:**
```javascript
FormData {
  file: File,              // Required: The media file to upload
  title?: string           // Optional: Custom title for the media
}
```

**Example Request:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'My Vacation Photo');

fetch('http://localhost:3000/api/media/upload', {
  method: 'POST',
  body: formData
});
```

**Success Response (201):**
```json
{
  "message": "Media uploaded successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "My Vacation Photo",
    "size": 2456789,
    "mimeType": "image/jpeg",
    "createdAt": "2024-11-07T12:00:00.000Z",
    "url": "http://localhost:3000/api/media/507f1f77bcf86cd799439011/file"
  }
}
```

**Error Responses:**
- `400 Bad Request`: No file uploaded
  ```json
  {
    "error": {
      "message": "No file uploaded"
    }
  }
  ```
- `500 Internal Server Error`: Server error during upload

**Notes:**
- Maximum file size: 100MB
- Files are stored in the `uploads/` directory
- Filenames are automatically generated with timestamp and random suffix
- The `url` field provides direct access to the file

---

#### 2. Get All Media

Retrieve all uploaded media with their accessible URLs.

**Endpoint:** `GET /api/media`

**Request Headers:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Example Request:**
```javascript
fetch('http://localhost:3000/api/media')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Success Response (200):**
```json
{
  "message": "Media retrieved successfully",
  "count": 3,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "My Vacation Photo",
      "size": 2456789,
      "mimeType": "image/jpeg",
      "createdAt": "2024-11-07T12:00:00.000Z",
      "url": "http://localhost:3000/api/media/507f1f77bcf86cd799439011/file"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Document.pdf",
      "size": 1024567,
      "mimeType": "application/pdf",
      "createdAt": "2024-11-07T11:30:00.000Z",
      "url": "http://localhost:3000/api/media/507f1f77bcf86cd799439012/file"
    }
  ]
}
```

**Error Responses:**
- `500 Internal Server Error`: Server error

**Notes:**
- Results are sorted by creation date (newest first)
- Empty array is returned if no media exists

---

#### 3. Get Media File

Retrieve the actual media file by its ID.

**Endpoint:** `GET /api/media/{id}/file`

**Path Parameters:**
- `id` (string, required): Media document ID

**Example Request:**
```javascript
fetch('http://localhost:3000/api/media/507f1f77bcf86cd799439011/file')
  .then(res => res.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    // Display or download the file
  });
```

**Success Response (200):**
- Content-Type: Based on file's MIME type
- Body: Binary file data

**Error Responses:**
- `404 Not Found`: Media not found
  ```json
  {
    "error": {
      "message": "Media not found"
    }
  }
  ```
- `404 Not Found`: Media file not found on disk
  ```json
  {
    "error": {
      "message": "Media file not found on disk"
    }
  }
  ```

**Notes:**
- Use this URL directly in `<img>`, `<video>`, or `<a>` tags
- The response includes appropriate Content-Type headers
- Files are served directly from the file system

---

### Share Link Endpoints

#### 4. Create Share Link

Create a shareable link for a media file with optional password protection and expiration.

**Endpoint:** `POST /api/share-link`

**Content-Type:** `application/json`

**Request Body:**
```typescript
{
  mediaId: string;          // Required: Media document ID
  expiresAt: string;       // Required: ISO 8601 date string (must be in future)
  password?: string;        // Optional: Password to protect the link
}
```

**Example Request:**
```javascript
fetch('http://localhost:3000/api/share-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mediaId: '507f1f77bcf86cd799439011',
    expiresAt: '2024-12-31T23:59:59Z',
    password: 'mySecurePassword123'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

**Success Response (201):**
```json
{
  "message": "Share link created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439022",
    "mediaId": "507f1f77bcf86cd799439011",
    "shortCode": "Vs1PgI",
    "shortUrl": "https://spoo.me/Vs1PgI",
    "longUrl": "http://localhost:3000/api/gallery/507f1f77bcf86cd799439022",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-11-07T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
  ```json
  {
    "error": {
      "message": "mediaId is required"
    }
  }
  ```
- `400 Bad Request`: Invalid date format
  ```json
  {
    "error": {
      "message": "Invalid expiresAt date format"
    }
  }
  ```
- `400 Bad Request`: Expiration date in the past
  ```json
  {
    "error": {
      "message": "expiresAt must be in the future"
    }
  }
  ```
- `404 Not Found`: Media not found
  ```json
  {
    "error": {
      "message": "Media not found"
    }
  }
  ```
- `500 Internal Server Error`: Failed to generate shortened URL
  ```json
  {
    "error": {
      "message": "Failed to generate shortened URL",
      "details": "Could not shorten URL: Bad Request"
    }
  }
  ```

**Notes:**
- The `longUrl` is the direct access URL: `/api/gallery/{shareLinkId}`
- The `shortUrl` is the shortened version from the URL shortener service
- If URL shortening fails, the share link is automatically deleted
- **Important**: The `longUrl` must be publicly accessible for the shortener service to work (localhost URLs will fail)

---

#### 5. Access Share Link

Access a shared media file through its share link.

**Endpoint:** `GET /api/gallery/{shareLinkId}`

**Path Parameters:**
- `shareLinkId` (string, required): Share link document ID

**Query Parameters:**
- `password` (string, optional): Password if the share link is protected

**Example Request:**
```javascript
// Without password
fetch('http://localhost:3000/api/gallery/507f1f77bcf86cd799439022')
  .then(res => res.json())
  .then(data => console.log(data));

// With password
fetch('http://localhost:3000/api/gallery/507f1f77bcf86cd799439022?password=mySecurePassword123')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Success Response (200):**
```json
{
  "message": "Share link accessed successfully",
  "data": {
    "media": {
      "id": "507f1f77bcf86cd799439011",
      "title": "My Vacation Photo",
      "size": 2456789,
      "mimeType": "image/jpeg",
      "createdAt": "2024-11-07T12:00:00.000Z",
      "url": "http://localhost:3000/api/media/507f1f77bcf86cd799439011/file"
    },
    "shareLink": {
      "id": "507f1f77bcf86cd799439022",
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "createdAt": "2024-11-07T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing password
  ```json
  {
    "error": {
      "message": "Invalid or missing password"
    }
  }
  ```
- `404 Not Found`: Share link not found
  ```json
  {
    "error": {
      "message": "Share link not found"
    }
  }
  ```
- `404 Not Found`: Associated media not found
  ```json
  {
    "error": {
      "message": "Associated media not found"
    }
  }
  ```
- `410 Gone`: Share link has expired
  ```json
  {
    "error": {
      "message": "Share link has expired",
      "expiredAt": "2024-11-06T23:59:59.000Z"
    }
  }
  ```

**Notes:**
- Use the `media.url` field to display or download the actual file
- Expired links return `410 Gone` status
- Password-protected links require the `password` query parameter

---

#### 6. Get Share Link Analytics

Retrieve analytics data for a share link.

**Endpoint:** `GET /api/share-link/{shareLinkId}/analytics`

**Path Parameters:**
- `shareLinkId` (string, required): Share link document ID

**Query Parameters:**
- `password` (string, optional): Password if the share link is protected (will use stored password if not provided)

**Example Request:**
```javascript
fetch('http://localhost:3000/api/share-link/507f1f77bcf86cd799439022/analytics?password=mySecurePassword123')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Success Response (200):**
```json
{
  "message": "Analytics retrieved successfully",
  "data": {
    "shareLink": {
      "id": "507f1f77bcf86cd799439022",
      "mediaId": "507f1f77bcf86cd799439011",
      "shortCode": "Vs1PgI",
      "shareUrl": "http://localhost:3000/api/gallery/507f1f77bcf86cd799439022",
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "createdAt": "2024-11-07T12:00:00.000Z"
    },
    "analytics": {
      "_id": "Vs1PgI",
      "short_code": "Vs1PgI",
      "url": "http://localhost:3000/api/gallery/507f1f77bcf86cd799439022",
      "total-clicks": 42,
      "total_unique_clicks": 35,
      "average_daily_clicks": 2.1,
      "average_weekly_clicks": 14.7,
      "average_monthly_clicks": 42.0,
      "average_redirection_time": 150,
      "creation-date": "2024-11-07",
      "creation-time": "12:00:00",
      "last-click": "2024-11-07T18:30:00.000Z",
      "last-click-country": "US",
      "last-click-browser": "Chrome",
      "last-click-os": "Windows",
      "country": {
        "US": 25,
        "UK": 10,
        "CA": 7
      },
      "browser": {
        "Chrome": 30,
        "Firefox": 8,
        "Safari": 4
      },
      "os_name": {
        "Windows": 20,
        "macOS": 15,
        "Linux": 7
      },
      "referrer": {
        "direct": 25,
        "https://example.com": 10,
        "https://social.com": 7
      }
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Share link not found
  ```json
  {
    "error": {
      "message": "Share link not found"
    }
  }
  ```
- `500 Internal Server Error`: Failed to fetch analytics
  ```json
  {
    "error": {
      "message": "Failed to fetch analytics for shortened URL",
      "details": "Could not retrieve URL stats: Invalid password"
    }
  }
  ```

**Notes:**
- Analytics data structure depends on the URL shortener service
- The analytics object contains detailed statistics about link usage
- Password is required if the share link is protected

---

#### 7. Get Share Links by Media

Retrieve all share links for a specific media with advanced filtering options.

**Endpoint:** `GET /api/share-link/media/{mediaId}`

**Path Parameters:**
- `mediaId` (string, required): Media document ID

**Query Parameters:**
- `expired` (string, optional): Filter by expiration status (`"true"` or `"false"`)
- `hasPassword` (string, optional): Filter by password presence (`"true"` or `"false"`)
- `sortBy` (string, optional): Field to sort by (`"createdAt"` or `"expiresAt"`, default: `"createdAt"`)
- `sortOrder` (string, optional): Sort order (`"asc"` or `"desc"`, default: `"desc"`)
- `limit` (number, optional): Maximum number of results to return
- `skip` (number, optional): Number of results to skip for pagination (default: `0`)

**Example Requests:**
```javascript
// Get all share links for a media
fetch('http://localhost:3000/api/share-link/media/507f1f77bcf86cd799439011')
  .then(res => res.json())
  .then(data => console.log(data));

// Get only active (non-expired) share links
fetch('http://localhost:3000/api/share-link/media/507f1f77bcf86cd799439011?expired=false')
  .then(res => res.json())
  .then(data => console.log(data));

// Get password-protected links, sorted by expiration date
fetch('http://localhost:3000/api/share-link/media/507f1f77bcf86cd799439011?hasPassword=true&sortBy=expiresAt&sortOrder=asc')
  .then(res => res.json())
  .then(data => console.log(data));

// Paginated request
fetch('http://localhost:3000/api/share-link/media/507f1f77bcf86cd799439011?limit=10&skip=0')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Success Response (200):**
```json
{
  "message": "Share links retrieved successfully",
  "data": {
    "count": 2,
    "total": 5,
    "filters": {
      "expired": "false",
      "hasPassword": null,
      "sortBy": "createdAt",
      "sortOrder": "desc",
      "skip": 0,
      "limit": 10
    },
    "shareLinks": [
      {
        "id": "507f1f77bcf86cd799439022",
        "mediaId": "507f1f77bcf86cd799439011",
        "shortCode": "Vs1PgI",
        "shareUrl": "http://localhost:3000/api/gallery/507f1f77bcf86cd799439022",
        "hasPassword": true,
        "expiresAt": "2024-12-31T23:59:59.000Z",
        "isExpired": false,
        "createdAt": "2024-11-07T12:00:00.000Z",
        "media": {
          "id": "507f1f77bcf86cd799439011",
          "title": "My Vacation Photo",
          "mimeType": "image/jpeg",
          "size": 2456789
        }
      },
      {
        "id": "507f1f77bcf86cd799439023",
        "mediaId": "507f1f77bcf86cd799439011",
        "shortCode": "Ab2QrX",
        "shareUrl": "http://localhost:3000/api/gallery/507f1f77bcf86cd799439023",
        "hasPassword": false,
        "expiresAt": "2024-11-15T23:59:59.000Z",
        "isExpired": false,
        "createdAt": "2024-11-06T10:00:00.000Z",
        "media": {
          "id": "507f1f77bcf86cd799439011",
          "title": "My Vacation Photo",
          "mimeType": "image/jpeg",
          "size": 2456789
        }
      }
    ]
  }
}
```

**Error Responses:**
- `404 Not Found`: Media not found
  ```json
  {
    "error": {
      "message": "Media not found"
    }
  }
  ```

**Notes:**
- `count`: Number of results in current response
- `total`: Total number of share links matching filters (useful for pagination)
- `isExpired`: Calculated field indicating if link is currently expired
- Filters can be combined (e.g., `expired=false&hasPassword=true`)
- Empty array returned if no share links match filters

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning | Usage |
|------------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST request creating a resource |
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | Missing or invalid password |
| 404 | Not Found | Resource not found |
| 410 | Gone | Resource expired |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

All error responses follow this structure:
```json
{
  "error": {
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common Error Scenarios

1. **Validation Errors (400)**
   - Missing required fields
   - Invalid date formats
   - Invalid data types

2. **Authentication Errors (401)**
   - Missing password for protected links
   - Incorrect password

3. **Not Found Errors (404)**
   - Media not found
   - Share link not found
   - File not found on disk

4. **Expiration Errors (410)**
   - Share link has expired

5. **Server Errors (500)**
   - Database connection issues
   - File system errors
   - External service failures (URL shortener)

---

## Use Cases & Workflows

### Use Case 1: Upload and Share Media

**Scenario:** User wants to upload a photo and share it with friends.

**Workflow:**
1. User uploads file via `POST /api/media/upload`
2. System stores file and returns media object with ID
3. User creates share link via `POST /api/share-link` with:
   - `mediaId`: From step 2
   - `expiresAt`: Future date (e.g., 7 days from now)
   - `password`: Optional password
4. System returns share link with `shortUrl` and `longUrl`
5. User shares `shortUrl` with friends
6. Friends access link via `GET /api/gallery/{shareLinkId}`

**Frontend Implementation:**
```javascript
// Step 1: Upload file
const uploadFile = async (file, title) => {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);
  
  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};

// Step 2: Create share link
const createShareLink = async (mediaId, expiresAt, password) => {
  const response = await fetch('/api/share-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mediaId, expiresAt, password })
  });
  
  return await response.json();
};

// Usage
const file = document.getElementById('fileInput').files[0];
const media = await uploadFile(file, 'My Photo');
const shareLink = await createShareLink(
  media.data.id,
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  'optionalPassword'
);
console.log('Share this URL:', shareLink.data.shortUrl);
```

---

### Use Case 2: View Media Library

**Scenario:** User wants to see all their uploaded media.

**Workflow:**
1. User requests all media via `GET /api/media`
2. System returns list of all media with URLs
3. Frontend displays media in a grid/list view
4. User can click on media to view/download via the `url` field

**Frontend Implementation:**
```javascript
const getMediaLibrary = async () => {
  const response = await fetch('/api/media');
  const data = await response.json();
  return data.data;
};

// Display media
const displayMedia = async () => {
  const mediaList = await getMediaLibrary();
  const container = document.getElementById('mediaContainer');
  
  mediaList.forEach(media => {
    const mediaElement = document.createElement('div');
    mediaElement.innerHTML = `
      <img src="${media.url}" alt="${media.title}" />
      <p>${media.title}</p>
      <p>Size: ${formatBytes(media.size)}</p>
    `;
    container.appendChild(mediaElement);
  });
};
```

---

### Use Case 3: Manage Share Links

**Scenario:** User wants to view and manage all share links for a specific media.

**Workflow:**
1. User selects a media item
2. Frontend requests share links via `GET /api/share-link/media/{mediaId}`
3. System returns filtered list of share links
4. User can:
   - View active vs expired links
   - Filter by password protection
   - View analytics for each link
   - Copy share URLs

**Frontend Implementation:**
```javascript
const getShareLinksForMedia = async (mediaId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.expired !== undefined) params.append('expired', filters.expired);
  if (filters.hasPassword !== undefined) params.append('hasPassword', filters.hasPassword);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.skip) params.append('skip', filters.skip);
  
  const response = await fetch(`/api/share-link/media/${mediaId}?${params}`);
  return await response.json();
};

// Get only active (non-expired) links
const activeLinks = await getShareLinksForMedia(mediaId, {
  expired: 'false',
  sortBy: 'expiresAt',
  sortOrder: 'desc'
});
```

---

### Use Case 4: View Analytics

**Scenario:** User wants to see how many times their shared link was accessed.

**Workflow:**
1. User selects a share link
2. Frontend requests analytics via `GET /api/share-link/{shareLinkId}/analytics`
3. System fetches analytics from URL shortener service
4. Frontend displays statistics (clicks, countries, browsers, etc.)

**Frontend Implementation:**
```javascript
const getShareLinkAnalytics = async (shareLinkId, password = null) => {
  const url = new URL(`/api/share-link/${shareLinkId}/analytics`, window.location.origin);
  if (password) url.searchParams.append('password', password);
  
  const response = await fetch(url);
  return await response.json();
};

// Display analytics
const displayAnalytics = async (shareLinkId) => {
  const data = await getShareLinkAnalytics(shareLinkId);
  const analytics = data.data.analytics;
  
  console.log(`Total Clicks: ${analytics['total-clicks']}`);
  console.log(`Unique Clicks: ${analytics['total_unique_clicks']}`);
  console.log(`Countries:`, analytics.country);
  console.log(`Browsers:`, analytics.browser);
};
```

---

### Use Case 5: Access Shared Media

**Scenario:** User receives a share link and wants to access the media.

**Workflow:**
1. User clicks on share link (short URL redirects to long URL)
2. If password-protected, user enters password
3. Frontend requests media via `GET /api/gallery/{shareLinkId}?password=xxx`
4. System validates expiration and password
5. System returns media data with access URL
6. Frontend displays/downloads media using the `media.url` field

**Frontend Implementation:**
```javascript
const accessShareLink = async (shareLinkId, password = null) => {
  const url = new URL(`/api/gallery/${shareLinkId}`, window.location.origin);
  if (password) url.searchParams.append('password', password);
  
  const response = await fetch(url);
  
  if (response.status === 401) {
    // Prompt for password
    const userPassword = prompt('This link is password protected. Enter password:');
    return await accessShareLink(shareLinkId, userPassword);
  }
  
  if (response.status === 410) {
    alert('This share link has expired.');
    return null;
  }
  
  return await response.json();
};

// Display shared media
const displaySharedMedia = async (shareLinkId) => {
  const data = await accessShareLink(shareLinkId);
  if (!data) return;
  
  const media = data.data.media;
  const mediaElement = document.createElement('div');
  
  if (media.mimeType.startsWith('image/')) {
    mediaElement.innerHTML = `<img src="${media.url}" alt="${media.title}" />`;
  } else if (media.mimeType.startsWith('video/')) {
    mediaElement.innerHTML = `<video src="${media.url}" controls></video>`;
  } else {
    mediaElement.innerHTML = `<a href="${media.url}" download>Download ${media.title}</a>`;
  }
  
  document.body.appendChild(mediaElement);
};
```

---

## Frontend Integration Guide

### Setup

1. **Base URL Configuration**
   ```javascript
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
   ```

2. **API Client Wrapper**
   ```javascript
   class MediaSharingAPI {
     constructor(baseURL) {
       this.baseURL = baseURL;
     }
     
     async request(endpoint, options = {}) {
       const url = `${this.baseURL}${endpoint}`;
       const response = await fetch(url, {
         ...options,
         headers: {
           ...options.headers,
         }
       });
       
       if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error?.message || 'Request failed');
       }
       
       return await response.json();
     }
     
     // Media methods
     async uploadMedia(file, title) {
       const formData = new FormData();
       formData.append('file', file);
       if (title) formData.append('title', title);
       
       return this.request('/api/media/upload', {
         method: 'POST',
         body: formData
       });
     }
     
     async getAllMedia() {
       return this.request('/api/media');
     }
     
     async getMediaFile(id) {
       return `${this.baseURL}/api/media/${id}/file`;
     }
     
     // Share link methods
     async createShareLink(mediaId, expiresAt, password) {
       return this.request('/api/share-link', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ mediaId, expiresAt, password })
       });
     }
     
     async accessShareLink(shareLinkId, password) {
       const endpoint = `/api/gallery/${shareLinkId}`;
       const url = password ? `${endpoint}?password=${encodeURIComponent(password)}` : endpoint;
       return this.request(url);
     }
     
     async getShareLinkAnalytics(shareLinkId, password) {
       const endpoint = `/api/share-link/${shareLinkId}/analytics`;
       const url = password ? `${endpoint}?password=${encodeURIComponent(password)}` : endpoint;
       return this.request(url);
     }
     
     async getShareLinksByMedia(mediaId, filters = {}) {
       const params = new URLSearchParams();
       Object.entries(filters).forEach(([key, value]) => {
         if (value !== undefined && value !== null) {
           params.append(key, value);
         }
       });
       const queryString = params.toString();
       const endpoint = `/api/share-link/media/${mediaId}${queryString ? `?${queryString}` : ''}`;
       return this.request(endpoint);
     }
   }
   
   // Usage
   const api = new MediaSharingAPI(API_BASE_URL);
   ```

### Recommended UI Components

1. **File Upload Component**
   - Drag & drop support
   - File type validation
   - Progress indicator
   - Preview before upload

2. **Media Gallery Component**
   - Grid/List view toggle
   - Thumbnail generation
   - Lazy loading
   - Infinite scroll or pagination

3. **Share Link Manager**
   - Create share link form
   - Date picker for expiration
   - Password input (optional)
   - Copy to clipboard functionality
   - List of existing share links
   - Filter and sort controls

4. **Share Link Access Page**
   - Password prompt modal
   - Media preview/download
   - Expiration warning
   - Error handling UI

5. **Analytics Dashboard**
   - Charts for clicks over time
   - Geographic distribution map
   - Browser/OS breakdown
   - Referrer sources

### State Management

Recommended state structure:
```javascript
{
  media: {
    items: [],
    loading: false,
    error: null,
    selectedMedia: null
  },
  shareLinks: {
    items: [],
    loading: false,
    error: null,
    filters: {
      expired: null,
      hasPassword: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  },
  upload: {
    progress: 0,
    uploading: false,
    error: null
  }
}
```

### Error Handling Best Practices

1. **Network Errors**
   ```javascript
   try {
     const data = await api.uploadMedia(file);
   } catch (error) {
     if (error.message.includes('Network')) {
       showError('Network error. Please check your connection.');
     } else {
       showError(error.message);
     }
   }
   ```

2. **Validation Errors**
   - Display field-specific error messages
   - Highlight invalid form fields
   - Provide helpful suggestions

3. **Authentication Errors**
   - Show password input modal
   - Clear error after successful authentication
   - Remember password for session (optional)

4. **Expiration Errors**
   - Show clear expiration message
   - Offer to create new share link
   - Display expiration date prominently

### Performance Optimization

1. **Image Optimization**
   - Use thumbnail URLs if available
   - Implement lazy loading
   - Progressive image loading

2. **Caching**
   - Cache media list
   - Cache share link data
   - Use browser cache for media files

3. **Pagination**
   - Implement infinite scroll
   - Load more button
   - Virtual scrolling for large lists

---

## Additional Notes

### URL Shortener Service Requirements

- The URL shortener service requires **publicly accessible URLs**
- Localhost URLs (`http://localhost:3000/...`) will fail
- For development, use:
  - ngrok: `ngrok http 3000`
  - localtunnel: `lt --port 3000`
  - Or deploy to a staging environment

### File Storage

- Files are stored in the `uploads/` directory
- Filenames are automatically generated: `{timestamp}-{random}-{originalname}`
- Maximum file size: 100MB (configurable in multer middleware)

### Security Considerations

- Passwords are stored in plain text (as per requirements)
- Consider implementing:
  - Rate limiting
  - File type restrictions
  - Virus scanning
  - HTTPS in production
  - CORS configuration

### Date Formats

- All dates use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `2024-12-31T23:59:59.000Z`
- Timezone: UTC

---

## Conclusion

This API provides a complete solution for media sharing with:
- ✅ File upload and management
- ✅ Secure share link generation
- ✅ Password protection
- ✅ Expiration management
- ✅ Analytics tracking
- ✅ Advanced filtering and pagination

The API is designed to be RESTful, well-documented, and easy to integrate with any frontend framework.

For interactive API documentation, visit: `http://localhost:3000/api-docs` (Swagger UI)

---

**Last Updated:** November 7, 2024
**API Version:** 1.0.0

