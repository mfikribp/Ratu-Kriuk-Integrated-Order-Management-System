import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ratu Kriuk — Sistem Pencatatan Pesanan Terpadu",
  description: "Aplikasi internal untuk menyatukan pesanan pelanggan, impor marketplace, status pesanan, packing, dan produksi.",
};

const headerTitle: string = "Ratu Kriuk";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-off-white p-8">
      <h1 className="text-4xl font-bold text-charcoal mb-6">Ratu Kriuk</h1>
      <p className="text-lg text-gray-600 mb-8">
        Sistem Pencatatan Pesanan Terpadu
      </p>
      <Link href="/orders" className="btn-primary mt-4">
        Input Pesanan Manual
      </Link>
    </main>
  );
}