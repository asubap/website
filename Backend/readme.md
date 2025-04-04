# API Documentation

## Authentication
All routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## User Role Routes

### Get User Roles
```http
POST /api/roles
```
**Request Body:**
```json
{
    "user_email": "string"
}
```
**Response:**
```json
[
    {
        "role": "string" // "e-board", "sponsor", or "general-member"
    }
]
```

### Assign Role
```http
POST /api/roles/assign-role
```
**Request Body:**
```json
{
    "user_email": "string",
    "role": "string" // "e-board", "sponsor", or "general-member"
}
```

### Remove Role
```http
POST /api/roles/remove-role
```
**Request Body:**
```json
{
    "user_email": "string",
    "role": "string" // "e-board", "sponsor", or "general-member"
}
```

### Get Session Token
```http
GET /api/roles/session
```
**Response:**
```json
{
    "token": "string"
}
```

### Edit Complete Member Info
```http
POST /api/member-info/edit-member-info
```
**Request Body:**
```json
{
    "user_email": "string",
    "bio": "string",
    "internship": "string",
    "first_name": "string",
    "last_name": "string",
    "year": "string",
    "major": "string"
}
```
**Response:**
```json
{
    "user_id": "string",
    "bio": "string",
    "internship": "string",
    "first_name": "string",
    "last_name": "string",
    "year": "string",
    "major": "string"
}
```

### Edit Member Bio
```http
POST /api/member-info/edit-member-bio
```
**Request Body:**
```json
{
    "user_email": "string",
    "bio": "string"
}
```
**Response:**
```json
{
    "user_id": "string",
    "bio": "string",
    "internship": "string",
    "first_name": "string",
    "last_name": "string",
    "year": "string",
    "major": "string"
}
```

### Edit Member Internship
```http
POST /api/member-info/edit-member-internship
```
**Request Body:**
```json
{
    "user_email": "string",
    "internship": "string"
}
```
**Response:**
```json
{
    "user_id": "string",
    "bio": "string",
    "internship": "string",
    "first_name": "string",
    "last_name": "string",
    "year": "string",
    "major": "string"
}
```

### Edit Member First Name
```http
POST /api/member-info/edit-member-first-name
```
**Request Body:**
```json
{
    "user_email": "string",
    "first_name": "string"
}
```
**Response:**
```json
{
    "user_id": "string",
    "bio": "string",
    "internship": "string",
    "first_name": "string",
    "last_name": "string",
    "year": "string",
    "major": "string"
}
```

### Edit Member Last Name
```http
POST /api/member-info/edit-member-last-name
```
**Request Body:**
```json
{
    "user_email": "string",
    "last_name": "string"
}
```
**Response:**
```json
{
    "user_id": "string",
    "bio": "string",
    "internship": "string",
    "first_name": "string",
    "last_name": "string",
    "year": "string",
    "major": "string"
}
```

### Edit Member Year
```http
POST /api/member-info/edit-member-year
```
**Request Body:**
```json
{
    "user_email": "string",
    "year": "string"
}
```
**Response:**
```json
{
    "user_id": "string",
    "bio": "string",
    "internship": "string",
    "first_name": "string",
    "last_name": "string",
    "year": "string",
    "major": "string"
}
```

### Edit Member Major
```http
POST /api/member-info/edit-member-major
```
**Request Body:**
```json
{
    "user_email": "string",
    "major": "string"
}
```
**Response:**
```json
{
    "user_id": "string",
    "bio": "string",
    "internship": "string",
    "first_name": "string",
    "last_name": "string",
    "year": "string",
    "major": "string"
}
```

### Delete Member
```http
POST /api/member-info/delete-member
```
**Request Body:**
```json
{
    "user_email": "string"
}
```
**Response:**
```json
{
    "user_id": "string",
    "bio": "string",
    "internship": "string",
    "first_name": "string",
    "last_name": "string",
    "year": "string",
    "major": "string"
}
```

### Add Member
```http
POST /api/member-info/add-member
```
**Request Body:**
```json
{
    "user_email": "string"
}
```
**Response:**
```json
{
    "user_id": "string",
    "bio": null,
    "internship": null,
    "first_name": null,
    "last_name": null,
    "year": null,
    "major": null
}
```

## Event Routes

### Get All Events
```http
GET /api/events
```
**Authentication**: Required (Bearer Token)
**Response**: Array of event objects
```json
[
    {
        "id": "string",
        "name": "string",
        "date": "YYYY-MM-DD",
        "location": "string",
        "description": "string",
        "time": "HH:MM:SS"
    }
]
```

### Get Events by Name
```http
POST /api/events
```
**Authentication**: Required (Bearer Token)
**Request Body:**
```json
{
    "name": "string"
}
```
**Response**: Array of matching event objects

### Get Events by Date
```http
POST /api/events/get-events-by-date
```
**Authentication**: Required (Bearer Token)
**Request Body:**
```json
{
    "date": "YYYY-MM-DD"  // Optional, defaults to today
}
```
**Response**: Array of events for the specified date

### Add Event
```http
POST /api/events/add-event
```
**Authentication**: Required (Bearer Token)
**Request Body:**
```json
{
    "user_email": "string",
    "name": "string",
    "date": "YYYY-MM-DD",
    "location": "string",
    "description": "string",
    "time": "HH:MM:SS"
}
```
**Response**: Created event object

### Edit Event
```http
POST /api/events/edit-event
```
**Authentication**: Required (Bearer Token)
**Request Body:**
```json
{
    "user_email": "string",
    "event_name": "string",
    "name": "string",        // Optional which means "" if you don't want to update
    "date": "YYYY-MM-DD",    // Optional which means "" if you don't want to update
    "location": "string",    // Optional which means "" if you don't want to update
    "description": "string", // Optional which means "" if you don't want to update
    "time": "HH:MM:SS"      // Optional which means "" if you don't want to update
}
```
**Response**: Updated event object

### Delete Event
```http
POST /api/events/delete-event
```
**Authentication**: Required (Bearer Token)
**Request Body:**
```json
{
    "event_name": "string"
}
```
**Response**: Success message or error

## Announcement Routes

### Get All Announcements
```http
GET /api/announcements
```
**Authentication**: Required (Bearer Token)
**Response**: Array of announcement objects
```json
[
    {
        "id": "string",
        "title": "string",
        "body": "string",
        "created_at": "timestamp"
    }
]
```

### Get Announcements by Name
```http
POST /api/announcements
```
**Authentication**: Required (Bearer Token)
**Request Body:**
```json
{
    "announcements_name": "string"
}
```
**Response**: Array of matching announcement objects

### Add Announcement
```http
POST /api/announcements/add-announcement
```
**Authentication**: Required (Bearer Token)
**Request Body:**
```json
{
    "user_email": "string",
    "announcements_name": "string",
    "description": "string"
}
```
**Response**: Created announcement object

### Edit Announcement
```http
POST /api/announcements/edit-announcement
```
**Authentication**: Required (Bearer Token)
**Request Body:**
```json
{
    "user_email": "string",
    "announcement_name": "string",
    "title": "string",        // Optional which means "" if you don't want to update
    "description": "string"   // Optional which means "" if you don't want to update
}
```
**Response**: Updated announcement object

### Delete Announcement
```http
POST /api/announcements/delete-announcement
```
**Authentication**: Required (Bearer Token)
**Request Body:**
```json
{
    "announcement_name": "string"
}
```
**Response**: Success message or error

## Error Responses
All routes may return the following error responses:

### 400 Bad Request
```json
{
    "error": "Error message describing what went wrong"
}
```

### 401 Unauthorized
```json
{
    "error": "No authorization token provided"
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal server error"
}
``` 
