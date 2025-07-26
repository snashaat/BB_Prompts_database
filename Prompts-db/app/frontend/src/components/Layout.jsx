import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon, UserIcon, ArrowLeftOnRectangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { isAuthenticated, getUser, logout } from '../utils/auth';

const Layout = ({ darkMode, setDarkMode, children }) => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Prompt Manager
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {isAuthenticated() ? (
                <>
                  {/* Create Prompt Button */}
                  <Link
                    to="/create"
                    className="flex items-center space-x-2 btn-primary"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Create</span>
                  </Link>

                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <UserIcon className="w-4 h-4" />
                      <span>{user?.username}</span>
                      {user?.role === 'admin' && (
                        <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      aria-label="Logout"
                    >
                      <ArrowLeftOnRectangleIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="btn-secondary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
