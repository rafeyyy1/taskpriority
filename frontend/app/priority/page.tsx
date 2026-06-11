"use client";

import { useEffect, useState } from "react";
import { getPriority, updateTask } from "@/lib/api";
import { Trophy, CheckCircle, AlertTriangle } from "lucide-react";

export default function PriorityPage() {
  const [priorities, setPriorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriorities();
  }, []);

  const fetchPriorities = async () => {
    setLoading(true);
    try {
      const data = await getPriority();
      setPriorities(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const markAsDone = async (task: any) => {
    try {
      await updateTask(task.id, { ...task, status: "Selesai" });
      fetchPriorities();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical": return "bg-rose-100 text-rose-800 border-rose-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Low": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 w-full">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
          <Trophy className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dynamic To-Do List</h2>
          <p className="text-slate-500 mt-1">Urutan pengerjaan tugas berdasarkan kalkulasi AHP (Analytical Hierarchy Process).</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Menganalisis prioritas...</div>
      ) : priorities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Belum ada tugas aktif untuk diprioritaskan.</p>
        </div>
      ) : (
        <div className="space-y-4 mt-8">
          {priorities.map((item) => (
            <div
              key={item.task.id}
              className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center ${item.priority_status === 'Critical' ? 'border-rose-200' : 'border-slate-100'}`}
            >
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-black text-slate-400">
                  #{item.rank}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{item.task.nama_tugas}</h3>
                  <div className="text-sm font-medium text-indigo-600 mb-2">{item.task.mata_kuliah}</div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                      Deadline: <strong className="text-slate-900">{item.task.deadline}</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                      Bobot: <strong className="text-slate-900">{item.task.bobot_nilai}%</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                      Kesulitan: <strong className="text-slate-900">{item.task.tingkat_kesulitan}/5</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex flex-col sm:items-end w-full sm:w-auto">
                <div className="text-sm text-slate-500 mb-1">Priority Score: <strong className="text-slate-900 text-lg">{item.priority_score}</strong></div>

                <div className="flex items-center justify-between sm:justify-end w-full space-x-4 mt-2">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusColor(item.priority_status)}`}>
                    {item.priority_status}
                  </span>

                  <button
                    onClick={() => markAsDone(item.task)}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-600 hover:text-white transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Selesai
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
