import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PromptImage = sequelize.define('PromptImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  prompt_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'prompts',
      key: 'id',
    },
  },
  image_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_size: {
    type: DataTypes.INTEGER,
  },
  mime_type: {
    type: DataTypes.STRING,
  },
  thumbnail_path: {
    type: DataTypes.STRING,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'prompt_images',
  underscored: true,
});

export default PromptImage;
