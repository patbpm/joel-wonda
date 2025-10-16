/**
 * FavoritesList Component
 * Displays and manages user's favorite items
 */

import React, { useState } from 'react';
import { Heart, Trash2, Search, Star, Filter, ArrowLeft } from 'lucide-react';
import MediaCard from './MediaCard';

const FavoritesList = ({ favorites, onRemoveFavorite, onBackToSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Filter favorites based on search term and type
  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = !searchTerm || 
      item.trackName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.collectionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.artistName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      item.wrapperType === filterType || 
      item.kind === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Sort favorites
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.trackName || a.collectionName || '').localeCompare(
          b.trackName || b.collectionName || ''
        );
      case 'artist':
        return (a.artistName || '').localeCompare(b.artistName || '');
      case 'date':
        return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
      case 'recent':
      default:
        return b.uniqueId - a.uniqueId; // Assuming higher uniqueId means more recent
    }
  });

  // Get unique media types from favorites
  const getMediaTypes = () => {
    const types = new Set(['all']);
    favorites.forEach(item => {
      if (item.wrapperType) types.add(item.wrapperType);
      if (item.kind) types.add(item.kind);
    });
    return Array.from(types);
  };

  // Clear all favorites
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all favorites? This action cannot be undone.')) {
      favorites.forEach(item => onRemoveFavorite(item.uniqueId));
    }
  };

  // Export favorites as JSON
  const handleExportFavorites = () => {
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `itunes-favorites-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
          <div className="mb-6">
            <Heart className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Favorites Yet</h2>
            <p className="text-purple-200">
              Start exploring and add items to your favorites by clicking the heart icon.
            </p>
          </div>
          
          <button
            onClick={onBackToSearch}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
          >
            Start Searching
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToSearch}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              title="Back to search"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Heart className="h-6 w-6 text-pink-400" />
                <span>My Favorites</span>
              </h2>
              <p className="text-purple-200">
                {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleExportFavorites}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 text-sm"
              title="Export favorites as JSON"
            >
              Export
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 rounded-lg transition-colors duration-200 text-sm"
              title="Clear all favorites"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search favorites..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent appearance-none cursor-pointer"
            >
              {getMediaTypes().map(type => (
                <option key={type} value={type} className="bg-gray-800 text-white">
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="relative">
            <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="recent" className="bg-gray-800 text-white">Recently Added</option>
              <option value="name" className="bg-gray-800 text-white">Name (A-Z)</option>
              <option value="artist" className="bg-gray-800 text-white">Artist (A-Z)</option>
              <option value="date" className="bg-gray-800 text-white">Release Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {(searchTerm || filterType !== 'all') && (
        <div className="flex items-center justify-between text-sm text-purple-200">
          <span>
            Showing {sortedFavorites.length} of {favorites.length} favorites
            {searchTerm && ` for "${searchTerm}"`}
            {filterType !== 'all' && ` in ${filterType}`}
          </span>
          {(searchTerm || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="text-purple-300 hover:text-white transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Favorites Grid */}
      {sortedFavorites.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedFavorites.map((item) => (
              <div key={item.uniqueId} className="relative group">
                <MediaCard
                  item={item}
                  isFavorite={true}
                  onToggleFavorite={() => onRemoveFavorite(item.uniqueId)}
                />
                
                {/* Quick Remove Button */}
                <button
                  onClick={() => onRemoveFavorite(item.uniqueId)}
                  className="absolute top-2 left-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 hover:scale-100"
                  title="Remove from favorites"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Pagination Info */}
          {sortedFavorites.length > 20 && (
            <div className="text-center py-4">
              <p className="text-purple-300 text-sm">
                Showing {Math.min(20, sortedFavorites.length)} items
                {sortedFavorites.length > 20 && ` of ${sortedFavorites.length} total`}
              </p>
            </div>
          )}
        </>
      ) : (
        /* No Results */
        <div className="text-center py-12">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <Search className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Favorites Found</h3>
            <p className="text-purple-200 mb-4">
              {searchTerm ? (
                <>No favorites match "{searchTerm}"</>
              ) : (
                <>No favorites found for the selected filter</>
              )}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
            >
              Show All Favorites
            </button>
          </div>
        </div>
      )}

      {/* Favorites Stats */}
      {favorites.length > 0 && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Favorites Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {favorites.length}
              </div>
              <div className="text-sm text-purple-200">Total Items</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">
                {new Set(favorites.map(f => f.artistName)).size}
              </div>
              <div className="text-sm text-purple-200">Unique Artists</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {new Set(favorites.map(f => f.wrapperType || f.kind)).size}
              </div>
              <div className="text-sm text-purple-200">Media Types</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {new Set(favorites.map(f => f.primaryGenre)).size}
              </div>
              <div className="text-sm text-purple-200">Genres</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesList;