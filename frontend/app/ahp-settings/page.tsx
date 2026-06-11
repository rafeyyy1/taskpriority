"use client";

import { useEffect, useState } from "react";
import { getAhpSettings } from "@/lib/api";
import { Settings, Info } from "lucide-react";

export default function AhpSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getAhpSettings();
      setSettings(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pengaturan AHP</h2>
        <p className="text-slate-500 mt-1">Matriks perbandingan berpasangan (Pairwise Comparison) dan bobot kriteria.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading perhitungan AHP...</div>
      ) : settings && (
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Bobot Kriteria Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Settings className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Bobot Kriteria Akhir</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-slate-700">1. Deadline</span>
                  <span className="font-bold text-indigo-600">{settings.weights.deadline}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${settings.weights.deadline}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-slate-700">2. Bobot Nilai</span>
                  <span className="font-bold text-purple-600">{settings.weights.bobot}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${settings.weights.bobot}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-slate-700">3. Tingkat Kesulitan</span>
                  <span className="font-bold text-amber-500">{settings.weights.kesulitan}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${settings.weights.kesulitan}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-slate-700">4. Tipe Tugas</span>
                  <span className="font-bold text-emerald-500">{settings.weights.tipe}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: `${settings.weights.tipe}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Consistency Ratio Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Rasio Konsistensi (CR)</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center items-center text-center space-y-4">
              <div className="text-5xl font-black tracking-tight text-slate-800">
                {settings.cr.toFixed(3)}
              </div>
              <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${settings.is_consistent ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {settings.is_consistent ? 'KONSISTEN (CR < 0.1)' : 'TIDAK KONSISTEN (CR > 0.1)'}
              </div>
              <p className="text-slate-500 text-sm max-w-sm mt-4 flex items-start">
                <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>Nilai CR di bawah 0.1 menunjukkan bahwa perbandingan kriteria logis dan dapat diterima dalam metode AHP.</span>
              </p>
            </div>
          </div>

          {/* Matriks Perbandingan Berpasangan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Matriks Perbandingan Berpasangan (Pairwise Comparison)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Kriteria</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Deadline</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Bobot Nilai</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Kesulitan</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Tipe Tugas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-center text-sm">
                  {settings.matrix.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900 text-left">
                        {['Deadline', 'Bobot Nilai', 'Kesulitan', 'Tipe Tugas'][i]}
                      </td>
                      {row.map((val: number, j: number) => (
                        <td key={j} className="px-6 py-4 text-slate-600 font-mono">
                          {Number.isInteger(val) ? val : val.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
