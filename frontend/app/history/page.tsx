"use client";

import { useEffect, useState } from "react";
import { getTasks } from "@/lib/api";
import { History, CheckCircle2 } from "lucide-react";

export default function HistoryPage() {
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setCompletedTasks(data.filter((t: any) => t.status === "Selesai"));
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
          <History className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Riwayat Tugas</h2>
          <p className="text-slate-500 mt-1">Daftar tugas yang telah berhasil Anda selesaikan.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Memuat riwayat...</div>
      ) : completedTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Belum ada tugas yang diselesaikan.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tugas Selesai</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mata Kuliah</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {completedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />
                        <span className="text-sm font-medium text-slate-900 line-through text-slate-400">{task.nama_tugas}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">{task.mata_kuliah}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
