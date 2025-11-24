import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import clsx from 'clsx';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showIcon?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  showIcon = true,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={clsx('relative inline-flex items-center', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (showIcon && <HelpCircle className="w-4 h-4 text-secondary-400 hover:text-secondary-600 cursor-help" />)}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'absolute z-50 px-3 py-2 text-sm text-white bg-secondary-900 rounded-lg shadow-lg whitespace-nowrap',
              positionClasses[position]
            )}
          >
            {content}
            <div
              className={clsx(
                'absolute w-2 h-2 bg-secondary-900 transform rotate-45',
                position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
                position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
                position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
                position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

