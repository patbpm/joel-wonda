import React, { useState, useEffect } from 'react';
import { Music, Search, Heart, Star, Calendar, User, AlertCircle } from 'lucide-react';
import SearchBar from './components/SearchBar';
import MediaCard from './components/MediaCard';
import FavoritesList from './components/FavoritesList';
import LoadingSpinner from './components/LoadingSpinner';
import { searchItunes, generateToken } from './services/api';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('all');
  const [currentView, setCurrentView] = useState('search');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await generateToken();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        setError('Failed to initialize app. Please refresh the page.');
      }
    };

    initializeAuth();
  }, []);

  // Handle search
  const handleSearch = async (term, media) => {
    if (!term.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchTerm(term);
    setMediaType(media);

    try {
      const response = await searchItunes(term, media);
      setSearchResults(response.data.results || []);
      
      if (response.data.results.length === 0) {
        setError('No results found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError(error.response?.data?.message || 'Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Add to favorites
  const addToFavorites = (item) => {
    const isAlreadyFavorite = favorites.some(fav => fav.uniqueId === item.uniqueId);
    
    if (!isAlreadyFavorite) {
      setFavorites(prev => [...prev, item]);
    }
  };

  // Remove from favorites
  const removeFromFavorites = (itemId) => {
    setFavorites(prev => prev.filter(fav => fav.uniqueId !== itemId));
  };

  // Check if item is in favorites
  const isFavorite = (itemId) => {
    return favorites.some(fav => fav.uniqueId === itemId);
  };

  // Clear search results
  const clearSearch = () => {
    setSearchResults([]);
    setSearchTerm('');
    setError(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg">Initializing iTunes Search...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-xl">
                <Music className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">iTunes Search</h1>
                <p className="text-purple-200 text-sm">Discover music, movies, podcasts & more</p>
              </div>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentView('search')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  currentView === 'search'
                    ? 'bg-white/20 text-white'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
              <button
                onClick={() => setCurrentView('favorites')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 relative ${
                  currentView === 'favorites'
                    ? 'bg-white/20 text-white'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Favorites</span>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'search' ? (
          <>
            {/* Search Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Search the iTunes Store
                </h2>
                <p className="text-purple-200">
                  Find music, movies, podcasts, audiobooks, and more
                </p>
              </div>
              
              <SearchBar onSearch={handleSearch} loading={loading} />
              
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200">{error}</p>
                </div>
              )}
            </div>

            {/* Search Results */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-white">Searching iTunes Store...</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Search Results
                    <span className="text-purple-300 text-lg font-normal ml-2">
                      ({searchResults.length} {searchResults.length === 1 ? 'result' : 'results'})
                    </span>
                  </h3>
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
                  >
                    Clear Results
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((item) => (
                    <MediaCard
                      key={item.uniqueId}
                      item={item}
                      isFavorite={isFavorite(item.uniqueId)}
                      onToggleFavorite={() => 
                        isFavorite(item.uniqueId) 
                          ? removeFromFavorites(item.uniqueId)
                          : addToFavorites(item)
                      }
                    />
                  ))}
                </div>
              </div>
            ) : searchTerm && !loading ? (
              <div className="text-center py-12">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                  <Search className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                  <p className="text-purple-200 mb-4">
                    No results found for "{searchTerm}" in {mediaType === 'all' ? 'all categories' : mediaType}.
                  </p>
                  <p className="text-purple-300 text-sm">
                    Try adjusting your search terms or selecting a different media type.
                  </p>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          /* Favorites View */
          <FavoritesList
            favorites={favorites}
            onRemoveFavorite={removeFromFavorites}
            onBackToSearch={() => setCurrentView('search')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-xl">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">iTunes Search</h3>
              </div>
              <p className="text-purple-200 text-sm">
                Discover and explore content from the iTunes Store with our powerful search application.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-purple-200">
                <li>• Search across all media types</li>
                <li>• Save favorites for quick access</li>
                <li>• High-quality artwork and details</li>
                <li>• Real-time search results</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Search Categories</h4>
              <ul className="space-y-2 text-sm text-purple-200">
                <li>• Music & Albums</li>
                <li>• Movies & TV Shows</li>
                <li>• Podcasts & Audiobooks</li>
                <li>• Software & eBooks</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-6 text-center">
            <p className="text-purple-300 text-sm">
              © 2025 iTunes Search App. Powered by iTunes Search API.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;