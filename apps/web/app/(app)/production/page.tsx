'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useApi } from '@/lib/use-api';
import {
  Button,
  Card,
  PageHeader,
  Spinner,
  ErrorState,
  EmptyState,
  Input,
  Select,
  StatCard,
} from '@/components/ui';
import { formatDate } from '@/lib/format';
import type { ProductionBatch } from '@/lib/types';

export default function ProductionPage() {
  const { data, loading, error, refetch } = useApi<{ data: ProductionBatch[] }>(
    '/production/batches?limit=100'
  );
  const [productFilter, setProductFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const batches = useMemo(() => {
    let list = data?.data ?? [];
    if (productFilter) list = list.filter((b) => b.product_id === productFilter);
    if (dateFilter) {
      list = list.filter((b) => b.production_date.slice(0, 10) === dateFilter);
    }
    return list;
  }, [data, productFilter, dateFilter]);

  const products = useMemo(() => {
    const map = new Map<string, string>();
    (data?.data ?? []).forEach((b) => map.set(b.product_id, b.product_name));
    return Array.from(map.entries());
  }, [data]);

  const totalKg = batches.reduce(
    (sum, batch) => sum + (batch.quantity_unit === 'KG' ? batch.quantity : 0),
    0
  );

  return (
    <>
      <PageHeader
        title="Hasil Produksi"
        description="Riwayat batch produksi yang telah dicatat."
        actions={
          <Link href="/production/new">
            <Button>Catat Hasil Produksi</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatCard label="Jumlah Batch (terfilter)" value={batches.length} />
        <StatCard label="Total Produksi (kg)" value={totalKg} />
      </div>

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="w-56">
            <Select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
              <option value="">Semua Produk</option>
              {products.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </Select>
          </div>
          <div className="w-48">
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : batches.length === 0 ? (
          <EmptyState
            title="Belum ada hasil produksi"
            description="Catat hasil produksi untuk melihat riwayat di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-5 py-3 font-medium">Produk</th>
                  <th className="text-right px-5 py-3 font-medium">Jumlah</th>
                  <th className="text-left px-5 py-3 font-medium">Kode Batch</th>
                  <th className="text-left px-5 py-3 font-medium">Dicatat Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-600">{formatDate(b.production_date)}</td>
                    <td className="px-5 py-3 font-medium text-charcoal">{b.product_name}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap tabular-nums">
                        <span className="font-medium text-gray-800">{b.quantity}</span>
                        <span className={`inline-flex min-w-10 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          b.quantity_unit === 'KG'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {b.quantity_unit === 'KG' ? 'kg' : 'pcs'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{b.batch_code || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">{b.recorded_by_name || '-'}</td>
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
