import type { LeadResultItem } from "@/lib/leads/errors";

type ExportableLeadField = "name" | "phone" | "address" | "category";

const EXPORT_COLUMNS: { key: ExportableLeadField; header: string }[] = [
  { key: "name", header: "Nome" },
  { key: "phone", header: "Telefone" },
  { key: "address", header: "Endereço" },
  { key: "category", header: "Categoria" },
];

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildLeadsCsv(results: LeadResultItem[]): string {
  const header = EXPORT_COLUMNS.map((column) => escapeCsvCell(column.header)).join(",");
  const rows = results.map((result) =>
    EXPORT_COLUMNS.map((column) => escapeCsvCell(result[column.key] ?? "")).join(","),
  );
  return [header, ...rows].join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
