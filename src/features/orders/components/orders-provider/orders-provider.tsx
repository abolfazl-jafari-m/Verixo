"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { useQueryClient } from "@tanstack/react-query";
import { productQueryKey } from "@/features/products/services/product-service";
import { inventoryStorageKey } from "@/features/inventory/repository";
import { localOrderPrefix } from "../../data/local-orders";
import { orderStoragePrefix } from "../../store/order-records";
import { createOrdersStore, type OrdersState } from "../../store/orders-store";
// A stable store handle preserves isolation between mounted application trees and SSR requests.
const OrdersStoreContext = createContext<ReturnType<typeof createOrdersStore> | null>(null);
export function OrdersProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [store] = useState(() =>
    createOrdersStore(() => {
      void queryClient.invalidateQueries({ queryKey: productQueryKey });
    }),
  );
  useEffect(() => {
    const refresh = store.getState().refresh;
    refresh();
    const storage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key.startsWith(localOrderPrefix) ||
        event.key.startsWith(orderStoragePrefix) ||
        event.key === inventoryStorageKey ||
        event.key === "verixo:inventory:v1"
      )
        refresh();
    };
    window.addEventListener("storage", storage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", refresh);
    };
  }, [store]);
  return <OrdersStoreContext.Provider value={store}>{children}</OrdersStoreContext.Provider>;
}
export function useOrdersStore<T>(selector: (state: OrdersState) => T) {
  const store = useContext(OrdersStoreContext);
  if (!store) throw new Error("useOrdersStore requires OrdersProvider");
  return useStore(store, selector);
}
