'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/use-api';
import {
  Card,
  PageHeader,
  StatCard,
  Spinner,
  ErrorState,
  StatusBadge,
  EmptyState,
  Button,
} from '@/components/ui';
import { formatCurrency, formatDate, sourceLabel } from '@/lib/format';
import type { Order, PackingOrder, ProductionBatch } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'EMPLOYEE_PACKING') return <PackingDashboard />;
  if (user?.role === 'EMPLOYEE_PRODUCTION') return <ProductionDashboard />;
  return <AdminDashboard />;
}

function AdminDashboard() {
  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useApi<{ data: Order[] }>('/orders?limit=6');
  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useApi<{ total: number; statuses: Record<string, number> }>('/orders/summary');

  if (ordersLoading || summaryLoading) return <Spinner />;
  if (ordersError || summaryError) {
    return (
      <ErrorState
        message={ordersError || summaryError || 'Gagal memuat ringkasan pesanan.'}
        onRetry={() => { void refetchOrders(); void refetchSummary(); }}
      />
    );
  }

  const recent = ordersData?.data ?? [];
  const count = (status: string) => summary?.statuses[status] ?? 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Ringkasan pesanan dan aktivitas operasional."
        actions={
          <>
            <Link href="/orders/new">
              <Button>Input Pesanan</Button>
            </Link>
            <Link href="/imports">
              <Button variant="outline">Impor Marketplace</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Pesanan" value={summary?.total ?? 0} />
        <StatCard label="Diproses" value={count('Diproses')} />
        <StatCard label="Dikemas" value={count('Dikemas')} />
        <StatCard label="Dikirim / Selesai" value={count('Dikirim') + count('Selesai')} />
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-charcoal">Pesanan Terbaru</h2>
          <Link href="/orders" className="text-sm text-orange-600 hover:text-orange-700">
            Lihat semua
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState title="Belum ada pesanan" description="Mulai dengan input pesanan manual atau impor marketplace." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">No. Pesanan</th>
                  <th className="text-left px-5 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-5 py-3 font-medium">Sumber</th>
                  <th className="text-right px-5 py-3 font-medium">Total</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-charcoal">
                      <Link href={`/orders/${order.id}`} className="hover:text-orange-600">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(order.order_date)}</td>
                    <td className="px-5 py-3 text-gray-600">{sourceLabel(order.source)}</td>
                    <td className="px-5 py-3 text-right text-gray-800">{formatCurrency(order.grand_total)}</td>
                    <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function PackingDashboard() {
  const { data, loading, error, refetch } = useApi<{ data: PackingOrder[] }>(
    '/packing/orders?limit=100'
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const orders = data?.data ?? [];

  return (
    <>
      <PageHeader title="Dashboard Packing" description="Pesanan yang perlu segera dikemas." />
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Perlu Dikemas" value={orders.length} />
        <StatCard
          label="Total Item"
          value={orders.reduce((sum, o) => sum + o.item_count, 0)}
        />
      </div>
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-charcoal">Antrian Packing</h2>
          <Link href="/packing" className="text-sm text-orange-600 hover:text-orange-700">
            Buka daftar
          </Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState title="Tidak ada pesanan yang perlu dikemas." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal">{o.order_number}</p>
                  <p className="text-xs text-gray-500">{o.customer_name} · {o.item_count} item</p>
                </div>
                <Link href={`/packing/${o.id}`}>
                  <Button variant="outline" className="py-1.5">Detail</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function ProductionDashboard() {
  const { data, loading, error, refetch } = useApi<{ data: ProductionBatch[] }>(
    '/production/batches?limit=100'
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const batches = data?.data ?? [];
  const totalKg = batches.reduce(
    (sum, batch) => sum + (batch.quantity_unit === 'KG' ? batch.quantity : 0),
    0
  );

  return (
    <>
      <PageHeader
        title="Dashboard Produksi"
        description="Catat dan pantau hasil produksi harian."
        actions={
          <Link href="/production/new">
            <Button>Catat Hasil Produksi</Button>
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Total Batch" value={batches.length} />
        <StatCard label="Total Produksi (kg)" value={totalKg} />
      </div>
      <Card>
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-charcoal">Batch Terbaru</h2>
        </div>
        {batches.length === 0 ? (
          <EmptyState title="Belum ada hasil produksi dicatat." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {batches.slice(0, 5).map((b) => (
              <li key={b.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal">{b.product_name}</p>
                  <p className="text-xs text-gray-500">{formatDate(b.production_date)}</p>
                </div>
                <span className="text-sm text-gray-700">
                  {b.quantity} {b.quantity_unit === 'KG' ? 'kg' : 'pcs'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
