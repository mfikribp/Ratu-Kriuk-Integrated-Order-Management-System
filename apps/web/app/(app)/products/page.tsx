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

const emptyForm = { sku: '', name: '', category: '', unit_price: '', description: '' };

interface Group {
  category: string;
  items: Product[];
}

export default function ProductsPage() {
  const { data, loading, error, refetch, setData } = useApi<{ data: Product[] }>(
    '/products?limit=200'
  );
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null);

  const groups = useMemo<Group[]>(() => {
    let list = data?.data ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
      );
    }
    const map = new Map<string, Product[]>();
    for (const p of list) {
      const key = p.category?.trim() || 'Lainnya';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [data, search]);

  const totalProducts = data?.data?.length ?? 0;

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
          category: form.category,
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
        description={`${totalProducts} produk dalam ${groups.length} kategori`}
        actions={<Button onClick={() => setModalOpen(true)}>+ Tambah Produk</Button>}
      />

      <div className="max-w-sm mb-5">
        <Input
          placeholder="Cari produk atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Card><Spinner /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={refetch} /></Card>
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada produk"
            description="Tambahkan produk untuk mulai mencatat pesanan."
            action={<Button onClick={() => setModalOpen(true)}>+ Tambah Produk</Button>}
          />
        </Card>
      ) : (
        <div className="columns-1 md:columns-2 gap-5 [column-fill:balance]">
          {groups.map((group) => (
            <Card key={group.category} className="p-5 mb-5 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold text-charcoal">{group.category}</h2>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {group.items.length > 1 ? `${group.items.length} varian` : '1 pilihan'}
                </span>
              </div>
              <ul className="mt-4 space-y-3">
                {group.items.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-700">{p.name}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatCurrency(p.unit_price)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

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
          <Input label="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            label="Kategori / Varian Group"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Contoh: Makaroni"
          />
          <Input
            label="Harga (Rp)"
            type="number"
            min={0}
            value={form.unit_price}
            onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
          />
          <Input label="SKU / Kode (opsional)" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
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
