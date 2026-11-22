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
import type { Customer } from '@/lib/types';

const emptyForm = { name: '', phone: '', address: '', city_region_postal_code: '' };

export default function CustomersPage() {
  const { data, loading, error, refetch, setData } = useApi<{ data: Customer[] }>(
    '/customers?limit=100'
  );
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null);

  const customers = useMemo(() => {
    let list = data?.data ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search]);

  const handleSave = async () => {
    if (!form.name) {
      setToast({ msg: 'Nama pelanggan wajib diisi.', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await apiCall<{ data: Customer }>('/customers', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setData({ data: [res.data, ...(data?.data ?? [])] });
      setToast({ msg: 'Pelanggan berhasil disimpan.', tone: 'success' });
      setModalOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setToast({
        msg: err instanceof Error ? err.message : 'Gagal menyimpan pelanggan.',
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
        title="Pelanggan"
        description="Kelola data pelanggan dan tujuan pengiriman."
        actions={<Button onClick={() => setModalOpen(true)}>+ Tambah Pelanggan</Button>}
      />

      <Card className="mb-4 p-4">
        <div className="max-w-sm">
          <Input
            placeholder="Cari nama atau nomor kontak..."
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
        ) : customers.length === 0 ? (
          <EmptyState title="Belum ada pelanggan" description="Tambahkan pelanggan untuk mulai membuat pesanan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Nama</th>
                  <th className="text-left px-5 py-3 font-medium">Kontak</th>
                  <th className="text-left px-5 py-3 font-medium">Alamat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-charcoal">{c.name}</td>
                    <td className="px-5 py-3 text-gray-600">{c.phone || '-'}</td>
                    <td className="px-5 py-3 text-gray-600 max-w-xs truncate">
                      {c.address || '-'}
                      {c.city_region_postal_code ? `, ${c.city_region_postal_code}` : ''}
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
        title="Tambah Pelanggan"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} loading={saving}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Nama Pelanggan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Nomor Kontak" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input
            label="Kota / Kode Pos (opsional)"
            value={form.city_region_postal_code}
            onChange={(e) => setForm({ ...form, city_region_postal_code: e.target.value })}
          />
        </div>
      </Modal>

      {toast && <Toast message={toast.msg} tone={toast.tone} />}
    </>
  );
}
