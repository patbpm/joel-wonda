/**
 * LoadingSpinner Component
 * Provides consistent loading animations throughout the application
 */

import React from 'react';
import { Loader2, Music } from 'lucide-react';

const LoadingSpinner = ({
  size = 'md',
  variant = 'default',
  text = '',
  className = ''
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Variant configurations
  const variants = {
    default: {
      spinnerClass: 'text-white',
      containerClass: ''
    },
    primary: {
      spinnerClass: 'text-purple-400',
      containerClass: ''
    },
    accent: {
      spinnerClass: 'text-pink-400',
      containerClass: ''
    },
    overlay: {
      spinnerClass: 'text-white',
      containerClass: 'bg-black/50 backdrop-blur-sm'
    }
  };

  const currentVariant = variants[variant] || variants.default;
  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  // Custom iTunes-themed spinner
  const ItunesSpinner = () => (
    <div className="relative">
      {/* Outer ring */}
      <div className={`${spinnerSize} border-4 border-white/20 border-t-purple-400 rounded-full animate-spin`}></div>

      {/* Inner music note */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Music className={`${
          size === 'xs' ? 'h-2 w-2' :
          size === 'sm' ? 'h-3 w-3' :
          size === 'md' ? 'h-4 w-4' :
          size === 'lg' ? 'h-6 w-6' :
          'h-8 w-8'
        } text-purple-300 animate-pulse`} />
      </div>
    </div>
  );

  // Pulsing dots spinner
  const DotsSpinner = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${
            size === 'xs' ? 'h-1 w-1' :
            size === 'sm' ? 'h-1.5 w-1.5' :
            size === 'md' ? 'h-2 w-2' :
            size === 'lg' ? 'h-3 w-3' :
            'h-4 w-4'
          } bg-purple-400 rounded-full animate-pulse`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        ></div>
      ))}
    </div>
  );

  // Gradient spinner
  const GradientSpinner = () => (
    <div className={`${spinnerSize} relative`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-spin">
        <div className="absolute inset-1 bg-purple-900 rounded-full"></div>
      </div>
    </div>
  );

  // Select spinner type based on size and variant
  const getSpinner = () => {
    if (variant === 'overlay' || size === 'lg' || size === 'xl') {
      return <ItunesSpinner />;
    } else if (size === 'xs' || size === 'sm') {
      return <DotsSpinner />;
    } else {
      return <Loader2 className={`${spinnerSize} ${currentVariant.spinnerClass} animate-spin`} />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${currentVariant.containerClass} ${className}`}>
      {/* Spinner */}
      <div className="relative">
        {getSpinner()}
      </div>

      {/* Loading text */}
      {text && (
        <div className={`mt-3 text-center ${
          size === 'xs' || size === 'sm' ? 'text-xs' :
          size === 'md' ? 'text-sm' :
          'text-base'
        } ${currentVariant.spinnerClass} font-medium`}>
          {text}
        </div>
      )}
    </div>
  );
};

// Pre-configured spinner components for common use cases
export const SearchSpinner = ({ text = 'Searching iTunes Store...' }) => (
  <LoadingSpinner
    size="lg"
    variant="primary"
    text={text}
    className="py-8"
  />
);

export const CardSpinner = () => (
  <LoadingSpinner
    size="sm"
    variant="default"
    className="py-2"
  />
);

export const OverlaySpinner = ({ text = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <LoadingSpinner
      size="xl"
      variant="overlay"
      text={text}
      className="p-8 rounded-2xl"
    />
  </div>
);

export const InlineSpinner = ({ text = '' }) => (
  <LoadingSpinner
    size="xs"
    variant="default"
    text={text}
    className="inline-flex"
  />
);

// Skeleton loading component for cards
export const CardSkeleton = () => (
  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden animate-pulse">
    {/* Image skeleton */}
    <div className="aspect-square bg-white/10"></div>

    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-3 bg-white/5 rounded w-1/2"></div>
      </div>

      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded w-full"></div>
        <div className="h-3 bg-white/5 rounded w-2/3"></div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-white/10 rounded w-16"></div>
        <div className="h-4 bg-white/5 rounded w-12"></div>
      </div>
    </div>
  </div>
);

export default LoadingSpinner;