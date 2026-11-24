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
    <header className="sticky top-0 z-30 border-b border-charcoal-700 bg-charcoal text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/coffee-logo.svg" alt="Coffee Time logo" className="h-9 w-9" />
          <span>
            <span className="block text-base font-semibold leading-tight">Coffee Time</span>
            <span className="block text-xs text-cream">
              {mode === "admin" ? "Admin panel" : "Fresh orders, simple control"}
            </span>
          </span>
        </Link>
        {mode === "user" ? (
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <a href="#menu" className="rounded-lg px-2 py-2 text-white hover:bg-charcoal-700 hover:text-brick-100 active:bg-brick-600 sm:px-3">Menu</a>
            <a href="#track" className="rounded-lg px-2 py-2 text-white hover:bg-charcoal-700 hover:text-brick-100 active:bg-brick-600 sm:px-3">Track Order</a>
            <button
              type="button"
              onClick={onCartClick}
              className="relative rounded-lg border border-charcoal-700 px-3 py-2 font-medium hover:bg-charcoal-700 hover:text-brick-100 active:bg-brick-600"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brick-600 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onAdminClick}
              className="rounded-lg border border-charcoal-700 px-3 py-2 font-medium hover:bg-charcoal-700 hover:text-brick-100 active:bg-brick-600"
            >
              Admin
            </button>
          </nav>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg border border-charcoal-700 px-3 py-2 hover:bg-charcoal-700 hover:text-brick-100 active:bg-brick-600"
            >
              Refresh
            </button>
            <Link href="/" className="rounded-lg border border-charcoal-700 px-3 py-2 hover:bg-charcoal-700 hover:text-brick-100 active:bg-brick-600">
              Back to site
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg bg-brick-600 px-3 py-2 font-medium hover:bg-brick-700 active:bg-brick-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
