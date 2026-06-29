import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getMonthlyReport } from "@/lib/report";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/app/dashboard/odsotnosti/labels";

const TZ = "Europe/Ljubljana";
const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: TZ }).format(new Date(d + "T00:00:00"));
const fmtTime = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(
        new Date(iso),
      )
    : "";
const num = (n: number | null | undefined) => Number(n) || 0;
function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("sl-SI", { month: "long", year: "numeric" }).format(
    new Date(y, m - 1, 1),
  );
}
function safeSheetName(name: string, fallback: string) {
  const cleaned = name.replace(/[[\]:*?/\\]/g, " ").trim().slice(0, 28);
  return cleaned || fallback;
}

// Barvna paleta (ARGB)
const DARK = "FF0F172A"; // slate-900
const ACCENT = "FF059669"; // emerald-600
const BAND = "FFF1F5F9"; // slate-100
const PANEL = "FFF8FAFC"; // slate-50
const LINE = "FFCBD5E1"; // slate-300
const MUTED = "FF64748B"; // slate-500

const thin = { style: "thin" as const, color: { argb: LINE } };
const allBorders = { top: thin, left: thin, bottom: thin, right: thin };

const HEAD = [
  "Datum",
  "Prihod",
  "Odhod",
  "Redne ure",
  "Nadure",
  "Nočne",
  "Nedeljske",
  "Praznične",
  "Izmensko/deljeno",
  "Neenakomerno",
  "Zav. doba +",
  "Status",
  "Opomba",
];
const WIDTHS = [12, 9, 9, 11, 9, 9, 10, 10, 16, 14, 12, 12, 22];
const NCOLS = HEAD.length;

export async function GET(req: NextRequest) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return new Response("Nedovoljeno", { status: 403 });
  }
  const month = req.nextUrl.searchParams.get("month") ?? "";
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return new Response("Neveljaven mesec", { status: 400 });
  }

  const supabase = await createClient();
  const report = await getMonthlyReport(supabase, profile.company_id, month);
  const generated = new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, dateStyle: "long" }).format(
    new Date(),
  );

  const wb = new ExcelJS.Workbook();
  wb.creator = "Delovit";
  wb.created = new Date();

  for (const [idx, emp] of report.employees.entries()) {
    const ws = wb.addWorksheet(safeSheetName(emp.full_name, `Zaposleni ${idx + 1}`), {
      pageSetup: {
        paperSize: 9, // A4
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
      },
      views: [{ state: "frozen", ySplit: 7 }],
    });
    WIDTHS.forEach((w, i) => (ws.getColumn(i + 1).width = w));

    const lastCol = String.fromCharCode(64 + NCOLS); // 'M'
    const merge = (r: number) => ws.mergeCells(`A${r}:${lastCol}${r}`);

    // Vrstica 1 — znak + naziv podjetja (temni pas)
    merge(1);
    const r1 = ws.getCell("A1");
    r1.value = report.company.name;
    r1.font = { bold: true, size: 15, color: { argb: "FFFFFFFF" } };
    r1.alignment = { vertical: "middle", indent: 1 };
    r1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
    ws.getRow(1).height = 26;

    // Vrstica 2 — naslov dokumenta + obdobje (temni pas)
    merge(2);
    const r2 = ws.getCell("A2");
    r2.value = `EVIDENCA O IZRABI DELOVNEGA ČASA  ·  18. člen ZEPDSV  ·  ${monthLabel(month)}${report.company.tax_id ? `  ·  Davčna št.: ${report.company.tax_id}` : ""}`;
    r2.font = { size: 9.5, color: { argb: "FFCBD5E1" } };
    r2.alignment = { vertical: "middle", indent: 1 };
    r2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
    ws.getRow(2).height = 16;

    // Vrstica 3 — tanek poudarek
    merge(3);
    ws.getCell("A3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: ACCENT } };
    ws.getRow(3).height = 3;

    // Vrstici 4–5 — podatki zaposlenega (panel)
    merge(4);
    const r4 = ws.getCell("A4");
    r4.value = {
      richText: [
        { text: "Zaposleni:  ", font: { color: { argb: MUTED }, size: 10 } },
        { text: emp.full_name, font: { bold: true, size: 11, color: { argb: DARK } } },
        { text: `      Delovno mesto:  ${emp.job_title ?? "—"}`, font: { size: 10, color: { argb: DARK } } },
        { text: `      Tedenski delovni čas:  ${emp.weekly_hours != null ? `${emp.weekly_hours} h` : "—"}`, font: { size: 10, color: { argb: DARK } } },
      ],
    };
    r4.alignment = { vertical: "middle", indent: 1 };
    r4.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PANEL } };
    ws.getRow(4).height = 18;

    merge(5);
    const r5 = ws.getCell("A5");
    r5.value = {
      richText: [
        { text: "EMŠO:  ", font: { color: { argb: MUTED }, size: 10 } },
        { text: `${emp.emso ?? "—"}`, font: { size: 10, color: { argb: DARK } } },
        { text: "      Davčna številka:  ", font: { color: { argb: MUTED }, size: 10 } },
        { text: `${emp.tax_id ?? "—"}`, font: { size: 10, color: { argb: DARK } } },
        ...(emp.is_management
          ? [{ text: "      (poslovodna oseba — evidenca izrabe se ne vodi)", font: { italic: true, size: 9, color: { argb: MUTED } } }]
          : []),
      ],
    };
    r5.alignment = { vertical: "middle", indent: 1 };
    r5.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PANEL } };
    ws.getRow(5).height = 18;

    ws.getRow(6).height = 6; // razmik

    // Vrstica 7 — glava tabele
    const head = ws.getRow(7);
    HEAD.forEach((label, i) => {
      const c = head.getCell(i + 1);
      c.value = label;
      c.font = { bold: true, size: 9.5, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
      c.alignment = { vertical: "middle", horizontal: i >= 3 && i <= 10 ? "center" : "left", wrapText: true };
      c.border = allBorders;
    });
    head.height = 26;

    // Podatkovne vrstice
    let r = 8;
    emp.entries.forEach((e, i) => {
      const row = ws.getRow(r);
      const vals = [
        fmtDate(e.date),
        fmtTime(e.clock_in),
        fmtTime(e.clock_out),
        num(e.total_worked_hours),
        num(e.overtime_hours),
        num(e.night_hours),
        num(e.sunday_hours),
        num(e.holiday_hours),
        num(e.shift_split_hours),
        num(e.unevenly_distributed_hours),
        num(e.pension_benefit_hours),
        e.pension_benefit_status ?? "",
        e.notes ?? "",
      ];
      vals.forEach((v, ci) => {
        const c = row.getCell(ci + 1);
        c.value = v;
        c.border = allBorders;
        c.font = { size: 9.5, color: { argb: DARK } };
        if (ci >= 3 && ci <= 10) {
          c.numFmt = "0.00";
          c.alignment = { horizontal: "right" };
        }
        if (i % 2 === 1) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BAND } };
      });
      r++;
    });
    if (emp.entries.length === 0) {
      const row = ws.getRow(r);
      ws.mergeCells(`A${r}:${lastCol}${r}`);
      const c = row.getCell(1);
      c.value = "Ni vnosov v tem obdobju.";
      c.font = { italic: true, size: 9.5, color: { argb: MUTED } };
      c.alignment = { horizontal: "center" };
      c.border = allBorders;
      r++;
    }

    // Vrstica SKUPAJ
    const totalRow = ws.getRow(r);
    const t = emp.totals;
    const totalVals = [
      "SKUPAJ", "", "",
      t.total_worked_hours, t.overtime_hours, t.night_hours, t.sunday_hours,
      t.holiday_hours, t.shift_split_hours, t.unevenly_distributed_hours, t.pension_benefit_hours,
      "", "",
    ];
    totalVals.forEach((v, ci) => {
      const c = totalRow.getCell(ci + 1);
      c.value = v;
      c.font = { bold: true, size: 9.5, color: { argb: DARK } };
      c.border = { ...allBorders, top: { style: "medium", color: { argb: DARK } } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BAND } };
      if (ci >= 3 && ci <= 10) {
        c.numFmt = "0.00";
        c.alignment = { horizontal: "right" };
      }
    });
    r += 2;

    // ODSOTNOSTI
    ws.mergeCells(`A${r}:${lastCol}${r}`);
    const ah = ws.getCell(`A${r}`);
    ah.value = "ODSOTNOSTI (neopravljene ure)";
    ah.font = { bold: true, size: 10, color: { argb: DARK } };
    r++;

    if (emp.absences.length === 0) {
      ws.getCell(`A${r}`).value = "Ni odsotnosti v tem obdobju.";
      ws.getCell(`A${r}`).font = { italic: true, size: 9.5, color: { argb: MUTED } };
      r++;
    } else {
      const absHead = ["Od", "Do", "Ure", "Vrsta", "Kategorija nadomestila"];
      const hr = ws.getRow(r);
      absHead.forEach((label, i) => {
        const c = hr.getCell(i + 1);
        c.value = label;
        c.font = { bold: true, size: 9.5, color: { argb: "FFFFFFFF" } };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
        c.border = allBorders;
        c.alignment = { horizontal: i === 2 ? "right" : "left" };
      });
      ws.mergeCells(`E${r}:${lastCol}${r}`);
      r++;
      emp.absences.forEach((a, i) => {
        const row = ws.getRow(r);
        const vals = [
          fmtDate(a.date_from),
          fmtDate(a.date_to),
          num(a.unworked_hours),
          TYPE_LABELS[a.compensation_type] ?? a.compensation_type,
          CATEGORY_LABELS[a.compensation_category] ?? a.compensation_category,
        ];
        vals.forEach((v, ci) => {
          const c = row.getCell(ci + 1);
          c.value = v;
          c.border = allBorders;
          c.font = { size: 9.5, color: { argb: DARK } };
          if (ci === 2) {
            c.numFmt = "0.00";
            c.alignment = { horizontal: "right" };
          }
          if (i % 2 === 1) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BAND } };
        });
        ws.mergeCells(`E${r}:${lastCol}${r}`);
        r++;
      });
    }
    r += 2;

    // Podpisni blok
    ws.getCell(`A${r}`).value = `Dokument ustvarjen elektronsko dne ${generated}.`;
    ws.getCell(`A${r}`).font = { size: 9, color: { argb: MUTED } };
    r += 2;
    ws.getCell(`A${r}`).value = "Kraj in datum: ____________________";
    ws.getCell(`A${r}`).font = { size: 10, color: { argb: DARK } };
    r += 2;
    ws.getCell(`A${r}`).value = "Podpis delavca: ____________________";
    ws.getCell(`A${r}`).font = { size: 10, color: { argb: DARK } };
    ws.getCell(`H${r}`).value = "Podpis odgovorne osebe: ____________________";
    ws.getCell(`H${r}`).font = { size: 10, color: { argb: DARK } };

    ws.pageSetup.printArea = `A1:${lastCol}${r}`;
  }

  if (report.employees.length === 0) {
    const ws = wb.addWorksheet("Prazno");
    ws.getCell("A1").value = "Ni zaposlenih za izvoz.";
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="evidenca-${month}.xlsx"`,
    },
  });
}
