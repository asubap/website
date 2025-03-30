# API Documentation

## Authentication
All routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Member Info Routes

### Get Member Info
```http
POST /api/member-info
```
**Request Body:**
```json
{
    "user_id": "string"
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
POST /api/member-info/search
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

### Edit Member Bio
```http
POST /api/member-info/edit-bio
```
**Request Body:**
```json
{
    "user_id": "string",
    "bio": "string"
}
```

### Edit Member Internship
```http
POST /api/member-info/edit-internship
```
**Request Body:**
```json
{
    "user_id": "string",
    "internship": "string"
}
```

### Edit Member First Name
```http
POST /api/member-info/edit-first-name
```
**Request Body:**
```json
{
    "user_id": "string",
    "first_name": "string"
}
```

### Edit Member Last Name
```http
POST /api/member-info/edit-last-name
```
**Request Body:**
```json
{
    "user_id": "string",
    "last_name": "string"
}
```

### Edit Member Year
```http
POST /api/member-info/edit-year
```
**Request Body:**
```json
{
    "user_id": "string",
    "year": "string"
}
```

### Edit Member Major
```http
POST /api/member-info/edit-major
```
**Request Body:**
```json
{
    "user_id": "string",
    "major": "string"
}
```

### Delete Member
```http
POST /api/member-info/delete
```
**Request Body:**
```json
{
    "user_id": "string"
}
```

### Add Member
```http
POST /api/member-info/add
```
**Request Body:**
```json
{
    "user_id": "string"
}
```

## User Role Routes

### Get User Roles
```http
POST /api/roles
```
**Request Body:**
```json
{
    "user_id": "string"
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
    "user_id": "string",
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
    "user_id": "string",
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
    "user_id": "string",
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
    "user_id": "string",
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
    "user_id": "string",
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
    "user_id": "string",
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
    "user_id": "string",
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
    "user_id": "string",
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
    "user_id": "string",
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
    "user_id": "string"
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
    "user_id": "string"
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