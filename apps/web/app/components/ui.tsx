'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-orange-600 text-white hover:bg-orange-700',
  secondary: 'bg-charcoal text-white hover:bg-black',
  outline: 'border border-gray-300 text-charcoal bg-white hover:bg-gray-50',
  ghost: 'text-charcoal hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({
  variant = 'primary',
  className = '',
  loading = false,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-hairline shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">{title}</h1>
        {description && <p className="text-gray-600 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

const badgeStyles: Record<string, string> = {
  Baru: 'bg-blue-50 text-blue-600',
  Diproses: 'bg-amber-50 text-amber-700',
  'Perlu dicek': 'bg-amber-50 text-amber-700',
  Dikemas: 'bg-sky-50 text-sky-700',
  Dikirim: 'bg-indigo-50 text-indigo-700',
  Selesai: 'bg-green-50 text-green-700',
  Dibatalkan: 'bg-red-50 text-red-600',
  COMPLETED: 'bg-green-50 text-green-700',
  PROCESSING: 'bg-amber-50 text-amber-700',
  SUCCESS: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-600',
  DUPLICATE: 'bg-gray-100 text-gray-600',
};

export function StatusBadge({ status }: { status: string }) {
  const style = badgeStyles[status] || 'bg-gray-100 text-gray-600';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style}`}
    >
      {status}
    </span>
  );
}

export function FilterPill({
  active,
  children,
  onClick,
  count,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-orange-600 text-white'
          : 'bg-white border border-hairline text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
      {typeof count === 'number' && (
        <span className={active ? 'text-white/80' : 'text-gray-400'}>{count}</span>
      )}
    </button>
  );
}

export function Pagination({
  total,
  limit,
  offset,
  onPageChange,
}: {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
}) {
  if (total <= limit) return null;

  const start = offset + 1;
  const end = Math.min(offset + limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
      <p className="text-sm text-gray-500">
        Menampilkan {start}–{end} dari {total} data
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="py-1.5"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={offset === 0}
        >
          Sebelumnya
        </Button>
        <Button
          type="button"
          variant="outline"
          className="py-1.5"
          onClick={() => onPageChange(offset + limit)}
          disabled={end >= total}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
}

export function Spinner({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <span className="h-8 w-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400 text-xl">
        ∅
      </div>
      <p className="font-medium text-charcoal">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-medium text-red-700">Terjadi kendala saat memuat data.</p>
      <p className="text-sm text-gray-500 mt-1">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Coba muat ulang
        </Button>
      )}
    </div>
  );
}

export function Input({
  label,
  error,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>}
      <input
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

export function Select({
  label,
  error,
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>}
      <select
        className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-3 border-t flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Toast({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-md shadow-lg text-sm text-white ${
        tone === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {message}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-charcoal mt-1">{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </Card>
  );
}
