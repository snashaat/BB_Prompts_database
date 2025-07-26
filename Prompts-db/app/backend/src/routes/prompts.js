const express = require('express');
const multer = require('multer');
const { body, validationResult, query } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');
const { processImage } = require('../utils/imageProcessor');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE?.replace('MB', '')) * 1024 * 1024 || 10 * 1024 * 1024
  }
});

// Get all prompts with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString(),
  query('type').optional().isIn(['text', 'image']).withMessage('Type must be text or image'),
  query('search').optional().isString()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { category, type, search } = req.query;

  const db = getDatabase();
  
  let whereClause = 'WHERE 1=1';
  let params = [];

  if (category) {
    whereClause += ' AND c.name = ?';
    params.push(category);
  }

  if (type) {
    whereClause += ' AND p.prompt_type = ?';
    params.push(type);
  }

  if (search) {
    whereClause += ' AND (p.title LIKE ? OR p.content LIKE ? OR p.tags LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const query = `
    SELECT 
      p.id, p.title, p.content, p.prompt_type, p.tags, p.created_at,
      c.name as category,
      u.id as author_id, u.username as author_username,
      GROUP_CONCAT(i.id || ':' || i.thumbnail_path) as images
    FROM prompts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN images i ON p.id = i.prompt_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM prompts p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
  `;

  // Get total count
  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const totalItems = countResult.total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get prompts
    db.all(query, [...params, limit, offset], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const prompts = rows.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        category: row.category,
        prompt_type: row.prompt_type,
        tags: row.tags ? row.tags.split(',') : [],
        author: {
          id: row.author_id,
          username: row.author_username
        },
        images: row.images ? row.images.split(',').map(img => {
          const [id, thumbnail_path] = img.split(':');
          return { id: parseInt(id), thumbnail_path };
        }) : [],
        created_at: row.created_at
      }));

      res.json({
        prompts,
        totalPages,
        currentPage: page,
        totalItems
      });
    });
  });
});

// Get single prompt by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  const query = `
    SELECT 
      p.id, p.title, p.content, p.prompt_type, p.tags, p.created_at, p.updated_at,
      c.name as category,
      u.id as author_id, u.username as author_username
    FROM prompts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
  `;

  db.get(query, [id], (err, prompt) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Get images for this prompt
    db.all('SELECT * FROM images WHERE prompt_id = ?', [id], (err, images) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        prompt_type: prompt.prompt_type,
        tags: prompt.tags ? prompt.tags.split(',') : [],
        author: {
          id: prompt.author_id,
          username: prompt.author_username
        },
        images: images,
        created_at: prompt.created_at,
        updated_at: prompt.updated_at
      });
    });
  });
});

// Create new prompt
router.post('/', authenticateToken, upload.array('images', 5), [
  body('title').isLength({ min: 1 }).withMessage('Title is required'),
  body('content').isLength({ min: 1 }).withMessage('Content is required'),
  body('category').isLength({ min: 1 }).withMessage('Category is required'),
  body('prompt_type').isIn(['text', 'image']).withMessage('Prompt type must be text or image'),
  body('tags').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, prompt_type, tags } = req.body;
    const db = getDatabase();

    // Get category ID
    db.get('SELECT id FROM categories WHERE name = ?', [category], async (err, categoryRow) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const categoryId = categoryRow ? categoryRow.id : null;

      // Insert prompt
      db.run(
        'INSERT INTO prompts (title, content, category_id, prompt_type, tags, author_id) VALUES (?, ?, ?, ?, ?, ?)',
        [title, content, categoryId, prompt_type, tags, req.user.id],
        async function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create prompt' });
          }

          const promptId = this.lastID;

          // Process images if provided
          if (req.files && req.files.length > 0) {
            try {
              for (const file of req.files) {
                const imageData = await processImage(file, promptId);
                
                db.run(
                  'INSERT INTO images (prompt_id, filename, original_path, thumbnail_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
                  [promptId, imageData.filename, imageData.originalPath, imageData.thumbnailFilename, imageData.fileSize, imageData.mimeType]
                );
              }
            } catch (imageError) {
              console.error('Error processing images:', imageError);
              return res.status(400).json({ error: imageError.message });
            }
          }

          res.status(201).json({
            message: 'Prompt created successfully',
            prompt: { id: promptId, title, content, category, prompt_type, tags }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get categories
router.get('/categories/list', (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(categories);
  });
});

module.exports = router;
