import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// QuickBooks palette
export const QB = {
  green: '#569DE6',
  greenDark: '#3A7BC2',
  greenLight: '#E8F0FB',
  text: '#393A3D',
  textMuted: '#6B6C72',
  border: '#D4D7DC',
  bg: '#F4F5F8'
};

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 pb-4 mb-6 border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-semibold text-[#393A3D]">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, actions, children, className = '' }: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            {title && <h2 className="text-base font-semibold text-[#393A3D]">{title}</h2>}
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export function Btn({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#569DE6]';
  const styles: Record<BtnVariant, string> = {
    primary: 'bg-[#569DE6] text-white hover:bg-[#4585CC] active:bg-[#3A7BC2]',
    secondary: 'bg-white text-[#393A3D] border border-gray-300 hover:bg-gray-50',
    ghost: 'bg-transparent text-[#569DE6] hover:bg-[#E8F0FB]',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...rest} />;
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-[#393A3D] placeholder-gray-400 focus:outline-none focus:border-[#569DE6] focus:ring-2 focus:ring-[#569DE6]/30 ${className}`}
      {...rest}
    />
  );
}

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-[#393A3D] focus:outline-none focus:border-[#569DE6] focus:ring-2 focus:ring-[#569DE6]/30 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

export function TextArea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-[#393A3D] placeholder-gray-400 focus:outline-none focus:border-[#569DE6] focus:ring-2 focus:ring-[#569DE6]/30 ${className}`}
      {...rest}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}

type BadgeTone = 'green' | 'red' | 'amber' | 'blue' | 'gray';
export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: ReactNode }) {
  const tones: Record<BadgeTone, string> = {
    green: 'bg-[#E8F0FB] text-[#3A7BC2]',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-100 text-gray-700'
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Alert({ tone = 'info', children }: { tone?: 'info' | 'success' | 'warn' | 'error'; children: ReactNode }) {
  const tones = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-[#E8F0FB] border-[#BFD7F2] text-[#3A7BC2]',
    warn: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };
  return <div className={`border rounded-md px-3 py-2 text-sm ${tones[tone]}`}>{children}</div>;
}
