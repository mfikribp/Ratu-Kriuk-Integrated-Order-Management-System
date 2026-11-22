'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApi } from '@/lib/use-api';
import apiCall from '@/lib/api';
import {
  Button,
  Card,
  PageHeader,
  Input,
  Select,
  Spinner,
  Toast,
  ErrorState,
} from '@/components/ui';
import type { Product } from '@/lib/types';

export default function NewProductionPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useApi<{ data: Product[] }>('/products?limit=100');
  const products = data?.data ?? [];

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [productionDate, setProductionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [batchCode, setBatchCode] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity || Number(quantity) <= 0) {
      setToast({ msg: 'Pilih produk dan isi jumlah yang valid.', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      await apiCall('/production/batches', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          quantity: Number(quantity),
          production_date: new Date(productionDate).toISOString(),
          batch_code: batchCode,
          notes,
        }),
      });
      setToast({ msg: 'Hasil produksi berhasil dicatat.', tone: 'success' });
      setTimeout(() => router.push('/production'), 800);
    } catch (err) {
      setToast({
        msg: err instanceof Error ? err.message : 'Gagal mencatat hasil produksi.',
        tone: 'error',
      });
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <>
      <div className="mb-4">
        <Link href="/production" className="text-sm text-orange-600 hover:text-orange-700">
          ← Kembali ke hasil produksi
        </Link>
      </div>
      <PageHeader
        title="Catat Hasil Produksi"
        description="Catat hasil produksi dalam kilogram. Setiap penyimpanan membuat batch baru."
      />

      <form onSubmit={handleSubmit} className="max-w-xl">
        <Card className="p-5 space-y-4">
          <Select
            label="Produk"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            <option value="">Pilih produk</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          {products.length === 0 && (
            <p className="text-sm text-amber-700">
              Belum ada produk aktif yang bisa dipilih. Minta admin menambahkan atau mengaktifkan produk.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Jumlah Hasil Produksi"
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Contoh: 5 kg"
              required
            />
            <Input
              label="Tanggal Produksi"
              type="date"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Kode Batch (opsional)"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            placeholder="Contoh: BATCH-20261122"
          />

          <Input
            label="Catatan (opsional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Jumlah yang dicatat menggunakan satuan kg. Pengemasan ke ukuran pesanan seperti 100 g atau 250 g dicatat pada proses packing.
          </p>

          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={saving}>Simpan Hasil Produksi</Button>
            <Link href="/production">
              <Button type="button" variant="ghost">Batal</Button>
            </Link>
          </div>
        </Card>
      </form>

      {toast && <Toast message={toast.msg} tone={toast.tone} />}
    </>
  );
}
