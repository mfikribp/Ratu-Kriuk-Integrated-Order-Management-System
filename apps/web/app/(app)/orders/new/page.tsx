'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useApi } from '@/lib/use-api';
import apiCall from '@/lib/api';
import { Button, Card, PageHeader, Input, Select, Spinner, ErrorState, Toast } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import type { Customer, Product } from '@/lib/types';

interface LineItem {
  productId: string;
  quantity: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const { data: customersData, loading: custLoading } = useApi<{ data: Customer[] }>(
    '/customers?limit=100'
  );
  const { data: productsData, loading: prodLoading } = useApi<{ data: Product[] }>(
    '/products?limit=100'
  );

  const customers = customersData?.data ?? [];
  const products = productsData?.data ?? [];

  const [customerId, setCustomerId] = useState('');
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shippingCost, setShippingCost] = useState('0');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const productTotal = items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + (product ? product.unit_price * item.quantity : 0);
  }, 0);
  const grandTotal = productTotal + (Number(shippingCost) || 0);

  const addItem = () => {
    const available = products.find((p) => !items.some((i) => i.productId === p.id));
    if (available) {
      setItems([...items, { productId: available.id, quantity: 1 }]);
    }
  };

  const updateItem = (index: number, patch: Partial<LineItem>) => {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setToast({ msg: 'Pilih pelanggan terlebih dahulu.', tone: 'error' });
      return;
    }
    if (items.length === 0) {
      setToast({ msg: 'Tambahkan minimal satu produk.', tone: 'error' });
      return;
    }

    setSaving(true);
    try {
      await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: customerId,
          order_date: new Date(orderDate).toISOString(),
          shipping_cost: Number(shippingCost) || 0,
          notes,
          items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        }),
      });
      setToast({ msg: 'Pesanan berhasil disimpan.', tone: 'success' });
      setTimeout(() => router.push('/orders'), 800);
    } catch (err) {
      setToast({
        msg: err instanceof Error ? err.message : 'Gagal menyimpan pesanan.',
        tone: 'error',
      });
      setSaving(false);
    }
  };

  if (custLoading || prodLoading) return <Spinner />;

  return (
    <>
      <div className="mb-4">
        <Link href="/orders" className="text-sm text-orange-600 hover:text-orange-700">
          ← Kembali ke daftar pesanan
        </Link>
      </div>
      <PageHeader title="Input Pesanan Manual" description="Catat pesanan pelanggan baru." />

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold text-charcoal">Pelanggan &amp; Pengiriman</h2>
            <Select
              label="Pelanggan"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">Pilih pelanggan</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Tanggal Pesanan"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
              <Input
                label="Ongkos Kirim (Rp)"
                type="number"
                min={0}
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
              />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-charcoal">Item Pesanan</h2>
              <Button type="button" variant="outline" onClick={addItem} disabled={items.length >= products.length}>
                + Tambah Produk
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                Belum ada produk. Klik “Tambah Produk”.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => {
                  const product = productMap.get(item.productId);
                  return (
                    <div key={index} className="flex flex-wrap items-end gap-3 border-b border-gray-100 pb-3">
                      <div className="flex-1 min-w-[180px]">
                        <Select
                          label={index === 0 ? 'Produk' : undefined}
                          value={item.productId}
                          onChange={(e) => updateItem(index, { productId: e.target.value })}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {formatCurrency(p.unit_price)}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input
                          label={index === 0 ? 'Qty' : undefined}
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) })
                          }
                        />
                      </div>
                      <div className="w-32 text-right text-sm text-gray-700 pb-2">
                        {formatCurrency((product?.unit_price ?? 0) * item.quantity)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 text-sm pb-2"
                      >
                        Hapus
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <Input
              label="Catatan (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: kirim setelah jam 5 sore"
            />
          </Card>
        </div>

        <div>
          <Card className="p-5 sticky top-6 space-y-3">
            <h2 className="font-semibold text-charcoal">Ringkasan Pembayaran</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Produk</span>
              <span>{formatCurrency(productTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Ongkos Kirim</span>
              <span>{formatCurrency(Number(shippingCost) || 0)}</span>
            </div>
            <div className="flex justify-between font-semibold text-charcoal text-base pt-3 border-t border-gray-100">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
            <div className="pt-3 space-y-2">
              <Button type="submit" className="w-full" loading={saving}>
                Simpan Pesanan
              </Button>
              <Link href="/orders" className="block">
                <Button type="button" variant="ghost" className="w-full">Batal</Button>
              </Link>
            </div>
          </Card>
        </div>
      </form>

      {toast && <Toast message={toast.msg} tone={toast.tone} />}
    </>
  );
}
