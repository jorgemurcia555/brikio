import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'orange' | 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export function Logo({ 
  variant = 'orange', 
  size = 'md', 
  showText = true,
  textColor,
  className,
  ...props 
}: LogoProps) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const logoSrc = variant === 'light' 
    ? '/logos/brikio-logo-light.png' 
    : '/logos/brikio-logo.png';

  const defaultTextColor = variant === 'light' ? 'text-[#F4E4D7]' : 'text-[#8A3B12]';

  return (
    <div className={clsx('flex items-center gap-2', className)} {...props}>
      <img 
        src={logoSrc} 
        alt="Brikio Logo" 
        className={sizes[size]}
      />
      {showText && (
        <span className={clsx(
          'font-display font-bold tracking-wide',
          textSizes[size],
          textColor || defaultTextColor
        )}>
          Brikio
        </span>
      )}
    </div>
  );
}

