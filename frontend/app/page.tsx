"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import { LayoutDashboard, CheckCircle, Clock } from "lucide-react";

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

  return (
    <div className="p-8 space-y-8">
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

      {/* Placeholder for chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col justify-center items-center">
        <p className="text-slate-400 font-medium">Distribusi Tugas (Visualisasi Recharts akan ditampilkan di sini)</p>
      </div>
    </div>
  );
}
