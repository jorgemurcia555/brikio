import { useState, ImgHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  lazy?: boolean;
  aspectRatio?: 'square' | '16/9' | '4/3' | '21/9';
  objectFit?: 'cover' | 'contain' | 'fill';
}

export function OptimizedImage({ 
  src, 
  alt, 
  className,
  lazy = true,
  aspectRatio,
  objectFit = 'cover',
  ...props 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClasses = {
    'square': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '21/9': 'aspect-[21/9]',
  };

  const objectFitClasses = {
    'cover': 'object-cover',
    'contain': 'object-contain',
    'fill': 'object-fill',
  };

  return (
    <div className={clsx(
      'relative overflow-hidden bg-secondary-100',
      aspectRatio && aspectRatioClasses[aspectRatio],
      className
    )}>
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-100 via-secondary-200 to-secondary-100 animate-pulse" />
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary-100">
          <div className="text-center text-secondary-400">
            <svg 
              className="w-12 h-12 mx-auto mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={clsx(
          'transition-opacity duration-300 w-full h-full',
          objectFitClasses[objectFit],
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
    </div>
  );
}

