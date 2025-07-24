import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, SearchIcon, HeartIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Welcome to{' '}
          <span className="text-blue-600">PromptsDB</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
          Discover, share, and organize AI prompts for coding, creative writing, 
          image generation, and more. Build your personal prompt library today.
        </p>
        <div className="mt-10 flex justify-center space-x-4">
          <Link
            to="/prompts"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <SearchIcon className="h-5 w-5 mr-2" />
            Browse Prompts
          </Link>
          {user ? (
            <Link
              to="/prompts/create"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Prompt
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Features
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Everything you need to manage your AI prompts
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mx-auto">
                <SearchIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Smart Search
              </h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                Find the perfect prompt with advanced filtering and search capabilities
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mx-auto">
                <PlusIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Create & Share
              </h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                Create your own prompts and share them with the community
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mx-auto">
                <HeartIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Favorites
              </h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                Save your favorite prompts for quick access later
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Popular Categories
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Explore prompts organized by category
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'vibe coding', color: '#10B981', count: 42 },
              { name: 'AI tools', color: '#8B5CF6', count: 28 },
              { name: 'creative writing', color: '#F59E0B', count: 35 },
              { name: 'image generation', color: '#EF4444', count: 19 },
              { name: 'photo analysis', color: '#06B6D4', count: 15 },
            ].map((category) => (
              <Link
                key={category.name}
                to={`/prompts?category=${category.name}`}
                className="block p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.count} prompts
                    </p>
                  </div>
                  <div
                    className="h-8 w-8 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
