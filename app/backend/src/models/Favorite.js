import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  prompt_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'prompts',
      key: 'id',
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'favorites',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'prompt_id'],
    },
  ],
});

export default Favorite;
