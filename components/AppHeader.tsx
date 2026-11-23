"use client";

import Link from "next/link";

type Props = {
  mode: "user" | "admin";
  onAdminClick?: () => void;
  onCartClick?: () => void;
  cartCount?: number;
  onRefresh?: () => void;
  onLogout?: () => void;
};

export default function AppHeader({ mode, onAdminClick, onCartClick, cartCount = 0, onRefresh, onLogout }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500 text-sm font-bold">RM</span>
          <span>
            <span className="block text-base font-semibold leading-tight">restuarant management</span>
            <span className="block text-xs text-slate-400">
              {mode === "admin" ? "Admin panel" : "Fresh orders, simple control"}
            </span>
          </span>
        </Link>
        {mode === "user" ? (
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <a href="#menu" className="rounded-lg px-2 py-2 hover:bg-slate-800 sm:px-3">Menu</a>
            <a href="#track" className="rounded-lg px-2 py-2 hover:bg-slate-800 sm:px-3">Track Order</a>
            <button
              type="button"
              onClick={onCartClick}
              className="relative rounded-lg border border-slate-600 px-3 py-2 font-medium hover:bg-slate-800"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-indigo-500 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onAdminClick}
              className="rounded-lg border border-slate-600 px-3 py-2 font-medium hover:bg-slate-800"
            >
              Admin
            </button>
          </nav>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg border border-slate-600 px-3 py-2 hover:bg-slate-800"
            >
              Refresh
            </button>
            <Link href="/" className="rounded-lg border border-slate-600 px-3 py-2 hover:bg-slate-800">
              Back to site
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg bg-indigo-600 px-3 py-2 font-medium hover:bg-indigo-500"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
