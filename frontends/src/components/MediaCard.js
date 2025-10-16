/**
 * MediaCard Component
 * Displays individual media items from iTunes search results
 */

import React, { useState } from 'react';
import { Heart, Play, ExternalLink, Star, Calendar, User, Music, Film, Headphones, Book, Monitor, Smartphone } from 'lucide-react';

const MediaCard = ({ item, isFavorite, onToggleFavorite }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get media type icon
  const getMediaIcon = (wrapperType, kind) => {
    const iconClass = "h-4 w-4";

    switch (wrapperType?.toLowerCase()) {
      case 'track':
        return <Music className={iconClass} />;
      case 'collection':
        return <Music className={iconClass} />;
      case 'audiobook':
        return <Book className={iconClass} />;
      case 'software':
        return <Smartphone className={iconClass} />;
      default:
        break;
    }

    switch (kind?.toLowerCase()) {
      case 'song':
      case 'music-video':
        return <Music className={iconClass} />;
      case 'feature-movie':
      case 'tv-episode':
        return <Film className={iconClass} />;
      case 'podcast':
        return <Headphones className={iconClass} />;
      case 'ebook':
        return <Book className={iconClass} />;
      case 'software':
        return <Monitor className={iconClass} />;
      default:
        return <Music className={iconClass} />;
    }
  };

  // Format price
  const formatPrice = (price, currency = 'USD') => {
    if (price === undefined || price === null) return 'Not Available';
    if (price === 0) return 'Free';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      return date.getFullYear();
    } catch {
      return 'Unknown';
    }
  };

  // Format duration (in milliseconds to minutes)
  const formatDuration = (milliseconds) => {
    if (!milliseconds) return null;

    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    if (minutes < 60) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Get high quality artwork URL
  const getArtworkUrl = (url, size = 300) => {
    if (!url) return null;

    // Replace the default size with requested size
    return url.replace(/100x100bb\.jpg$/, `${size}x${size}bb.jpg`);
  };

  const artworkUrl = getArtworkUrl(item.artworkUrl100 || item.artworkUrl60);
  const duration = formatDuration(item.trackTimeMillis);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 transform hover:scale-105 group">
      {/* Artwork */}
      <div className="relative aspect-square overflow-hidden">
        {!imageError && artworkUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
                <Music className="h-12 w-12 text-white/30" />
              </div>
            )}
            <img
              src={artworkUrl}
              alt={item.trackName || item.collectionName || 'Media artwork'}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600/50 to-pink-600/50 flex items-center justify-center">
            <Music className="h-16 w-16 text-white/60" />
          </div>
        )}

        {/* Overlay with play button and favorite */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-3">
            {item.previewUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(item.previewUrl, '_blank');
                }}
                className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-colors duration-200"
                title="Play preview"
              >
                <Play className="h-5 w-5 text-white" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`p-3 rounded-full backdrop-blur-md transition-all duration-200 ${
                isFavorite
                  ? 'bg-pink-500/80 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Media type badge */}
        <div className="absolute top-3 left-3">
          <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-full flex items-center space-x-1">
            {getMediaIcon(item.wrapperType, item.kind)}
            <span className="text-white text-xs font-medium capitalize">
              {item.kind?.replace('-', ' ') || item.wrapperType}
            </span>
          </div>
        </div>

        {/* Price badge */}
        {item.trackPrice !== undefined && (
          <div className="absolute top-3 right-3">
            <div className="bg-green-500/80 backdrop-blur-md px-2 py-1 rounded-full">
              <span className="text-white text-xs font-bold">
                {formatPrice(item.trackPrice, item.currency)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
            {item.trackName || item.collectionName || 'Unknown Title'}
          </h3>
          <p className="text-purple-200 text-xs line-clamp-1">
            {item.artistName || 'Unknown Artist'}
          </p>
        </div>

        {/* Additional info */}
        <div className="space-y-2">
          {item.collectionName && item.trackName && (
            <div className="flex items-center space-x-2 text-xs text-purple-300">
              <Music className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-1">{item.collectionName}</span>
            </div>
          )}

          {item.releaseDate && (
            <div className="flex items-center space-x-2 text-xs text-purple-300">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>{formatDate(item.releaseDate)}</span>
            </div>
          )}

          {duration && (
            <div className="flex items-center space-x-2 text-xs text-purple-300">
              <Play className="h-3 w-3 flex-shrink-0" />
              <span>{duration}</span>
            </div>
          )}

          {item.primaryGenreName && (
            <div className="flex items-center space-x-2 text-xs text-purple-300">
              <Star className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-1">{item.primaryGenreName}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            {item.trackViewUrl && (
              <button
                onClick={() => window.open(item.trackViewUrl, '_blank')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors duration-200"
                title="View in iTunes"
              >
                <ExternalLink className="h-3 w-3" />
                <span>iTunes</span>
              </button>
            )}
          </div>

          {/* Rating or collection info */}
          {item.trackCount && (
            <div className="text-xs text-purple-300">
              {item.trackCount} tracks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaCard;