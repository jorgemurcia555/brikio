import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InteractiveTooltip({ content, title, size = 'md' }: InteractiveTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizes = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full hover:bg-[#F4C197]/40 transition-colors"
        aria-label="Show help"
      >
        <HelpCircle className="w-5 h-5 text-[#C05A2B]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className={`absolute ${sizes[size]} bottom-full left-0 mb-2 z-50 bg-[#8A3B12] text-white rounded-xl shadow-2xl p-4`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                {title && (
                  <h4 className="font-semibold text-lg">{title}</h4>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm leading-relaxed">
                {typeof content === 'string' ? (
                  <p>{content}</p>
                ) : (
                  content
                )}
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[#8A3B12]" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

