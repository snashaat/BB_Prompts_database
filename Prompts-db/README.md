# Prompt Management Platform

A production-ready prompt management platform designed for deployment on Unraid as a Docker container. This application provides a modern interface for managing text and image prompts with robust backend functionality.

## Features

- **Modern UI**: Responsive React frontend with Tailwind CSS
- **Prompt Management**: Browse prompts by category and type (Text/Image)
- **User Authentication**: Secure JWT-based login/register system
- **Admin Panel**: Full CRUD operations for prompt management
- **Image Handling**: Upload, preview, and zoom functionality
- **Theming**: Dark/light mode toggle
- **API**: RESTful backend with Express.js
- **Database**: SQLite for easy persistence
- **Docker**: Production-ready containerization

## Prerequisites

- Docker
- Docker Compose
- Node.js (for development)

## Installation on Unraid

1. Copy the `unraid-template.xml` to your Unraid server's templates directory
2. Add the template through Community Applications
3. Configure the following environment variables:
   - `DATABASE_PATH=/app/data/database.sqlite`
   - `UPLOADS_PATH=/app/uploads`
   - `THUMBNAILS_PATH=/app/thumbnails`
   - `JWT_SECRET=your-secret-key`
   - `PORT=3000`
4. Set volume mappings for persistent storage:
   - `/app/data` → Database storage
   - `/app/uploads` → Original image uploads
   - `/app/thumbnails` → Generated thumbnails
5. Deploy the container

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_PATH | `/app/data/database.sqlite` | SQLite database file path |
| UPLOADS_PATH | `/app/uploads` | Original image upload directory |
| THUMBNAILS_PATH | `/app/thumbnails` | Generated thumbnails directory |
| MAX_FILE_SIZE | `10MB` | Maximum image upload size |
| ALLOWED_IMAGE_TYPES | `jpg,jpeg,png,webp,gif` | Supported image formats |
| JWT_SECRET |  | Secret key for JWT authentication |
| PORT | `3000` | Application port |
| NODE_ENV | `production` | Runtime environment |
| CORS_ORIGIN | `*` | Allowed CORS origins |
| RATE_LIMIT_MAX | `100` | Max requests per window |

## Backup Instructions

Regularly back up these directories:
- `/app/data` (database)
- `/app/uploads` (original images)
- `/app/thumbnails` (generated thumbnails)

Use the included backup script:
```bash
./scripts/backup.sh
```

## Troubleshooting

**Q: Images aren't uploading**
A: Verify volume permissions and ensure uploads directory exists

**Q: Database not persisting**
A: Check volume mapping for /app/data

**Q: Authentication failing**
A: Verify JWT_SECRET is set and consistent

## API Documentation

See `docs/api_docs.md` for complete API reference with examples.

## Unraid Guide

Detailed Unraid setup instructions available in `docs/unraid_guide.md`
