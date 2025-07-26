import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Download, User, Calendar, Tag, Image as ImageIcon, FileText, ZoomIn } from 'lucide-react';
import { promptsAPI } from '../utils/api';

const PromptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPrompt();
  }, [id]);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      const response = await promptsAPI.getPrompt(id);
      setPrompt(response.data);
    } catch (error) {
      setError('Failed to load prompt details');
      console.error('Error fetching prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([prompt.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const ImageModal = ({ image, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={`/uploads/${image.file_path}`}
          alt="Full size"
          className="max-w-full max-h-full object-contain"
        />
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

  if (error || !prompt) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error || 'Prompt not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </button>

      {/* Header */}
      <div className="card p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {prompt.prompt_type === 'image' ? (
              <ImageIcon className="w-6 h-6 text-primary-600" />
            ) : (
              <FileText className="w-6 h-6 text-primary-600" />
            )}
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
              {prompt.category}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="btn-secondary flex items-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {prompt.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>by {prompt.author.username}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
          </div>
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-4 h-4" />
              <span>{prompt.tags.length} tags</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Prompt Content
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <pre className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 font-mono text-sm leading-relaxed">
            {prompt.content}
          </pre>
        </div>
      </div>

      {/* Images */}
      {prompt.images && prompt.images.length > 0 && (
        <div className="card p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Images ({prompt.images.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompt.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={`/thumbnails/${image.thumbnail_path}`}
                  alt={`Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => setSelectedImage(image)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {prompt.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default PromptDetail;
