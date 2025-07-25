# AI Prompts Database

A full-stack web application for managing and sharing AI prompts with user authentication, categories, favorites, and image uploads.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Prompt Management**: Create, read, update, and delete prompts
- **Categories**: Organize prompts by categories with custom colors
- **Favorites**: Save and manage favorite prompts
- **Image Uploads**: Upload images to accompany prompts
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes
- **Admin Panel**: Manage categories, prompts, and users
- **Search & Filter**: Find prompts by category, type, or search terms

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Sequelize ORM** with SQLite database
- **JWT Authentication**
- **Multer** for file uploads
- **Sharp** for image processing
- **Winston** for logging
- **Helmet** for security

### Frontend
- **React** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **React Dropzone** for drag-and-drop uploads
- **Axios** for API calls
- **React Hot Toast** for notifications

## Project Structure

```
├── app/
│   ├── backend/          # Express.js backend
│   │   ├── src/
│   │   │   ├── config/   # Database configuration
│   │   │   ├── models/   # Sequelize models
│   │   │   ├── routes/   # API routes
│   │   │   ├── middleware/ # Custom middleware
│   │   │   └── server.js # Main server file
│   │   └── package.json
│   └── frontend/         # React frontend
│       ├── src/
│       │   ├── components/ # Reusable components
│       │   ├── contexts/   # React contexts
│       │   ├── pages/      # Page components
│       │   └── index.css   # Global styles
│       └── package.json
├── docker-compose.yml    # Docker configuration
├── Dockerfile           # Multi-stage build
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-prompts-database.git
cd ai-prompts-database
```

2. Install backend dependencies:
```bash
cd app/backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
Create a `.env` file in `app/backend/`:
```
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

5. Initialize the database:
```bash
cd app/backend
npm run db:migrate
npm run db:seed:all
```

### Running the Application

#### Development Mode

1. Start the backend server:
```bash
cd app/backend
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd app/frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

#### Production Mode

1. Build the frontend:
```bash
cd app/frontend
npm run build
```

2. Start the backend:
```bash
cd app/backend
npm start
```

#### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

The application will be available at http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Prompts
- `GET /api/prompts` - Get all prompts (with pagination)
- `GET /api/prompts/:id` - Get single prompt
- `POST /api/prompts` - Create new prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt
- `POST /api/prompts/:id/favorite` - Toggle favorite
- `GET /api/prompts/favorites/me` - Get user's favorites

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Image Uploads
- `POST /api/prompts/:id/images` - Upload image for prompt
- `DELETE /api/prompts/:id/images/:imageId` - Delete image

## Environment Variables

### Backend (.env)
```
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
