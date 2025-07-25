# Deploying PromptsDB on Docker in Unraid Server

This guide explains how to deploy the PromptsDB application using Docker on an Unraid server. The app consists of a backend API and a frontend React app.

---

## Prerequisites

- Unraid server with Docker enabled
- Basic knowledge of Docker and Unraid UI
- Access to Unraid web UI and terminal
- Git installed on your Unraid server (optional, for cloning repo)

---

## Step 1: Prepare the Project

1. Clone or copy the PromptsDB project to your Unraid server or a location accessible to Docker.

2. Ensure the project contains the following key files:
   - `docker-compose.yml`
   - `Dockerfile` (for backend)
   - `app/frontend` directory with frontend source
   - `app/backend` directory with backend source

---

## Step 2: Configure Environment Variables

1. Create a `.env` file in the backend directory (`app/backend`) with necessary environment variables such as database connection strings, secrets, etc.

2. Example `.env` file:
   ```
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

3. Adjust the variables as per your environment.

---

## Step 3: Docker Compose Setup

The `docker-compose.yml` file orchestrates the backend and frontend services.

### Key services:

- **backend**: Runs the Node.js API server.
- **frontend**: Serves the React frontend app.
- **database**: (Optional) If using a database container like PostgreSQL or MySQL.

### Example `docker-compose.yml` snippet:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./app/backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    env_file:
      - ./app/backend/.env
    depends_on:
      - database

  frontend:
    build:
      context: ./app/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend

  database:
    image: postgres:13
    environment:
      POSTGRES_USER: youruser
      POSTGRES_PASSWORD: yourpassword
      POSTGRES_DB: promptsdb
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

---

## Step 4: Build and Run Containers

1. Open Unraid web UI and navigate to the Docker tab.

2. Use the terminal or Docker Compose plugin to run:

   ```bash
   docker-compose up -d --build
   ```

3. This will build and start the backend, frontend, and database containers.

---

## Step 5: Access the Application

- Frontend will be accessible at `http://<unraid-ip>:3000`
- Backend API will be accessible at `http://<unraid-ip>:5000`

---

## Step 6: Logs and Troubleshooting

- To view logs:

  ```bash
  docker-compose logs -f
  ```

- To stop containers:

  ```bash
  docker-compose down
  ```

- Ensure ports 3000 and 5000 are open and not blocked by firewall.

---

## Additional Notes

- You can customize Docker Compose to use different ports or add SSL termination.
- For production, consider using a reverse proxy like Nginx.
- Persist database data using Docker volumes as shown in the example.

---

This completes the deployment guide for PromptsDB on Docker in an Unraid server.
