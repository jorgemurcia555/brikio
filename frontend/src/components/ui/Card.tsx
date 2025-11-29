import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hover = false,
      className,
      ...props
    },
    ref,
  ) => {
    const baseStyles = 'rounded-xl bg-white';

    const variants = {
      default: 'shadow-sm',
      bordered: 'border-2 border-secondary-200',
      elevated: 'shadow-lg',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const Component = hover ? motion.div : 'div';
    const motionProps = hover
      ? {
          whileHover: { y: -4 },
          transition: { duration: 0.2 },
        }
      : {};

    const finalClassName = hover && variant === 'default'
      ? clsx(baseStyles, 'shadow-sm hover:shadow-lg', paddings[padding], className)
      : clsx(baseStyles, variants[variant], paddings[padding], className);

    return (
      <Component
        ref={ref}
        className={finalClassName}
        {...motionProps}
        {...(props as any)}
      >
        {children}
      </Component>
    );
  },
);

Card.displayName = 'Card';

