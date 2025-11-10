import React from 'react';
import { cn } from '@/utils/cn';

interface YeezyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function YeezyInput({ 
  label,
  error,
  className,
  ...props 
}: YeezyInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs uppercase tracking-widest text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-6 py-4 bg-transparent border border-neutral-300 text-neutral-900 placeholder-neutral-400 text-sm uppercase tracking-widest focus:outline-none focus:border-neutral-900 transition-colors",
          error && "border-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 uppercase tracking-wide">{error}</p>
      )}
    </div>
  );
}


