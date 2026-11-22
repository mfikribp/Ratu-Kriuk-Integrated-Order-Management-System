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
} from '@/components/ui';
import { formatCurrency, formatDate, sourceLabel } from '@/lib/format';
import { ORDER_STATUSES, type Order } from '@/lib/types';

export default function OrdersPage() {
  const { data, loading, error, refetch, setData } = useApi<{ data: Order[] }>('/orders?limit=100');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const orders = useMemo(() => {
    let list = data?.data ?? [];
    if (statusFilter) list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search, statusFilter]);

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
      setData({ data: updated });
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
        description={`${orders.length} pesanan ditampilkan${statusFilter ? ` · status ${statusFilter}` : ''}`}
        actions={
          <Link href="/orders/new">
            <Button>+ Tambah Pesanan</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <FilterPill active={!statusFilter} onClick={() => setStatusFilter('')}>
            Semua
          </FilterPill>
          {ORDER_STATUSES.map((s) => (
            <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s}
            </FilterPill>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Cari pesanan / pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                        onClick={() => openStatusModal(order)}
                        className="text-gray-600 hover:text-charcoal"
                      >
                        Ubah Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
