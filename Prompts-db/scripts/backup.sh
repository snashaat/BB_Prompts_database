#!/bin/bash

# --- Configuration ---
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILENAME="prompt-platform-backup-${TIMESTAMP}.tar.gz"

# Paths to the data directories (relative to the script's location)
DATABASE_DIR="../database"
UPLOADS_DIR="../uploads"
THUMBNAILS_DIR="../thumbnails"

# --- Main Script ---

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting backup..."

# Check if data directories exist
if [ ! -d "${DATABASE_DIR}" ] && [ ! -d "${UPLOADS_DIR}" ]; then
    echo "Error: Neither database nor uploads directory found. Nothing to back up."
    exit 1
fi

# Create a compressed archive of the data directories
tar -czvf "${BACKUP_DIR}/${BACKUP_FILENAME}" \
    -C "$(dirname "${DATABASE_DIR}")" "$(basename "${DATABASE_DIR}")" \
    -C "$(dirname "${UPLOADS_DIR}")" "$(basename "${UPLOADS_DIR}")" \
    -C "$(dirname "${THUMBNAILS_DIR}")" "$(basename "${THUMBNAILS_DIR}")"

if [ $? -eq 0 ]; then
    echo "Backup successful!"
    echo "Archive created at: ${BACKUP_DIR}/${BACKUP_FILENAME}"
else
    echo "Error: Backup failed."
    exit 1
fi
