'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApi } from '@/lib/use-api';
import { Button, Card, PageHeader, Spinner, ErrorState, StatusBadge } from '@/components/ui';
import { formatCurrency, formatDate, formatDateTime, sourceLabel } from '@/lib/format';
import type { Customer, Order, OrderItem } from '@/lib/types';

interface OrderDetailResponse {
  data: Order;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useApi<OrderDetailResponse>(`/orders/${params.id}`);
  const order = data?.data;

  const { data: customerData } = useApi<{ data: Customer }>(
    order?.customer_id ? `/customers/${order.customer_id}` : null
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!order) return <ErrorState message="Pesanan tidak ditemukan." />;

  return (
    <>
      <div className="mb-4">
        <Link href="/orders" className="text-sm text-orange-600 hover:text-orange-700">
          ← Kembali ke daftar pesanan
        </Link>
      </div>

      <PageHeader
        title={order.order_number}
        description={`Dibuat ${formatDateTime(order.created_at)}`}
        actions={<StatusBadge status={order.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-charcoal">Item Pesanan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Produk</th>
                  <th className="text-right px-5 py-3 font-medium">Harga</th>
                  <th className="text-right px-5 py-3 font-medium">Qty</th>
                  <th className="text-right px-5 py-3 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.items ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 text-charcoal">{item.product_name_snapshot}</td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {formatCurrency(item.unit_price_snapshot)}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-gray-800">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-gray-100 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total Produk</span>
              <span>{formatCurrency(order.product_total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Ongkos Kirim</span>
              <span>{formatCurrency(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-semibold text-charcoal text-base pt-2 border-t border-gray-100">
              <span>Total Pembayaran</span>
              <span>{formatCurrency(order.grand_total)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">Pelanggan</p>
            <p className="font-medium text-charcoal">
              {customerData?.data?.name || order.customer_id}
            </p>
            {customerData?.data?.phone && (
              <p className="text-sm text-gray-600">{customerData.data.phone}</p>
            )}
            {customerData?.data?.address && (
              <p className="text-sm text-gray-600 mt-1">{customerData.data.address}</p>
            )}
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs uppercase text-gray-400 mb-1">Tanggal Pesanan</p>
            <p className="text-sm text-charcoal">{formatDate(order.order_date)}</p>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs uppercase text-gray-400 mb-1">Sumber</p>
            <p className="text-sm text-charcoal">{sourceLabel(order.source)}</p>
          </div>
          {order.notes && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs uppercase text-gray-400 mb-1">Catatan</p>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
