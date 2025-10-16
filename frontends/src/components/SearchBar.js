/**
 * SearchBar Component
 * Provides search input and media type selection functionality
 */

import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const MEDIA_TYPES = [
  { value: 'all', label: 'All Media', icon: '🎯' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'movie', label: 'Movies', icon: '🎬' },
  { value: 'podcast', label: 'Podcasts', icon: '🎙️' },
  { value: 'audiobook', label: 'Audiobooks', icon: '📚' },
  { value: 'shortFilm', label: 'Short Films', icon: '🎞️' },
  { value: 'tvShow', label: 'TV Shows', icon: '📺' },
  { value: 'software', label: 'Software', icon: '💻' },
  { value: 'ebook', label: 'eBooks', icon: '📖' },
];

const SearchBar = ({ onSearch, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && !loading) {
      onSearch(searchTerm.trim(), mediaType);
    }
  };

  const handleQuickSearch = (term) => {
    setSearchTerm(term);
    onSearch(term, mediaType);
  };

  const quickSearchTerms = [
    'Taylor Swift', 'Marvel', 'Joe Rogan', 'Harry Potter', 'The Office'
  ];

  return (
    <div className="space-y-4">
      {/* Main Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for music, movies, podcasts..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
            />
          </div>

          {/* Media Type Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 min-w-[140px]"
              disabled={loading}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">
                {MEDIA_TYPES.find(type => type.value === mediaType)?.label || 'All Media'}
              </span>
              <span className="sm:hidden">
                {MEDIA_TYPES.find(type => type.value === mediaType)?.icon}
              </span>
              <svg className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showFilters && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden z-10">
                {MEDIA_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setMediaType(type.value);
                      setShowFilters(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-white/20 transition-colors duration-200 flex items-center space-x-3 ${
                      mediaType === type.value ? 'bg-white/20 text-white' : 'text-white/80'
                    }`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={!searchTerm.trim() || loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Quick Search Suggestions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-purple-200 text-sm font-medium">Quick search:</span>
        {quickSearchTerms.map((term) => (
          <button
            key={term}
            onClick={() => handleQuickSearch(term)}
            disabled={loading}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-purple-100 text-sm rounded-full transition-colors duration-200 disabled:opacity-50"
          >
            {term}
          </button>
        ))}
      </div>

      {/* Search Tips */}
      <div className="text-xs text-purple-300 space-y-1">
        <p>💡 <strong>Tips:</strong> Try searching for artist names, album titles, movie names, or podcast topics</p>
        <p>🔍 Use specific terms for better results, or browse by selecting different media types</p>
      </div>
    </div>
  );
};

export default SearchBar;