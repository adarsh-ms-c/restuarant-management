"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import AdminGate from "@/components/AdminGate";
import CartDrawer from "@/components/CartDrawer";
import { useStoredOrderIds } from "@/lib/useStoredOrders";
import { ADMIN_SESSION_KEY } from "@/lib/config";

type Props = {
  children: React.ReactNode;
};

export default function UserShell({ children }: Props) {
  const router = useRouter();
  const [adminOpen, setAdminOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const storedOrderIds = useStoredOrderIds();

  function unlockAdmin() {
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    setAdminOpen(false);
    router.push("/admin");
  }

  return (
    <>
      <AppHeader
        mode="user"
        onAdminClick={() => setAdminOpen(true)}
        onCartClick={() => setCartOpen(true)}
        cartCount={storedOrderIds.length}
      />
      {children}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {adminOpen && (
        <AdminGate
          onClose={() => setAdminOpen(false)}
          onSuccess={unlockAdmin}
        />
      )}
    </>
  );
}
