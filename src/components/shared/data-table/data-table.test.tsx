// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { DataTable } from "./data-table";
import en from "@/locales/en.json";
afterEach(cleanup);
it("distinguishes an empty collection from search results and clears the actual table search", () => {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <DataTable
        data={[{ id: "1", name: "Canvas bag" }]}
        columns={[{ accessorKey: "name", header: "Product" }]}
        caption="Products"
        getRowId={(row) => row.id}
        search={{ getValue: (row) => row.name }}
      />
    </NextIntlClientProvider>,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Search Products" }), {
    target: { value: "missing" },
  });
  expect(screen.getByRole("heading", { name: en.dataTable.empty })).toBeTruthy();
  const clear = screen.getAllByRole("button", { name: en.dataTable.clear });
  fireEvent.click(clear[clear.length - 1]);
  expect(screen.getByText("Canvas bag")).toBeTruthy();
  expect(screen.queryByRole("heading", { name: en.dataTable.empty })).toBeNull();
});
it("uses the table context for an empty collection without offering a nonfunctional clear action", () => {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <DataTable
        data={[]}
        columns={[{ id: "name", header: "Product" }]}
        caption="Products"
        getRowId={() => "id"}
      />
    </NextIntlClientProvider>,
  );
  expect(screen.getByRole("heading", { name: "No records in Products" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: en.dataTable.clear })).toBeNull();
});
