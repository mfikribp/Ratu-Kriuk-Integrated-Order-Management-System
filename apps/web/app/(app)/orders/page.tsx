'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useApi } from '@/lib/use-api';
import apiCall from '@/lib/api';
import {
  Button,
  Card,
  PageHeader,
  Spinner,
  ErrorState,
  EmptyState,
  StatusBadge,
  Input,
  Select,
  Modal,
  Toast,
  FilterPill,
  Pagination,
} from '@/components/ui';
import { formatCurrency, formatDate, sourceLabel } from '@/lib/format';
import { ORDER_STATUSES, type Order } from '@/lib/types';

const PAGE_SIZE = 50;

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const offset = page * PAGE_SIZE;
  const endpoint = useMemo(() => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    if (search.trim()) params.set('search', search.trim());
    if (statusFilter) params.set('status', statusFilter);
    return `/orders?${params.toString()}`;
  }, [offset, search, statusFilter]);
  const { data, loading, error, refetch, setData } = useApi<{
    data: Order[];
    pagination: { total: number; limit: number; offset: number };
  }>(endpoint);
  const orders = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  const openStatusModal = (order: Order) => {
    setSelected(order);
    setNewStatus(order.status);
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await apiCall(`/orders/${selected.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ new_status: newStatus }),
      });
      const updated = (data?.data ?? []).map((o) =>
        o.id === selected.id ? { ...o, status: newStatus } : o
      );
      setData({
        data: updated,
        pagination: data?.pagination ?? { total, limit: PAGE_SIZE, offset },
      });
      setToast('Status pesanan berhasil diperbarui.');
      setSelected(null);
      setTimeout(() => setToast(''), 2500);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Gagal memperbarui status.');
      setTimeout(() => setToast(''), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Inbox Pesanan"
        description={`${total} pesanan ditemukan${statusFilter ? ` · status ${statusFilter}` : ''}`}
        actions={
          <Link href="/orders/new">
            <Button>+ Tambah Pesanan</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <FilterPill active={!statusFilter} onClick={() => { setStatusFilter(''); setPage(0); }}>
            Semua
          </FilterPill>
          {ORDER_STATUSES.map((s) => (
            <FilterPill key={s} active={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(0); }}>
              {s}
            </FilterPill>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Cari pesanan / pelanggan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="Belum ada pesanan"
            description="Pesanan yang Anda buat akan muncul di sini."
            action={
              <Link href="/orders/new">
                <Button>Input Pesanan</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400">
                <tr className="border-b border-hairline">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wide">No. Pesanan</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wide">Tanggal</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wide">Sumber</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold uppercase tracking-wide">Total</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wide">Status</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-charcoal">
                      <Link href={`/orders/${order.id}`} className="hover:text-orange-600">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(order.order_date)}</td>
                    <td className="px-6 py-4 text-gray-600">{sourceLabel(order.source)}</td>
                    <td className="px-6 py-4 text-right text-gray-800">
                      {formatCurrency(order.grand_total)}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <Link href={`/orders/${order.id}`} className="text-orange-600 hover:text-orange-700">
                        Detail
                      </Link>
                      <button
                        type="button"
                        onClick={() => openStatusModal(order)}
                        className="font-medium text-orange-600 underline decoration-orange-300 underline-offset-4 hover:text-orange-700 hover:decoration-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-sm"
                      >
                        Ubah Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              total={total}
              limit={PAGE_SIZE}
              offset={offset}
              onPageChange={(nextOffset) => setPage(Math.floor(nextOffset / PAGE_SIZE))}
            />
          </div>
        )}
      </Card>

      <Modal
        open={!!selected}
        title="Ubah Status Pesanan"
        onClose={() => setSelected(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>Batal</Button>
            <Button
              onClick={handleUpdateStatus}
              loading={saving}
              disabled={!newStatus || newStatus === selected?.status}
            >
              Simpan
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-3">
          Pesanan <span className="font-medium text-charcoal">{selected?.order_number}</span>
        </p>
        <Select label="Status Baru" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </Modal>

      {toast && <Toast message={toast} />}
    </>
  );
}
