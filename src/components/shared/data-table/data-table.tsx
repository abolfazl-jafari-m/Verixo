"use client";

import { useId, useState, type ReactNode } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  caption: string;
  getRowId: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  // Omit when the owning feature already supplies its search/filter toolbar.
  search?: { getValue: (row: T) => string; placeholder?: string };
  renderMobile?: (row: T) => ReactNode;
  printAllRows?: boolean;
  className?: string;
}

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function DataTable<T>({
  data,
  columns,
  caption,
  getRowId,
  onRowClick,
  search,
  renderMobile,
  printAllRows = false,
  className,
}: DataTableProps<T>) {
  const t = useTranslations("dataTable");
  const f = useFormatter();
  const locale = useLocale();
  const id = useId();
  const [globalFilter, setGlobalFilter] = useState("");
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getColumnCanGlobalFilter: () => true,
    globalFilterFn: (row, _column, value: string) =>
      normalizeSearch(search?.getValue(row.original) ?? "").includes(normalizeSearch(value)),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });
  const rows = table.getRowModel().rows;
  const count = table.getFilteredRowModel().rows.length;
  const pages = Math.max(1, table.getPageCount());

  function renderTable(items: Row<T>[]) {
    return (
      <Table className={cn("[&_td]:px-4 [&_td]:py-3 [&_th]:px-4", className)}>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader className="bg-muted/40">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  scope="col"
                  className="text-muted-foreground text-start text-xs"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {items.length ? (
            items.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={onRowClick ? "focus-within:bg-muted/40 cursor-pointer" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground h-28 text-center"
              >
                {t("empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }

  return (
    <section className="min-w-0 space-y-3" aria-label={caption}>
      {search && (
        <div className="flex items-center gap-2 print:hidden">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <label htmlFor={id} className="sr-only">
              {t("search", { table: caption })}
            </label>
            <Search
              className="text-muted-foreground absolute start-3 top-3 size-4"
              aria-hidden="true"
            />
            <Input
              id={id}
              value={globalFilter}
              placeholder={search.placeholder ?? t("searchPlaceholder")}
              className="h-10 ps-9"
              onChange={(event) => {
                table.setGlobalFilter(event.target.value);
                table.setPageIndex(0);
              }}
            />
          </div>
          {globalFilter && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("clear")}
              onClick={() => {
                table.setGlobalFilter("");
                table.setPageIndex(0);
              }}
            >
              <X aria-hidden="true" />
            </Button>
          )}
        </div>
      )}
      <div
        className={cn(
          "border-border/50 bg-card min-w-0 overflow-hidden rounded-xl border",
          renderMobile && "hidden lg:block",
          printAllRows && "print:hidden",
        )}
      >
        {renderTable(rows)}
      </div>
      {renderMobile && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:hidden">
          {rows.map((row) => (
            <li key={row.id}>{renderMobile(row.original)}</li>
          ))}
          {!rows.length && <li className="text-muted-foreground py-6 text-sm">{t("empty")}</li>}
        </ul>
      )}
      {printAllRows && (
        <div className="hidden print:block">{renderTable(table.getCoreRowModel().rows)}</div>
      )}
      <nav
        aria-label={t("pagination", { table: caption })}
        className="flex flex-wrap items-center justify-between gap-3 print:hidden"
      >
        <div className="flex items-center gap-2">
          <label htmlFor={id + "-size"} className="text-muted-foreground text-xs">
            {t("pageSize")}
          </label>
          <Select
            value={table.getState().pagination.pageSize}
            items={[5, 10, 20, 50].map((value) => ({ value, label: f.number(value) }))}
            onValueChange={(value) => {
              if (value !== null) table.setPageSize(value);
            }}
          >
            <SelectTrigger id={id + "-size"} size="sm" className="min-w-18">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} dir={locale === "fa" ? "rtl" : "ltr"}>
              {[5, 10, 20, 50].map((value) => (
                <SelectItem key={value} value={value}>
                  {f.number(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p role="status" className="text-muted-foreground text-xs">
          {t("page", {
            page: Math.min(table.getState().pagination.pageIndex + 1, pages),
            pages,
            count,
          })}
        </p>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="rtl:rotate-180" aria-hidden="true" />
            {t("previous")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            {t("next")}
            <ChevronRight className="rtl:rotate-180" aria-hidden="true" />
          </Button>
        </div>
      </nav>
    </section>
  );
}
