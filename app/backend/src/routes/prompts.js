import express from 'express';
import { body, query, validationResult } from 'express-validator';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { Prompt, PromptImage, Category, User, Favorite } from '../models/index.js';

const router = express.Router();

// Get all prompts with filtering
router.get('/', [
  query('category').optional().isString(),
  query('prompt_type').optional().isIn(['text', 'image']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, prompt_type, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (prompt_type) where.prompt_type = prompt_type;
    if (search) {
      where.$or = [
        { title: { $like: `%${search}%` } },
        { content: { $like: `%${search}%` } },
        { tags: { $like: `%${search}%` } },
      ];
    }

    const { count, rows: prompts } = await Prompt.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'username'] },
        { model: PromptImage, as: 'images' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      prompts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single prompt
router.get('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username'] },
        { model: PromptImage, as: 'images' },
      ],
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create prompt
router.post('/', authenticateToken, [
  body('title').isLength({ min: 1, max: 255 }),
  body('content').isLength({ min: 1 }),
  body('category').isLength({ min: 1 }),
  body('prompt_type').isIn(['text', 'image']),
  body('tags').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, prompt_type, tags } = req.body;

    const prompt = await Prompt.create({
      title,
      content,
      category,
      prompt_type,
      tags: tags || [],
      author_id: req.user.id,
    });

    const promptWithAuthor = await Prompt.findByPk(prompt.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username'] },
        { model: PromptImage, as: 'images' },
      ],
    });

    res.status(201).json(promptWithAuthor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update prompt
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ min: 1, max: 255 }),
  body('content').optional().isLength({ min: 1 }),
  body('category').optional().isLength({ min: 1 }),
  body('prompt_type').optional().isIn(['text', 'image']),
  body('tags').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prompt = await Prompt.findByPk(req.params.id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    if (prompt.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prompt.update(req.body);
    
    const updatedPrompt = await Prompt.findByPk(prompt.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username'] },
        { model: PromptImage, as: 'images' },
      ],
    });

    res.json(updatedPrompt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete prompt
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const prompt = await Prompt.findByPk(req.params.id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    if (prompt.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete associated images
    const images = await PromptImage.findAll({ where: { prompt_id: prompt.id } });
    for (const image of images) {
      if (fs.existsSync(image.image_path)) {
        fs.unlinkSync(image.image_path);
      }
      if (fs.existsSync(image.thumbnail_path)) {
        fs.unlinkSync(image.thumbnail_path);
      }
    }

    await prompt.destroy();
    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image for prompt
router.post('/:id/images', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const prompt = await Prompt.findByPk(req.params.id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    if (prompt.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate thumbnail
    const thumbnailFilename = `thumb_${req.file.filename}`;
    const thumbnailPath = path.join(process.env.THUMBNAILS_PATH || path.join(process.cwd(), '..', 'thumbnails'), thumbnailFilename);

    await sharp(req.file.path)
      .resize(300, 300, { fit: 'cover' })
      .toFile(thumbnailPath);

    const promptImage = await PromptImage.create({
      prompt_id: prompt.id,
      image_path: req.file.path,
      image_filename: req.file.filename,
      image_size: req.file.size,
      mime_type: req.file.mimetype,
      thumbnail_path: thumbnailPath,
    });

    res.status(201).json(promptImage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle favorite
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const prompt = await Prompt.findByPk(req.params.id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const favorite = await Favorite.findOne({
      where: { user_id: req.user.id, prompt_id: prompt.id },
    });

    if (favorite) {
      await favorite.destroy();
      res.json({ message: 'Removed from favorites', favorited: false });
    } else {
      await Favorite.create({ user_id: req.user.id, prompt_id: prompt.id });
      res.json({ message: 'Added to favorites', favorited: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's favorite prompts
router.get('/favorites/me', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Prompt,
          include: [
            { model: User, as: 'author', attributes: ['id', 'username'] },
            { model: PromptImage, as: 'images' },
          ],
        },
      ],
    });

    const prompts = favorites.map(f => f.Prompt);
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
