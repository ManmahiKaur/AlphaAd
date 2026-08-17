import React from 'react';
import { TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const AlphaAdvisorLogo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md',
  showText = true
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xl',
    md: 'h-8 w-8 text-2xl',
    lg: 'h-10 w-10 text-3xl'
  };

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 22
  };

  return (
    <div className={twMerge('flex items-center gap-2.5', className)}>
      <div className={clsx(
        "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/30 overflow-hidden shrink-0",
        sizeClasses[size].split(' ').slice(0, 2).join(' ')
      )}>
        {/* Abstract Alpha symbol */}
        <span className="font-serif italic font-bold leading-none select-none relative z-10" style={{ fontSize: iconSize[size] * 1.2 }}>
          &alpha;
        </span>
        {/* Subtle chart overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-400/20 to-transparent pointer-events-none" />
        <TrendingUp 
          size={iconSize[size] * 0.8} 
          className="absolute -bottom-1 -right-1 text-emerald-400 opacity-80" 
          strokeWidth={3}
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={clsx(
            "font-extrabold tracking-tight text-slate-900 leading-none",
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
          )}>
            Alpha<span className="text-blue-600">Advisor</span>
          </span>
          <span className={clsx(
            "font-semibold text-slate-500 tracking-wider uppercase leading-none mt-1",
            size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-[11px]' : 'text-[9px]'
          )}>
            AI Virtual Portfolio
          </span>
        </div>
      )}
    </div>
  );
};
