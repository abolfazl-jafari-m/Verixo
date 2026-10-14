"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { mockOrders } from "../../data/mock-orders";
import { localOrderPrefix, readLocalOrders, writeLocalOrder } from "../../data/local-orders";
import type { CreateOrderValues, Order, OrderStatus } from "../../types";
import { canMoveOrder, createMockCustomerToken, transitionOrder } from "../../mock-workflow";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "../../schemas/customer-information-schema";
import { createMockInvoice } from "@/features/invoices/utils";
import {
  invoiceEditSchema,
  type InvoiceEditValues,
} from "@/features/invoices/schemas/invoice-schema";
import { normalizePhone } from "../../utils";
import { readSettingsSection, SettingsUnavailableError } from "@/features/settings/storage";
import { invoiceSettingsSnapshot } from "@/features/settings/model";
import { changeOrderArchive, type ArchiveResult } from "../../archive";

interface OrdersContextValue {
  archiveOrders: (ids: string[], restore?: boolean) => ArchiveResult;
  orders: Order[];
  ready: boolean;
  storageAvailable: boolean;
  createdNumber: string | null;
  dismissSuccess: () => void;
  moveOrder: (id: string, status: OrderStatus) => boolean;
  createOrder: (order: CreateOrderValues) => void;
  sendInvoice: (id: string) => boolean;
  updateInvoice: (id: string, values: InvoiceEditValues) => boolean;
  submitCustomerInformation: (token: string, values: CustomerFormValues) => boolean;
}
const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const currentOrders = useRef(orders);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [createdNumber, setCreatedNumber] = useState<string | null>(null);

  useEffect(() => {
    function refresh() {
      const result = readLocalOrders(currentOrders.current);
      currentOrders.current = result.orders;
      setOrders(result.orders);
      setStorageAvailable(result.available);
      setReady(true);
    }
    refresh();
    function onStorage(event: StorageEvent) {
      if (event.key?.startsWith(localOrderPrefix)) refresh();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  function latestOrders() {
    return readLocalOrders(currentOrders.current).orders;
  }
  function commit(order: Order, current: Order[]) {
    const next = [order, ...current.filter((item) => item.id !== order.id)];
    currentOrders.current = next;
    setOrders(next);
    setStorageAvailable(writeLocalOrder(order));
  }
  function createOrder(values: CreateOrderValues) {
    const shop = readSettingsSection("shop");
    const invoicePreferences = readSettingsSection("invoices");
    if (!shop.available || !invoicePreferences.available) throw new SettingsUnavailableError();
    const current = latestOrders();
    const number = `ORD-${Math.max(1041, ...current.map((order) => Number(order.number.slice(4)))) + 1}`;
    const identity = { id: crypto.randomUUID(), number, createdAt: new Date().toISOString() };
    commit(
      {
        ...values,
        ...identity,
        archivedAt: null,
        invoice: createMockInvoice(
          identity,
          invoiceSettingsSnapshot(shop.value, invoicePreferences.value),
        ),
        status: values.payment === "paid" ? "paid" : "pending_payment",
        invoiceStatus: "not_sent",
        customer: null,
        customerInformationStatus: "pending",
        shippingMethod: null,
        customerFormToken: values.payment === "paid" ? createMockCustomerToken() : null,
      },
      current,
    );
    setCreatedNumber(number);
  }
  function archiveOrders(ids: string[], restore = false) {
    const loaded = readLocalOrders(currentOrders.current);
    if (!ready || !loaded.available) {
      setStorageAvailable(false);
      return { changed: [], skipped: [], failed: [...new Set(ids)] };
    }
    const next = changeOrderArchive(loaded.orders, ids, restore, writeLocalOrder);
    currentOrders.current = next.orders;
    setOrders(next.orders);
    setStorageAvailable(next.result.failed.length === 0);
    return next.result;
  }
  // Local delivery simulation only; payment and fulfillment are never changed here.
  function sendInvoice(id: string) {
    const current = latestOrders();
    const order = current.find((item) => item.id === id);
    if (!order || order.status !== "pending_payment" || order.payment !== "pending") return false;
    if (order.invoiceStatus !== "sent") commit({ ...order, invoiceStatus: "sent" }, current);
    return true;
  }
  function updateInvoice(id: string, values: InvoiceEditValues) {
    const current = latestOrders();
    const order = current.find((item) => item.id === id);
    const result = invoiceEditSchema.safeParse(values);
    if (
      !order ||
      order.payment === "paid" ||
      !result.success ||
      result.data.unitPrices.length !== order.lines.length
    )
      return false;
    commit(
      {
        ...order,
        lines: order.lines.map((line, index) => ({
          ...line,
          unitPrice: result.data.unitPrices[index].value,
        })),
        shipping: result.data.shipping,
        invoiceStatus: "not_sent", // Changed amounts must be explicitly sent again.
      },
      current,
    );
    return true;
  }
  function moveOrder(id: string, status: OrderStatus) {
    const current = latestOrders();
    const order = current.find((item) => item.id === id);
    if (!order || !canMoveOrder(order, status)) return false;
    commit(transitionOrder(order, status), current);
    return true;
  }
  function submitCustomerInformation(token: string, values: CustomerFormValues) {
    const current = latestOrders();
    const order = current.find((item) => item.customerFormToken === token);
    const result = customerFormSchema.safeParse(values);
    if (
      !order ||
      order.payment !== "paid" ||
      order.customerInformationStatus === "submitted" ||
      !result.success
    )
      return false;
    const { shippingMethod, ...customer } = result.data;
    commit(
      {
        ...order,
        customer: {
          ...customer,
          phone: normalizePhone(customer.phone),
          postalCode: normalizePhone(customer.postalCode),
        },
        shippingMethod,
        customerInformationStatus: "submitted",
      },
      current,
    );
    return true;
  }
  return (
    <OrdersContext.Provider
      value={{
        orders,
        archiveOrders,
        ready,
        storageAvailable,
        createdNumber,
        createOrder,
        sendInvoice,
        updateInvoice,
        moveOrder,
        submitCustomerInformation,
        dismissSuccess: () => setCreatedNumber(null),
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders requires OrdersProvider");
  return context;
}
