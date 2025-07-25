# Unraid Deployment Guide for BB Prompts Database

This guide provides step-by-step instructions for deploying the BB Prompts Database application on your Unraid server using Docker containers. The application is fully containerized and requires no host-level dependencies.

## Prerequisites

- Unraid server with Docker support enabled
- At least 2GB of available RAM
- 10GB of available disk space for application data
- Basic familiarity with Unraid's Docker management interface

## Quick Start

### Step 1: Add Container in Unraid

1. **Navigate to Docker Tab**:
   - Open Unraid WebUI
   - Go to **Docker** tab
   - Click **Add Container**

2. **Basic Container Settings**:
   ```
   Name: bb-prompts-database
   Repository: ghcr.io/snashaat/bb-prompts-database:latest
   Network Type: bridge
   Console shell command: bash
   ```

### Step 2: Configure Ports

**Port Mapping**:
```
Container Port: 3000
Host Port: 3000
Connection Type: TCP
```

*Note: Change host port if 3000 is already in use*

### Step 3: Configure Volume Mappings (Critical for Data Persistence)

**Database Storage**:
```
Container Path: /app/database
Host Path: /mnt/user/appdata/bb-prompts-database/database
Access Mode: Read/Write
```

**File Uploads**:
```
Container Path: /app/uploads
Host Path: /mnt/user/appdata/bb-prompts-database/uploads
Access Mode: Read/Write
```

**Thumbnails**:
```
Container Path: /app/thumbnails
Host Path: /mnt/user/appdata/bb-prompts-database/thumbnails
Access Mode: Read/Write
```

### Step 4: Environment Variables

**Required Variables**:
```
DATABASE_PATH=/app/database/database.sqlite
UPLOADS_PATH=/app/uploads
THUMBNAILS_PATH=/app/thumbnails
JWT_SECRET=your-secure-random-secret-key-change-this
PORT=3000
NODE_ENV=production
```

**Optional Variables**:
```
MAX_FILE_SIZE=10MB
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp,gif
CORS_ORIGIN=*
RATE_LIMIT_MAX=100
```

### Step 5: Deploy Container

1. **Apply Configuration**:
   - Click **Apply** to create the container
   - Wait for image download and container initialization

2. **Verify Deployment**:
   - Check container status is **Started**
   - View logs to confirm "Server running on port 3000"

3. **Access Application**:
   - Open browser to `http://YOUR-UNRAID-IP:3000`
   - Create your first admin account

## Alternative: Docker Compose Method

If you prefer using docker-compose via command line:

1. **Create compose file** on Unraid:
   ```bash
   mkdir -p /mnt/user/appdata/bb-prompts-database
   cd /mnt/user/appdata/bb-prompts-database
   ```

2. **Create docker-compose.yml**:
   ```yaml
   version: '3.8'
   services:
     app:
       image: ghcr.io/snashaat/bb-prompts-database:latest
       container_name: bb-prompts-database
       ports:
         - "3000:3000"
       volumes:
         - ./database:/app/database
         - ./uploads:/app/uploads
         - ./thumbnails:/app/thumbnails
       environment:
         - DATABASE_PATH=/app/database/database.sqlite
         - UPLOADS_PATH=/app/uploads
         - THUMBNAILS_PATH=/app/thumbnails
         - MAX_FILE_SIZE=10MB
         - ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp,gif
         - JWT_SECRET=your-secure-secret-key-change-this
         - PORT=3000
         - NODE_ENV=production
         - CORS_ORIGIN=*
         - RATE_LIMIT_MAX=100
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
         interval: 30s
         timeout: 3s
         retries: 3
   ```

3. **Deploy**:
   ```bash
   docker-compose up -d
   ```

## Building from Source (Advanced)

If you want to build the container yourself:

1. **Clone repository on Unraid**:
   ```bash
   cd /mnt/user/appdata
   git clone https://github.com/snashaat/BB_Prompts_database.git
   cd BB_Prompts_database
   ```

2. **Build container**:
   ```bash
   docker build -t bb-prompts-database:local .
   ```

3. **Use local image** in Unraid Docker settings:
   ```
   Repository: bb-prompts-database:local
   ```

## Data Management

### Backup Strategy

**Automated Backup Script**:
```bash
#!/bin/bash
# Save as /mnt/user/scripts/backup-prompts-db.sh

BACKUP_DIR="/mnt/user/backups/bb-prompts-database"
APP_DATA="/mnt/user/appdata/bb-prompts-database"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Stop container (optional)
docker stop bb-prompts-database

# Create backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$APP_DATA" .

# Start container
docker start bb-prompts-database

# Keep only last 7 backups
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

**Schedule in Unraid**:
- Go to **Settings** > **User Scripts**
- Add the backup script
- Set schedule (e.g., daily at 2 AM)

### Restore Process

```bash
# Stop container
docker stop bb-prompts-database

# Restore from backup
cd /mnt/user/appdata
rm -rf bb-prompts-database
mkdir bb-prompts-database
tar -xzf /mnt/user/backups/bb-prompts-database/backup_YYYYMMDD_HHMMSS.tar.gz -C bb-prompts-database

# Start container
docker start bb-prompts-database
```

## Security Configuration

### Production Security Settings

**Change Default JWT Secret**:
```
JWT_SECRET=generate-a-secure-random-string-at-least-32-characters-long
```

**Restrict CORS for Production**:
```
CORS_ORIGIN=https://yourdomain.com
```

**Rate Limiting**:
```
RATE_LIMIT_MAX=50  # Adjust based on usage
```

### Reverse Proxy Setup (Recommended for External Access)

**Using Nginx Proxy Manager** (available in Unraid Community Apps):

1. **Install Nginx Proxy Manager**
2. **Add Proxy Host**:
   - Domain: `prompts.yourdomain.com`
   - Forward Hostname/IP: `YOUR-UNRAID-IP`
   - Forward Port: `3000`
   - Enable SSL with Let's Encrypt

**Manual Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name prompts.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name prompts.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://YOUR-UNRAID-IP:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}
```

## Troubleshooting

### Container Issues

**Container Won't Start**:
1. Check Docker logs: Click container → **Logs**
2. Verify port availability: `netstat -tulpn | grep :3000`
3. Check disk space: Ensure sufficient space in appdata
4. Verify permissions: `ls -la /mnt/user/appdata/bb-prompts-database`

**Common Error Messages**:

*"Port already in use"*:
- Change host port from 3000 to another port (e.g., 3001)

*"Permission denied"*:
```bash
# Fix permissions
chown -R 1001:1001 /mnt/user/appdata/bb-prompts-database
chmod -R 755 /mnt/user/appdata/bb-prompts-database
```

*"Database locked"*:
- Stop container, wait 30 seconds, restart
- Check if multiple containers are accessing same database

### Application Issues

**Can't Access Web Interface**:
1. Verify container is running: Green status in Docker tab
2. Check port mapping: Ensure 3000:3000 or custom mapping
3. Test locally: `curl http://localhost:3000` from Unraid terminal
4. Check firewall: Ensure port is open for external access

**Upload Issues**:
1. Check volume mappings for `/app/uploads`
2. Verify disk space in uploads directory
3. Check file size limits in environment variables

**Performance Problems**:
1. Monitor resource usage in Docker tab
2. Check Unraid system resources
3. Consider increasing container memory limits
4. Optimize database with regular maintenance

### Health Check

The container includes a built-in health check. Monitor status:
```bash
docker ps  # Look for "healthy" status
docker inspect bb-prompts-database | grep Health -A 10
```

## Maintenance

### Updates

**Update Container**:
1. Go to Docker tab in Unraid
2. Click container name
3. Click **Force Update**
4. Wait for new image download
5. Container will restart automatically

**Update Notifications**:
- Enable auto-update notifications in Unraid settings
- Monitor GitHub releases for new versions

### Database Maintenance

**Optimize Database** (monthly):
```bash
# Access container shell
docker exec -it bb-prompts-database sh

# Run SQLite optimization
sqlite3 /app/database/database.sqlite "VACUUM; REINDEX;"
```

### Log Management

**View Logs**:
```bash
# Real-time logs
docker logs -f bb-prompts-database

# Last 100 lines
docker logs --tail 100 bb-prompts-database
```

**Log Rotation** (prevent log files from growing too large):
```bash
# Add to docker-compose.yml or container settings
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Support and Resources

- **GitHub Repository**: https://github.com/snashaat/BB_Prompts_database
- **Docker Hub**: ghcr.io/snashaat/bb-prompts-database
- **Unraid Forums**: Search for "BB Prompts Database"
- **Documentation**: Check repository README for latest updates

## Security Best Practices

1. **Change default JWT secret** before first use
2. **Use reverse proxy with SSL** for external access
3. **Regular backups** of application data
4. **Monitor access logs** for suspicious activity
5. **Keep container updated** to latest version
6. **Limit network access** if only used internally
7. **Use strong passwords** for user accounts

This deployment guide ensures your BB Prompts Database runs entirely within Docker containers on Unraid, with no host-level dependencies required.
