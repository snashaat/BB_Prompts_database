#!/bin/bash

# --- Configuration ---
BACKUP_FILE=$1
RESTORE_DIR="../"

# --- Main Script ---

# Check if a backup file was provided
if [ -z "${BACKUP_FILE}" ]; then
    echo "Usage: ./restore.sh <path-to-backup-file.tar.gz>"
    exit 1
fi

# Check if the backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file not found at '${BACKUP_FILE}'"
    exit 1
fi

echo "--- WARNING ---"
echo "This script will overwrite the existing data in the following directories:"
echo "- ${RESTORE_DIR}database/"
echo "- ${RESTORE_DIR}uploads/"
echo "- ${RESTORE_DIR}thumbnails/"
echo "Make sure the application container is stopped before proceeding."
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

echo "Starting restore from ${BACKUP_FILE}..."

# Extract the archive to the restore directory
tar -xzvf "${BACKUP_FILE}" -C "${RESTORE_DIR}"

if [ $? -eq 0 ]; then
    echo "Restore successful!"
    echo "Data has been restored to the parent directory."
else
    echo "Error: Restore failed."
    exit 1
fi
