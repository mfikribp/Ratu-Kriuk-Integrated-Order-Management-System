'use client';

import { useMemo, useState } from 'react';
import { useApi } from '@/lib/use-api';
import apiCall, { apiDownload } from '@/lib/api';
import {
  Button,
  Card,
  PageHeader,
  Spinner,
  ErrorState,
  EmptyState,
  Input,
  Select,
  Modal,
  Toast,
  FilterPill,
  Pagination,
} from '@/components/ui';
import type { Customer } from '@/lib/types';

const PAGE_SIZE = 50;
const emptyForm = {
  name: '',
  phone: '',
  address: '',
  city_region_postal_code: '',
  customer_type: 'REGULAR',
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null);

  const offset = page * PAGE_SIZE;
  const endpoint = useMemo(() => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    if (search.trim()) params.set('search', search.trim());
    if (customerType) params.set('type', customerType);
    return `/customers?${params.toString()}`;
  }, [customerType, offset, search]);
  const { data, loading, error, refetch } = useApi<{
    data: Customer[];
    pagination: { total: number; limit: number; offset: number };
  }>(endpoint);
  const customers = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  const handleExport = async () => {
    if (total === 0) {
      setToast({ msg: 'Tidak ada pelanggan untuk diekspor.', tone: 'error' });
      return;
    }
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (customerType) params.set('type', customerType);
      const query = params.toString();
      const blob = await apiDownload(`/customers/export${query ? `?${query}` : ''}`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pelanggan.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      if (!customerType || customerType === 'REGULAR') {
        const archived = await apiCall<{ archived_count: number }>('/customers/archive-exported', {
          method: 'POST',
          body: JSON.stringify({ search: search.trim() }),
        });
        setToast({
          msg: `CSV diunduh. ${archived.archived_count} pelanggan biasa diarsipkan; riwayat pesanan tetap aman.`,
          tone: 'success',
        });
        await refetch();
      } else {
        setToast({ msg: 'File CSV pelanggan berhasil diunduh.', tone: 'success' });
      }
    } catch (err) {
      setToast({
        msg: err instanceof Error ? err.message : 'Gagal mengekspor pelanggan.',
        tone: 'error',
      });
    } finally {
      setExporting(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      setToast({ msg: 'Nama pelanggan wajib diisi.', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      await apiCall('/customers', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setPage(0);
      setSearch('');
      setCustomerType('');
      setToast({ msg: 'Pelanggan berhasil disimpan.', tone: 'success' });
      setModalOpen(false);
      setForm(emptyForm);
      void refetch();
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
        actions={
          <>
            <Button variant="outline" onClick={handleExport} loading={exporting}>
              Ekspor CSV
            </Button>
            <Button onClick={() => setModalOpen(true)}>+ Tambah Pelanggan</Button>
          </>
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <FilterPill active={!customerType} onClick={() => { setCustomerType(''); setPage(0); }}>
              Semua
            </FilterPill>
            <FilterPill active={customerType === 'AGENT'} onClick={() => { setCustomerType('AGENT'); setPage(0); }}>
              Agen
            </FilterPill>
            <FilterPill active={customerType === 'REGULAR'} onClick={() => { setCustomerType('REGULAR'); setPage(0); }}>
              Pelanggan Biasa
            </FilterPill>
          </div>
          <div className="w-full sm:max-w-sm">
          <Input
            placeholder="Cari nama atau nomor kontak..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          </div>
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
                  <th className="text-left px-5 py-3 font-medium">Jenis</th>
                  <th className="text-left px-5 py-3 font-medium">Kontak</th>
                  <th className="text-left px-5 py-3 font-medium">Alamat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-charcoal">{c.name}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        c.customer_type === 'AGENT' ? 'bg-sky-50 text-sky-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {c.customer_type === 'AGENT' ? 'Agen' : 'Pelanggan Biasa'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c.phone || '-'}</td>
                    <td className="px-5 py-3 text-gray-600 max-w-xs truncate">
                      {c.address || '-'}
                      {c.city_region_postal_code ? `, ${c.city_region_postal_code}` : ''}
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
          <Select
            label="Jenis Pelanggan"
            value={form.customer_type}
            onChange={(e) => setForm({ ...form, customer_type: e.target.value })}
          >
            <option value="REGULAR">Pelanggan Biasa</option>
            <option value="AGENT">Agen</option>
          </Select>
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
