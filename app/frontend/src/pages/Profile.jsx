import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { HeartIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [myPrompts, setMyPrompts] = useState([]);
  const [activeTab, setActiveTab] = useState('favorites');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
    fetchMyPrompts();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/api/prompts/favorites/me');
      setFavorites(response.data);
    } catch (error) {
      console.error('Failed to fetch favorites');
    }
  };

  const fetchMyPrompts = async () => {
    try {
      const response = await axios.get(`/api/prompts?author_id=${user.id}`);
      setMyPrompts(response.data.prompts);
    } catch (error) {
      console.error('Failed to fetch my prompts');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (promptId) => {
    try {
      await axios.post(`/api/prompts/${promptId}/favorite`);
      setFavorites(favorites.filter(prompt => prompt.id !== promptId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove favorite');
    }
  };

  const deletePrompt = async (promptId) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;

    try {
      await axios.delete(`/api/prompts/${promptId}`);
      setMyPrompts(myPrompts.filter(prompt => prompt.id !== promptId));
      toast.success('Prompt deleted successfully');
    } catch (error) {
      toast.error('Failed to delete prompt');
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome back, {user.username}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HeartIcon className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Favorites</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{favorites.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">My Prompts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{myPrompts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Favorites ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('myPrompts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'myPrompts'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Prompts ({myPrompts.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(prompt => (
            <div key={prompt.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {prompt.title}
                  </h3>
                  <button
                    onClick={() => removeFavorite(prompt.id)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {truncateText(prompt.content)}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                    {prompt.category}
                  </span>
                  <span className="text-xs">
                    {formatDate(prompt.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'myPrompts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPrompts.map(prompt => (
            <div key={prompt.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {prompt.title}
                  </h3>
                  <button
                    onClick={() => deletePrompt(prompt.id)}
                    className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <XMarkIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {truncateText(prompt.content)}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                    {prompt.category}
                  </span>
                  <span className="text-xs">
                    {formatDate(prompt.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'favorites' && favorites.length === 0 && (
        <div className="text-center py-12">
          <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">No favorite prompts yet.</p>
        </div>
      )}

      {activeTab === 'myPrompts' && myPrompts.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">You haven't created any prompts yet.</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
