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
} from '@/components/ui';
import { formatDate } from '@/lib/format';
import type { PackingOrder } from '@/lib/types';

export default function PackingListPage() {
  const { data, loading, error, refetch } = useApi<{ data: PackingOrder[] }>(
    '/packing/orders?limit=100'
  );
  const [search, setSearch] = useState('');

  const orders = useMemo(() => {
    let list = data?.data ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search]);

  return (
    <>
      <PageHeader
        title="Daftar Packing"
        description="Pesanan yang menunggu untuk dikemas."
      />

      <Card className="mb-4 p-4">
        <div className="max-w-sm">
          <Input
            placeholder="Cari nomor pesanan / pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <Card><Spinner /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={refetch} /></Card>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState
            title="Tidak ada pesanan yang perlu dikemas."
            description="Semua pesanan sudah diproses. Cek kembali nanti."
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-charcoal">{order.order_number}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(order.order_date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{order.customer_name}</p>
                <p className="text-xs text-gray-500 mt-2">{order.item_count} jenis item</p>
              </div>
              <Link href={`/packing/${order.id}`} className="mt-4">
                <Button variant="outline" className="w-full">Buka Detail Packing</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
