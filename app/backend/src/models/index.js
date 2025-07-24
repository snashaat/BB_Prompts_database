import sequelize from '../config/database.js';
import User from './User.js';
import Prompt from './Prompt.js';
import PromptImage from './PromptImage.js';
import Category from './Category.js';
import PromptType from './PromptType.js';
import Favorite from './Favorite.js';

// Define associations
User.hasMany(Prompt, { foreignKey: 'author_id', as: 'prompts' });
Prompt.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

Prompt.hasMany(PromptImage, { foreignKey: 'prompt_id', as: 'images' });
PromptImage.belongsTo(Prompt, { foreignKey: 'prompt_id', as: 'prompt' });

User.belongsToMany(Prompt, { 
  through: Favorite, 
  foreignKey: 'user_id', 
  otherKey: 'prompt_id',
  as: 'favoritePrompts'
});

Prompt.belongsToMany(User, { 
  through: Favorite, 
  foreignKey: 'prompt_id', 
  otherKey: 'user_id',
  as: 'favoritedBy'
});

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
    
    // Seed default data
    await seedDefaultData();
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const seedDefaultData = async () => {
  // Seed prompt types
  const promptTypes = [
    { type_name: 'text', description: 'Text-based prompts' },
    { type_name: 'image', description: 'Image-based prompts' },
  ];
  
  for (const type of promptTypes) {
    await PromptType.findOrCreate({
      where: { type_name: type.type_name },
      defaults: type,
    });
  }
  
  // Seed categories
  const categories = [
    { name: 'vibe coding', description: 'Coding prompts and snippets', color: '#10B981', prompt_type_filter: 'text' },
    { name: 'AI tools', description: 'AI tool prompts and configurations', color: '#8B5CF6', prompt_type_filter: 'both' },
    { name: 'creative writing', description: 'Creative writing prompts and ideas', color: '#F59E0B', prompt_type_filter: 'text' },
    { name: 'image generation', description: 'Image generation prompts', color: '#EF4444', prompt_type_filter: 'image' },
    { name: 'photo analysis', description: 'Photo analysis and description prompts', color: '#06B6D4', prompt_type_filter: 'image' },
  ];
  
  for (const category of categories) {
    await Category.findOrCreate({
      where: { name: category.name },
      defaults: category,
    });
  }
};

export {
  sequelize,
  User,
  Prompt,
  PromptImage,
  Category,
  PromptType,
  Favorite,
  initDatabase,
};
