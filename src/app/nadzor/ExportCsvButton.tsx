"use client";

import { Download } from "lucide-react";

export type CsvRow = {
  company: string;
  taxId: string;
  admin: string;
  email: string;
  employees: number;
  status: string;
  until: string;
  registered: string;
};

// Prenos preglednice registracij kot CSV (odpre se v Excelu/Google Sheets).
export function ExportCsvButton({ rows }: { rows: CsvRow[] }) {
  function download() {
    const header = [
      "Podjetje",
      "Davčna",
      "Admin",
      "Email",
      "Zaposleni",
      "Status",
      "Naročnina/preizkus do",
      "Registrirano",
    ];
    const esc = (v: string | number) => {
      const s = String(v ?? "");
      return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      header.join(";"),
      ...rows.map((r) =>
        [r.company, r.taxId, r.admin, r.email, r.employees, r.status, r.until, r.registered]
          .map(esc)
          .join(";"),
      ),
    ];
    // BOM za pravilne šumnike v Excelu.
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delovit-registracije-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-white/80 transition hover:bg-white"
    >
      <Download className="h-4 w-4" />
      Prenesi CSV
    </button>
  );
}
