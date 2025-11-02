import React from 'react';
import { cn } from '@/utils/cn';

interface YeezyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  children: React.ReactNode;
}

export function YeezyButton({ 
  variant = 'primary', 
  className,
  children,
  ...props 
}: YeezyButtonProps) {
  const baseStyles = "px-8 py-4 text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-200";
  
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-700",
    secondary: "border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white",
    text: "text-neutral-900 underline hover:no-underline"
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
