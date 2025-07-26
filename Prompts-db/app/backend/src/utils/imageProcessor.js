const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const UPLOADS_PATH = process.env.UPLOADS_PATH || './uploads';
const THUMBNAILS_PATH = process.env.THUMBNAILS_PATH || './thumbnails';

// Ensure directories exist
[UPLOADS_PATH, THUMBNAILS_PATH].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const generateThumbnail = async (inputPath, filename) => {
  try {
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = path.join(THUMBNAILS_PATH, thumbnailFilename);

    await sharp(inputPath)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailFilename;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};

const validateImage = (file) => {
  const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,webp,gif').split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (!allowedTypes.includes(fileExtension)) {
    throw new Error(`File type ${fileExtension} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  const maxSize = parseInt(process.env.MAX_FILE_SIZE?.replace('MB', '')) * 1024 * 1024 || 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File size too large. Maximum size: ${process.env.MAX_FILE_SIZE || '10MB'}`);
  }

  return true;
};

const processImage = async (file, promptId) => {
  try {
    validateImage(file);

    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${promptId}_${timestamp}${extension}`;
    const filepath = path.join(UPLOADS_PATH, filename);

    // Save original file
    fs.writeFileSync(filepath, file.buffer);

    // Generate thumbnail
    const thumbnailFilename = await generateThumbnail(filepath, filename);

    return {
      filename,
      originalPath: filepath,
      thumbnailPath: path.join(THUMBNAILS_PATH, thumbnailFilename),
      thumbnailFilename,
      fileSize: file.size,
      mimeType: file.mimetype
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

module.exports = {
  processImage,
  validateImage,
  generateThumbnail
};
