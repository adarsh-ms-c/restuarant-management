"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_SESSION_KEY } from "@/lib/config";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const authorized = window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
      setAllowed(authorized);
      if (!authorized) router.replace("/");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  if (allowed !== true) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper text-sm text-muted">
        Checking admin access...
      </main>
    );
  }

  return <AdminDashboard />;
}
