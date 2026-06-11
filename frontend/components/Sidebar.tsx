"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  Trophy,
  History,
  LogOut,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/components/AuthContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-indigo-500",
  },
  {
    label: "Data Tugas",
    icon: ListTodo,
    href: "/tasks",
    color: "text-purple-500",
  },
  {
    label: "Hasil Prioritas",
    icon: Trophy,
    href: "/priority",
    color: "text-amber-500",
  },
  {
    label: "Pengaturan AHP",
    icon: Settings,
    href: "/ahp-settings",
    color: "text-gray-500",
  },
  {
    label: "Riwayat",
    icon: History,
    href: "/history",
    color: "text-emerald-500",
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1 flex flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center pl-3 mb-14">
            <div className="relative w-8 h-8 mr-4 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-xl text-white">T</span>
            </div>
            <h1 className="text-2xl font-bold">
              TaskPriority
            </h1>
          </Link>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                  pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                  {route.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Profile and Logout Section */}
        {user && (
          <div className="border-t border-zinc-800 pt-4 mt-auto">
            <div className="flex items-center space-x-3 px-3 py-2.5 bg-zinc-950/40 rounded-xl border border-zinc-800/40 mb-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-zinc-200 truncate leading-none mb-1">
                  {user.name}
                </span>
                <span className="text-[10px] text-zinc-500 truncate leading-none">
                  @{user.username}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin keluar?")) {
                  logout();
                }
              }}
              className="w-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 group flex p-3 justify-start text-sm font-medium rounded-lg cursor-pointer transition"
            >
              <div className="flex items-center flex-1">
                <LogOut className="h-5 w-5 mr-3 text-zinc-500 group-hover:text-rose-400" />
                Keluar
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

