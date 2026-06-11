"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import { LayoutDashboard, CheckCircle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_active: 0,
    total_completed: 0,
    deadline_this_week: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Aktif', value: stats.total_active },
    { name: 'Selesai', value: stats.total_completed },
  ];
  
  const COLORS = ['#4f46e5', '#10b981'];

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-2">Ringkasan status tugas dan produktivitas Anda.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Tugas Aktif</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.total_active}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Deadline Minggu Ini</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.deadline_this_week}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tugas Selesai</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.total_completed}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribusi Tugas</h3>
        <div className="flex-1 w-full h-full">
          {(stats.total_active > 0 || stats.total_completed > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400 font-medium">Belum ada data tugas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
