import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full px-4 py-2 rounded-lg border-2 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:bg-secondary-50 disabled:cursor-not-allowed',
              icon && 'pl-10',
              error
                ? 'border-accent-500 focus:ring-accent-500'
                : 'border-secondary-200 hover:border-secondary-300',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-accent-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

