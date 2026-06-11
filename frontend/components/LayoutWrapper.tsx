"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { Sidebar } from "./Sidebar";
import React, { useEffect, useState } from "react";
import { Loader2, Menu, X } from "lucide-react";

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (!loading) {
      if (!user && !isAuthPage) {
        router.push("/login");
      } else if (user && isAuthPage) {
        router.push("/");
      }
    }
  }, [user, loading, isAuthPage, router]);

  // Automatically close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium text-sm animate-pulse">Menghubungkan ke TaskPriority...</p>
      </div>
    );
  }

  // Prevent flashing content:
  if (!user && !isAuthPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (user && isAuthPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Render authentication screens standalone
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-full min-h-screen flex flex-col md:block relative bg-[#F8FAFC]">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8.5 h-8.5 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="font-bold text-lg text-white">T</span>
          </div>
          <span className="font-bold text-slate-900 tracking-tight">TaskPriority</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Fixed Sidebar */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-30 bg-gray-900">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Slide-over Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative flex w-full max-w-xs flex-col bg-[#111827] text-white h-full shadow-2xl z-50 animate-slide-in">
            <div className="absolute right-4 top-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Embedded sidebar with click intercept to close menu */}
            <div className="h-full" onClick={() => setIsMobileMenuOpen(false)}>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="md:pl-72 pb-10 flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  );
};
