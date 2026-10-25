// @vitest-environment jsdom
import React, { act } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrdersProvider, useOrdersStore } from "../components/orders-provider/orders-provider";
import { mockOrders } from "../data/mock-orders";
import { MemoryStorage } from "@/lib/storage/__tests__/memory-storage";
vi.mock("@/lib/i18n/navigations", () => ({ getPathname: ({ href }: { href: string }) => href }));
let root: Root | undefined;
beforeEach(() => {
  vi.stubGlobal("localStorage", new MemoryStorage());
  vi.stubGlobal("sessionStorage", new MemoryStorage());
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});
afterEach(async () => {
  if (root) await act(() => root?.unmount());
  root = undefined;
  vi.unstubAllGlobals();
});
it("hydrates the server snapshot without storage reads during rendering and updates selector consumers", async () => {
  const order = { ...mockOrders[0], notes: "restored note" };
  window.localStorage.setItem("verixo:mock-orders:v1:" + order.id, JSON.stringify(order));
  const reads = vi.spyOn(window.localStorage, "getItem");
  const actionRender = vi.fn();
  function Action() {
    actionRender();
    const send = useOrdersStore((state) => state.sendInvoice);
    return <button onClick={() => send(order.id)}>Send</button>;
  }
  function View() {
    const ready = useOrdersStore((state) => state.ready);
    const selected = useOrdersStore((state) => state.orders.find((item) => item.id === order.id));
    return <p>{ready ? `${selected?.notes}:${selected?.invoiceStatus}` : "Loading"}</p>;
  }
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const tree = (
    <QueryClientProvider client={client}>
      <OrdersProvider>
        <View />
        <Action />
      </OrdersProvider>
    </QueryClientProvider>
  );
  const html = renderToString(tree);
  expect(html).toContain("Loading");
  expect(html).not.toContain("restored note");
  expect(reads).not.toHaveBeenCalled();
  const container = document.createElement("div");
  container.innerHTML = html;
  const mismatch = vi.fn();
  await act(() => {
    root = hydrateRoot(container, tree, { onRecoverableError: mismatch });
  });
  expect(container.textContent).toContain("restored note:not_sent");
  const renders = actionRender.mock.calls.length;
  await act(() => container.querySelector("button")!.click());
  expect(container.textContent).toContain("restored note:sent");
  expect(actionRender).toHaveBeenCalledTimes(renders);
  expect(mismatch).not.toHaveBeenCalled();
  client.clear();
});
