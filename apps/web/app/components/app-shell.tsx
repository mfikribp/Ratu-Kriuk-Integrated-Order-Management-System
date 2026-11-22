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

interface NavItem {
  href: string;
  label: string;
}

function navForRole(role?: string): NavItem[] {
  if (role === 'ADMIN') {
    return [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/orders', label: 'Pesanan' },
      { href: '/imports', label: 'Impor Marketplace' },
      { href: '/products', label: 'Produk' },
      { href: '/customers', label: 'Pelanggan' },
      { href: '/production', label: 'Hasil Produksi' },
    ];
  }
  if (role === 'EMPLOYEE_PACKING') {
    return [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/packing', label: 'Daftar Packing' },
    ];
  }
  if (role === 'EMPLOYEE_PRODUCTION') {
    return [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/production', label: 'Catat Produksi' },
    ];
  }
  return [{ href: '/dashboard', label: 'Dashboard' }];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = navForRole(user?.role);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-off-white flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform lg:translate-x-0 lg:static ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-xl font-bold text-charcoal">Ratu Kriuk</p>
          <p className="text-xs text-gray-500 mt-0.5">Sistem Pesanan Terpadu</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-sm font-medium text-charcoal truncate">
            {user?.full_name || user?.username}
          </p>
          <p className="text-xs text-gray-500">{roleLabel[user?.role || ''] || user?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-left text-sm text-red-600 hover:text-red-700"
          >
            Keluar
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="text-gray-700 text-xl leading-none"
            aria-label="Buka menu"
          >
            ☰
          </button>
          <span className="font-semibold text-charcoal">Ratu Kriuk</span>
          <span className="w-6" />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
