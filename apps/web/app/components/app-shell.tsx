'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const roleLabel: Record<string, string> = {
  ADMIN: 'Admin / Owner',
  EMPLOYEE_PACKING: 'Pegawai Packing',
  EMPLOYEE_PRODUCTION: 'Pegawai Produksi',
};

type IconKey = 'home' | 'orders' | 'import' | 'products' | 'customers' | 'production';

interface NavItem {
  href: string;
  label: string;
  icon: IconKey;
}

function navForRole(role?: string): NavItem[] {
  if (role === 'ADMIN') {
    return [
      { href: '/dashboard', label: 'Dashboard', icon: 'home' },
      { href: '/orders', label: 'Pesanan', icon: 'orders' },
      { href: '/imports', label: 'Impor Marketplace', icon: 'import' },
      { href: '/products', label: 'Produk', icon: 'products' },
      { href: '/customers', label: 'Pelanggan', icon: 'customers' },
      { href: '/production', label: 'Hasil Produksi', icon: 'production' },
    ];
  }
  if (role === 'EMPLOYEE_PACKING') {
    return [
      { href: '/dashboard', label: 'Dashboard', icon: 'home' },
      { href: '/packing', label: 'Daftar Packing', icon: 'orders' },
    ];
  }
  if (role === 'EMPLOYEE_PRODUCTION') {
    return [
      { href: '/dashboard', label: 'Dashboard', icon: 'home' },
      { href: '/production', label: 'Catat Produksi', icon: 'production' },
    ];
  }
  return [{ href: '/dashboard', label: 'Dashboard', icon: 'home' }];
}

function NavIcon({ name, className = '' }: { name: IconKey; className?: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };
  switch (name) {
    case 'home':
      return (
        <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
      );
    case 'orders':
      return (
        <svg {...common}><path d="M4 5h16v14H4z" /><path d="M4 13h4l2 3h4l2-3h4" /></svg>
      );
    case 'import':
      return (
        <svg {...common}><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></svg>
      );
    case 'products':
      return (
        <svg {...common}><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5 12 12l9-4.5" /><path d="M12 12v9" /></svg>
      );
    case 'customers':
      return (
        <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 6.2a3 3 0 0 1 0 5.6" /><path d="M17.5 14.3a5 5 0 0 1 3 4.7" /></svg>
      );
    case 'production':
      return (
        <svg {...common}><path d="M4 20V9l5 3V9l5 3V9l5 3v8z" /><path d="M4 20h16" /></svg>
      );
    default:
      return null;
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = navForRole(user?.role);

  const current =
    items.find((i) => pathname === i.href || pathname.startsWith(i.href + '/')) ||
    items[0];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-off-white flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-hairline flex flex-col transform transition-transform lg:translate-x-0 lg:static ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 pt-6 pb-2">
          <p className="text-xl font-bold text-orange-600">Ratu Kriuk</p>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-gray-400 mt-5">
            KELOLA TOKO
          </p>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
                }`}
              >
                <NavIcon name={item.icon} className={active ? 'text-orange-600' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-hairline">
          <p className="text-sm font-semibold text-charcoal truncate">
            {user?.full_name || user?.username}
          </p>
          <p className="text-xs text-gray-400">
            {roleLabel[user?.role || ''] || 'Ruang kerja'}
          </p>
          <button
            onClick={handleLogout}
            className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Keluar
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-hairline px-4 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden text-gray-600 text-xl leading-none -ml-1"
              aria-label="Buka menu"
            >
              ☰
            </button>
            <nav className="flex items-center gap-2 text-sm truncate">
              <span className="text-gray-400">Ratu Kriuk</span>
              <span className="text-gray-300">/</span>
              <span className="font-medium text-charcoal truncate">{current?.label}</span>
            </nav>
          </div>
          <div className="hidden sm:block text-sm text-gray-400 whitespace-nowrap">
            Ratu Kriuk · Penjual
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
