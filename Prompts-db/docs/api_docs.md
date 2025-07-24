# API Documentation

This document provides details on the RESTful API for the Prompt Management Platform.

**Base URL:** `/api`

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. To access protected routes, you must include an `Authorization` header with the value `Bearer <your_jwt>`.

### `POST /api/auth/register`

Registers a new user.

**Request Body:**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "message": "User registered successfully."
}
```

### `POST /api/auth/login`

Logs in a user and returns a JWT.

**Request Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

## Prompts

### `GET /api/prompts`

Retrieves a list of prompts. Supports filtering and pagination.

**Query Parameters:**

-   `page` (number): The page number for pagination.
-   `limit` (number): The number of items per page.
-   `category` (string): Filter by category name.
-   `type` (string): Filter by prompt type (`text` or `image`).
-   `search` (string): Search by title or content.

**Response (200 OK):**

```json
{
  "prompts": [
    {
      "id": 1,
      "title": "A Cyberpunk City",
      "content": "A sprawling cyberpunk cityscape at night, with neon signs reflecting on wet streets.",
      "category": "Image Generation",
      "prompt_type": "image",
      "tags": ["cyberpunk", "city", "neon"],
      "author": {
        "id": 1,
        "username": "testuser"
      },
      "images": [
        {
          "id": 1,
          "thumbnail_path": "/thumbnails/thumbnail_image.jpg"
        }
      ]
    }
  ],
  "totalPages": 5,
  "currentPage": 1
}
```

### `POST /api/prompts`

Creates a new prompt. (Authentication required)

**Request Body (multipart/form-data):**

-   `title` (string): The title of the prompt.
-   `content` (string): The prompt text.
-   `category` (string): The category of the prompt.
-   `prompt_type` (string): `text` or `image`.
-   `tags` (string): A comma-separated list of tags.
-   `images` (file): One or more image files (if `prompt_type` is `image`).

**Response (201 Created):**

```json
{
  "message": "Prompt created successfully.",
  "prompt": {
    "id": 2,
    "title": "New Prompt",
    ...
  }
}
```

## Health Check

### `GET /health`

Checks the health of the API.

**Response (200 OK):**

```json
{
  "status": "UP",
  "timestamp": "2023-12-25T12:00:00.000Z"
}
