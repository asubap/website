# API Documentation

## Authentication
All routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## User Role Routes

### Get User Roles
```http
POST /roles
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

### Get All Sponsors
```http
GET /roles/sponsors
```
**Response:**
```json
[
    {
        "email": "string"
    }
]
```

### Get All General Members
```http
GET /roles/general-members
```
**Response:**
```json
[
    {
        "email": "string"
    }
]
```

### Get All E-board
```http
GET /roles/e-board
```
**Response:**
```json
[
    {
        "email": "string"
    }
]
```

### Assign Role
```http
POST /roles/assign-role
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
POST /roles/remove-role
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
GET /roles/session
```
**Response:**
```json
{
    "token": "string"
}
```
## Member Info routes

### Get All Members
```http
GET /member-info/
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


### Get Member Info
```http
POST /member-info/
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

### Search Members
```http
POST /member-info/search/
```
**Request Body:**
```json
{
    "search_query": "string"
}
```
**Response:**
```json
[
    {
        "user_id": "string",
        "bio": "string",
        "internship": "string",
        "first_name": "string",
        "last_name": "string",
        "year": "string",
        "major": "string",
        "user_email": "string"
    }
]
```

### Edit Complete Member Info
```http
POST /member-info/edit-member-info/
```
**Request Body:**
```json
{
    "user_email": "string",
    "bio": "string" || "", // leave this empty ("") if not being changed
    "internship": "string" || "", // leave this empty ("") if not being changed
    "first_name": "string" || "", // leave this empty ("") if not being changed
    "last_name": "string" || "", // leave this empty ("") if not being changed
    "year": "string" || "", // leave this empty ("") if not being changed
    "major": "string" || "", // leave this empty ("") if not being changed
    "contact_me": "string" || "" // leave this empty ("") if not being changed
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
    "major": "string",
    "contact_me": "string"
}
```
### Delete Member
```http
POST /member-info/delete-member/
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
    "bio": "string" || null,
    "internship": "string",
    "first_name": "string",
    "last_name": "string",
    "year": "string",
    "major": "string"
}
```

### Add Member
```http
POST /member-info/add-member/
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
GET /events
```
**Authentication**: Required (Bearer Token)
**Response**: Array of event objects
```json
[
    {
        "id": 1,
        "created_at": "2025-04-04T06:45:47+00:00",
        "name": "string",
        "date": "YYYY-MM-DD",
        "location": "string",
        "location_lat": 33.419,
        "location_long": -111.935,
        "attending_users": null,
        "created_by_id": "string",
        "description": "string",
        "time": "HH:MM:SS",
        "sponsors": ["sponsor1", "sponsor2"]
    }
]
```

### Get Events by Name
```http
POST /events
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
POST /events/get-events-by-date
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
POST /events/add-event
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
    "time": "HH:MM:SS",
    "sponsors": ["sponsor1", "sponsor2"]
}
```
**Response**: Created event object

### Edit Event
```http
POST /events/edit-event
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
    "time": "HH:MM:SS",      // Optional which means "" if you don't want to update
    "sponsors": ["sponsor1", "sponsor2"] // Optional which means "" if you don't want to update
}
```
**Response**: Updated event object

### Delete Event
```http
POST /events/delete-event
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
GET /announcements
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
POST /announcements
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
POST /announcements/add-announcement
```
**Authentication**: Required (Bearer Token)
**Request Body:**
```json
{
    "user_email": "string",
    "announcement_name": "string",
    "description": "string"
}
```
**Response**: Created announcement object

### Edit Announcement
```http
POST /announcements/edit-announcement
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
POST /announcements/delete-announcement
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
