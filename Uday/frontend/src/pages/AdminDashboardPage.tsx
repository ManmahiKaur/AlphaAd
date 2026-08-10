import React, { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { AdminStats, User as UserType } from '../types';
import { Card, Badge, Skeleton } from '../components/ui/UIComponents';
import { Shield, Users, Activity, FileText, Server } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [sData, uData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers()
        ]);
        setStats(sData);
        setUsersList(uData);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" /> Platform Admin Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage platform users, monitor database metrics, and view system status</p>
        </div>
        <Badge variant="yellow">Status: {stats.system_health}</Badge>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">Registered Users</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.total_users}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">Total Executed Trades</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.total_transactions}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">Tracked Companies</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.total_companies}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">Active Portfolios</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.active_portfolios}</span>
          </div>
        </Card>
      </div>

      {/* User Management Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">User Accounts Directory</h2>

        <Card className="overflow-x-auto p-0 border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Preferred Market</th>
                <th className="p-3.5">USD Balance</th>
                <th className="p-3.5">INR Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-3.5 text-slate-500 font-mono">#{u.id}</td>
                  <td className="p-3.5 font-bold text-slate-900">{u.full_name}</td>
                  <td className="p-3.5 text-slate-500">{u.email}</td>
                  <td className="p-3.5">
                    <Badge variant={u.role === 'admin' ? 'yellow' : 'green'}>{u.role}</Badge>
                  </td>
                  <td className="p-3.5">
                    <Badge variant={u.preferred_country === 'IN' ? 'orange' : 'blue' as any}>{u.preferred_country}</Badge>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700">${u.virtual_balance_usd.toLocaleString()}</td>
                  <td className="p-3.5 font-mono text-slate-700">₹{u.virtual_balance_inr.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
