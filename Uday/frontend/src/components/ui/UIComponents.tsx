import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`glass-card rounded-xl p-5 ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', type = 'button', className = '', disabled = false }) => {
  let base = 'px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ';
  if (variant === 'primary') base += 'bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25';
  else if (variant === 'secondary') base += 'bg-white hover:bg-blue-50 text-blue-600 border border-blue-200';
  else if (variant === 'danger') base += 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25';
  else if (variant === 'ghost') base += 'bg-transparent hover:bg-blue-50 text-blue-600';

  return (
    <button type={type} onClick={onClick} className={`${base} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

export const Input: React.FC<{
  label?: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
}> = ({ label, type = 'text', placeholder, value, onChange, className = '', required = false }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder-slate-400 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all shadow-sm ${className}`}
    />
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="glass-panel max-w-lg w-full rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 text-xl font-bold">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' }> = ({
  children,
  variant = 'gray'
}) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  if (variant === 'green') style = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
  if (variant === 'red') style = 'bg-rose-500/10 text-rose-600 border-rose-500/30';
  if (variant === 'yellow') style = 'bg-amber-500/10 text-amber-600 border-amber-500/30';
  if (variant === 'blue') style = 'bg-blue-50 text-blue-600 border-blue-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {children}
    </span>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => (
  <div className={`bg-slate-200 animate-pulse rounded-lg ${className}`} />
);
