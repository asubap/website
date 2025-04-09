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


### Get All Sponsors
```http
GET /roles/sponsors
GET /roles/sponsors
```

**Response:**


### Get All General Members
```http
GET /roles/general-members
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
GET /roles/officers
```
**Response:**
```json
[
    {
        "email": "string"
    }

```json
[
  {
    "role": "string" // "e-board", "sponsor", or "general-member"
  }

]
```

### Assign Role

```http
POST /roles/assign-role
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
POST /roles/remove-role
```

**Request Body:**


### Get Session Token
```http
GET /roles/session
GET /roles/session
```
**Response:**

```json
{
  "user_email": "string",
  "role": "string" // "e-board", "sponsor", or "general-member"
}

```

## Member Info routes

### Get All Members

```http
GET /member-info/
POST /member-info/edit-member-info
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
    "user_id": "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "created_at": "2025-04-09T01:06:58.377182+00:00",
    "about": "",
    "internship experience": "",
    "first_name": "",
    "last_name": "",
    "year": "",
    "major": "",
    "contact_me": "",
    "phone_number": "",
    "graduation_year": "",
    "member_status": "",
    "roles": [
        
    ]
}
```


### Edit Member Bio
```http
POST /member-info/edit-member-bio
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

### Get Member Info

### Get Member Info By Member Email

```http
POST /member-info/
POST /member-info/edit-member-internship
```

**Request Body:**

```json
{
  "user_email": "string"
}
```

**Response:**

### Search Members
```http
POST /member-info/search/
POST /member-info/edit-member-first-name
```
**Request Body:**

```json
{
    "user_id": "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "created_at": "2025-04-09T01:06:58.377182+00:00",
    "about": "",
    "internship experience": "",
    "first_name": "",
    "last_name": "",
    "year": "",
    "major": "",
    "contact_me": "",
    "phone_number": "",
    "graduation_year": "",
    "member_status": "",
    "roles": [
        
    ]
}
```

### Edit Complete Member Info

```http
POST /member-info/edit-member-info/
POST /member-info/edit-member-last-name
```

**Request Body:**

```json
{
    "user_email": "xxxxxx@asu.edu",
    "about": "",
    "internship_experience": "",
    "first_name": "",
    "last_name": "",
    "year": "",
    "major": "",
    "contact_me": "",
    "phone_number": "",
    "graduation_year": "",
    "member_status": ""
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
    "major": "string"
}
```

### Edit Member Year
```http
POST /member-info/edit-member-year
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
POST /member-info/edit-member-major
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

"Member info updated successfully"
```


### Delete Member

```http
POST /member-info/delete-member/
POST /member-info/delete-member
```


### Add Member
```http
POST /member-info/add-member/
POST /member-info/add-member
```

**Request Body:**

```json
{
  "user_email": "string"
}
```

**Response:**

```json
"Member deleted successfully"
```

## Event Routes

### Get All Events

```http
GET /events
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

### Get Events by ID
```http
POST /events
POST /events
```


### Get Events by Date
```http
POST /events/get-events-by-date
POST /events/get-events-by-date
```

**Authentication**: Required (Bearer Token)
**Request Body:**

```json
{
    "event_id": x // integer
}
```

**Response**: Array of matching event objects

### Add Event

```http
POST /events/add-event
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
**Response**: "Event added successfully"

### Edit Event

```http
POST /events/edit-event
POST /events/edit-event
```

**Authentication**: Required (Bearer Token)
**Request Body:**

```json
{
    "event_id": x, // integer
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
POST /events/delete-event
```

**Authentication**: Required (Bearer Token)
**Request Body:**

```json
{
    "event_id": x // integer
}
```
**Response**: "Event deleted successfully"

## Announcement Routes

### Get All Announcements

```http
GET /announcements
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

### Get Announcements by ID
```http
POST /announcements
POST /announcements
```

**Authentication**: Required (Bearer Token)
**Request Body:**

```json
{
    "announcement_id": x // integer
}
```

**Response**: Array of matching announcement objects

### Add Announcement

```http
POST /announcements/add-announcement
POST /announcements/add-announcement
```

**Authentication**: Required (Bearer Token)
**Request Body:**

```json
{
    "user_email": "string",
    "title": "string",
    "description": "string"
}
```

**Response**: Created announcement object

### Edit Announcement

```http
POST /announcements/edit-announcement
POST /announcements/edit-announcement
```

**Authentication**: Required (Bearer Token)
**Request Body:**

```json
{
    "announcement_id": x, // integer
    "title": "string",        // Optional which means "" if you don't want to update
    "description": "string"   // Optional which means "" if you don't want to update
}
```

**Response**: Updated announcement object

### Delete Announcement

```http
POST /announcements/delete-announcement
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
