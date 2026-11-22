'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/protected-route';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-off-white p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
              <p className="text-gray-600">
                Selamat datang, {user?.full_name || user?.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Logout
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Username:</span> {user?.username}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Role:</span> {user?.role}
            </p>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
