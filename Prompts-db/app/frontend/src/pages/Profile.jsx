import React, { useState, useEffect } from 'react';
import { HeartIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { promptsAPI } from '../utils/api';
import { getUser } from '../utils/auth';

const Profile = () => {
  const [userPrompts, setUserPrompts] = useState([]);
  const [favoritePrompts, setFavoritePrompts] = useState([]);
  const [activeTab, setActiveTab] = useState('prompts');
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch user's prompts
      const promptsResponse = await promptsAPI.getPrompts({ 
        author: user.id,
        page: 1,
        limit: 50 
      });
      setUserPrompts(promptsResponse.data.prompts);

      // Fetch favorite prompts (if API supports it)
      // const favoritesResponse = await promptsAPI.getFavorites();
      // setFavoritePrompts(favoritesResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const PromptCard = ({ prompt, showFavorite = false }) => (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {prompt.prompt_type === 'image' ? (
            <div className="w-5 h-5 text-primary-600">📷</div>
          ) : (
            <DocumentTextIcon className="w-5 h-5 text-primary-600" />
          )}
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
            {prompt.category}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {showFavorite && (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(prompt.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {prompt.title}
      </h3>

      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {prompt.content}
      </p>

      {prompt.images && prompt.images.length > 0 && (
        <div className="flex space-x-2 mb-4">
          {prompt.images.slice(0, 3).map((image, index) => (
            <img
              key={index}
              src={`/thumbnails/${image.thumbnail_path}`}
              alt="Prompt thumbnail"
              className="w-16 h-16 object-cover rounded-lg"
            />
          ))}
          {prompt.images.length > 3 && (
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                +{prompt.images.length - 3}
              </span>
            </div>
          )}
        </div>
      )}

      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {prompt.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {prompt.prompt_type} prompt
        </div>
        <Link
          to={`/prompt/${prompt.id}`}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Profile Header */}
      <div className="card p-8 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {user.email}
            </p>
            {user.role === 'admin' && (
              <span className="inline-block mt-2 px-3 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
                Administrator
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {userPrompts.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Prompts Created
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {userPrompts.filter(p => p.prompt_type === 'text').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Text Prompts
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {userPrompts.filter(p => p.prompt_type === 'image').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Image Prompts
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prompts'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              My Prompts ({userPrompts.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Favorites ({favoritePrompts.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'prompts' && (
        <div>
          {userPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No prompts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You haven't created any prompts yet. Start sharing your creativity!
              </p>
              <Link
                to="/create"
                className="btn-primary"
              >
                Create Your First Prompt
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          {favoritePrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritePrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} showFavorite={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Start exploring prompts and add them to your favorites!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
