'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApi } from '@/lib/use-api';
import apiCall from '@/lib/api';
import {
  Button,
  Card,
  PageHeader,
  Spinner,
  ErrorState,
  StatusBadge,
  Modal,
  Toast,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/format';
import type { PackingOrderDetail } from '@/lib/types';

export default function PackingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, error, refetch } = useApi<{ data: PackingOrderDetail }>(
    `/packing/orders/${params.id}`
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null);

  const detail = data?.data;
  const canPack = detail?.status === 'Diproses';

  const handleMarkPacked = async () => {
    setSaving(true);
    try {
      await apiCall(`/packing/orders/${params.id}/mark-packed`, {
        method: 'POST',
        body: JSON.stringify({ note: '' }),
      });
      setToast({ msg: 'Pesanan berhasil ditandai sebagai Dikemas.', tone: 'success' });
      setTimeout(() => router.push('/packing?view=packed'), 900);
    } catch (err) {
      setToast({
        msg: err instanceof Error ? err.message : 'Gagal menandai pesanan.',
        tone: 'error',
      });
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!detail) return <ErrorState message="Pesanan tidak ditemukan." />;

  return (
    <>
      <div className="mb-4">
        <Link
          href={detail.status === 'Dikemas' ? '/packing?view=packed' : '/packing'}
          className="text-sm text-orange-600 hover:text-orange-700"
        >
          ← Kembali ke daftar packing
        </Link>
      </div>

      <PageHeader
        title={detail.order_number}
        description={detail.customer_name}
        actions={<StatusBadge status={detail.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-charcoal">
              {canPack ? 'Item yang Harus Dikemas' : 'Item dalam Pesanan'}
            </h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {detail.items.map((item) => (
              <li key={item.product_id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-charcoal">{item.product_name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.subtotal)}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-orange-600">{item.quantity}</span>
                  <span className="text-xs text-gray-500 ml-1">pcs</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 space-y-4">
          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">Pelanggan</p>
            <p className="font-medium text-charcoal">{detail.customer_name}</p>
            {detail.customer_phone && <p className="text-sm text-gray-600">{detail.customer_phone}</p>}
            {detail.customer_address && (
              <p className="text-sm text-gray-600 mt-1">{detail.customer_address}</p>
            )}
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs uppercase text-gray-400 mb-1">Tanggal Pesanan</p>
            <p className="text-sm text-charcoal">{formatDate(detail.order_date)}</p>
          </div>
          <div className="pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-semibold text-charcoal">{formatCurrency(detail.grand_total)}</span>
          </div>

          {canPack ? (
            <Button className="w-full" onClick={() => setConfirmOpen(true)}>
              Tandai Dikemas
            </Button>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 rounded p-3 text-center">
              Pesanan ini sudah {detail.status.toLowerCase()}. Aksi tidak tersedia.
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={confirmOpen}
        title="Konfirmasi Packing"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Batal</Button>
            <Button onClick={handleMarkPacked} loading={saving}>Ya, Tandai Dikemas</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Pastikan seluruh item pesanan <span className="font-medium text-charcoal">{detail.order_number}</span> sudah dikemas sebelum melanjutkan.
        </p>
      </Modal>

      {toast && <Toast message={toast.msg} tone={toast.tone} />}
    </>
  );
}
