'use client';

import { useRef, useState } from 'react';
import apiCall from '@/lib/api';
import {
  Button,
  Card,
  PageHeader,
  Input,
  Select,
  Toast,
  StatCard,
} from '@/components/ui';
import type { ImportResponse } from '@/lib/types';

export default function ImportsPage() {
  const [source, setSource] = useState('MARKETPLACE_X');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) {
      setToast({ msg: 'Pilih file terlebih dahulu.', tone: 'error' });
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('source', source);
      formData.append('file', file);

      const res = await apiCall<ImportResponse>('/imports', {
        method: 'POST',
        body: formData,
      });
      setResult(res);
      setToast({ msg: res.message, tone: 'success' });
    } catch (err) {
      setToast({
        msg: err instanceof Error ? err.message : 'Gagal mengimpor file.',
        tone: 'error',
      });
    } finally {
      setUploading(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <>
      <PageHeader
        title="Impor Marketplace"
        description="Unggah file ekspor pesanan dari marketplace."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 space-y-4">
          <Select label="Sumber Marketplace" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="MARKETPLACE_X">Marketplace X</option>
            <option value="MARKETPLACE_Y">Marketplace Y</option>
            <option value="GENERIC">Generik</option>
          </Select>

          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/40 transition-colors"
          >
            <p className="text-sm text-gray-600">
              {file ? (
                <span className="font-medium text-charcoal">{file.name}</span>
              ) : (
                <>Klik untuk memilih file CSV</>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">Format: CSV, maksimal 10 MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button onClick={handleUpload} loading={uploading} disabled={!file} className="w-full">
            Mulai Impor
          </Button>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-charcoal mb-3">Hasil Impor</h2>
          {!result ? (
            <p className="text-sm text-gray-500">
              Hasil impor akan ditampilkan di sini setelah proses selesai.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total Baris" value={result.total_rows} />
                <StatCard label="Berhasil" value={result.success_count} />
                <StatCard label="Gagal" value={result.failed_count} />
                <StatCard label="Duplikat" value={result.duplicate_count} />
              </div>
              <p className="text-sm text-gray-600 mt-4">{result.message}</p>
            </>
          )}
        </Card>
      </div>

      {toast && <Toast message={toast.msg} tone={toast.tone} />}
    </>
  );
}
