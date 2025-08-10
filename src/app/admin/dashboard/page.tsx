
'use client';

import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
