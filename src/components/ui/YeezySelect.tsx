import React from 'react';
import { cn } from '@/utils/cn';

interface YeezySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function YeezySelect({ 
  label,
  error,
  options,
  className,
  ...props 
}: YeezySelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs uppercase tracking-widest text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full px-6 py-4 bg-white border border-neutral-300 text-neutral-900 text-sm uppercase tracking-wide focus:outline-none focus:border-neutral-900 transition-colors",
          error && "border-red-500 focus:border-red-500",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-500 uppercase tracking-wide">{error}</p>
      )}
    </div>
  );
}


