'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useApi } from '@/lib/use-api';
import {
  Button,
  Card,
  PageHeader,
  Spinner,
  ErrorState,
  EmptyState,
  Input,
  FilterPill,
  Pagination,
} from '@/components/ui';
import { formatDate } from '@/lib/format';
import type { PackingOrder } from '@/lib/types';

const PAGE_SIZE = 50;

export default function PackingListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'Diproses' | 'Dikemas'>('Diproses');
  const [page, setPage] = useState(0);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('view') === 'packed') {
      setStatus('Dikemas');
    }
  }, []);
  const offset = page * PAGE_SIZE;
  const endpoint = useMemo(() => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
      status,
    });
    if (search.trim()) params.set('search', search.trim());
    return `/packing/orders?${params.toString()}`;
  }, [offset, search, status]);
  const { data, loading, error, refetch } = useApi<{
    data: PackingOrder[];
    pagination: { total: number; limit: number; offset: number };
  }>(endpoint);
  const orders = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  return (
    <>
      <PageHeader
        title={status === 'Diproses' ? 'Daftar Packing' : 'Daftar Dikemas'}
        description={
          status === 'Diproses'
            ? 'Pesanan yang menunggu untuk dikemas.'
            : 'Pesanan yang sudah ditandai selesai dikemas.'
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <FilterPill
              active={status === 'Diproses'}
              onClick={() => { setStatus('Diproses'); setPage(0); }}
            >
              Menunggu Packing
            </FilterPill>
            <FilterPill
              active={status === 'Dikemas'}
              onClick={() => { setStatus('Dikemas'); setPage(0); }}
            >
              Sudah Dikemas
            </FilterPill>
          </div>
          <div className="w-full sm:max-w-sm">
          <Input
            placeholder="Cari nomor pesanan / pelanggan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          </div>
        </div>
      </Card>

      {loading ? (
        <Card><Spinner /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={refetch} /></Card>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState
            title={status === 'Diproses' ? 'Tidak ada pesanan yang perlu dikemas.' : 'Belum ada pesanan yang dikemas.'}
            description={
              status === 'Diproses'
                ? 'Pesanan yang menunggu packing akan muncul di sini.'
                : 'Pesanan akan muncul di sini setelah ditandai sudah dikemas.'
            }
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
                <Button variant="outline" className="w-full">
                  {status === 'Diproses' ? 'Buka Detail Packing' : 'Lihat Detail'}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
      {!loading && !error && total > 0 && (
        <Card className="mt-4">
          <Pagination
            total={total}
            limit={PAGE_SIZE}
            offset={offset}
            onPageChange={(nextOffset) => setPage(Math.floor(nextOffset / PAGE_SIZE))}
          />
        </Card>
      )}
    </>
  );
}
