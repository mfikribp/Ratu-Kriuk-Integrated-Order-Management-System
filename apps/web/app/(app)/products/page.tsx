'use client';

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
  Input,
  Modal,
  Toast,
} from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import type { Product } from '@/lib/types';

const emptyForm = { sku: '', name: '', unit_price: '', description: '' };

export default function ProductsPage() {
  const { data, loading, error, refetch, setData } = useApi<{ data: Product[] }>(
    '/products?limit=100'
  );
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null);

  const products = useMemo(() => {
    let list = data?.data ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search]);

  const handleSave = async () => {
    if (!form.name || !form.unit_price) {
      setToast({ msg: 'Nama dan harga produk wajib diisi.', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await apiCall<{ data: Product }>('/products', {
        method: 'POST',
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          description: form.description,
          unit_price: Number(form.unit_price),
        }),
      });
      setData({ data: [res.data, ...(data?.data ?? [])] });
      setToast({ msg: 'Produk berhasil disimpan.', tone: 'success' });
      setModalOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setToast({
        msg: err instanceof Error ? err.message : 'Gagal menyimpan produk.',
        tone: 'error',
      });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <>
      <PageHeader
        title="Produk"
        description="Kelola daftar produk Ratu Kriuk."
        actions={<Button onClick={() => setModalOpen(true)}>+ Tambah Produk</Button>}
      />

      <Card className="mb-4 p-4">
        <div className="max-w-sm">
          <Input
            placeholder="Cari nama atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : products.length === 0 ? (
          <EmptyState title="Belum ada produk" description="Tambahkan produk untuk mulai mencatat pesanan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">SKU</th>
                  <th className="text-left px-5 py-3 font-medium">Nama Produk</th>
                  <th className="text-right px-5 py-3 font-medium">Harga</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-600">{p.sku || '-'}</td>
                    <td className="px-5 py-3 font-medium text-charcoal">{p.name}</td>
                    <td className="px-5 py-3 text-right text-gray-800">{formatCurrency(p.unit_price)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium ${p.is_active ? 'text-green-700' : 'text-gray-400'}`}>
                        {p.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title="Tambah Produk"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} loading={saving}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="SKU / Kode" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <Input label="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            label="Harga (Rp)"
            type="number"
            min={0}
            value={form.unit_price}
            onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
          />
          <Input
            label="Deskripsi (opsional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </Modal>

      {toast && <Toast message={toast.msg} tone={toast.tone} />}
    </>
  );
}
