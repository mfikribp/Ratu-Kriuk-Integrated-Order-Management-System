import { AuthProvider } from '@/lib/auth-context';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ratu Kriuk — Sistem Pencatatan Pesanan Terpadu',
  description: 'Aplikasi internal untuk menyatukan pesanan pelanggan, impor marketplace, status pesanan, packing, dan produksi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
