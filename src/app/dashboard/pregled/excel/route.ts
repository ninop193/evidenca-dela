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

function safeSheetName(name: string, fallback: string) {
  const cleaned = name.replace(/[[\]:*?/\\]/g, " ").trim().slice(0, 28);
  return cleaned || fallback;
}

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

  const wb = new ExcelJS.Workbook();
  wb.creator = "Evidenca delovnega časa";
  wb.created = new Date();

  const headerCols = [
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

  report.employees.forEach((emp, idx) => {
    const ws = wb.addWorksheet(safeSheetName(emp.full_name, `Zaposleni ${idx + 1}`));
    ws.columns = headerCols.map(() => ({ width: 14 }));

    const titleRow = ws.addRow(["EVIDENCA O IZRABI DELOVNEGA ČASA (18. člen ZEPDSV)"]);
    titleRow.font = { bold: true, size: 13 };
    ws.addRow([`${report.company.name}${report.company.tax_id ? `, davčna št.: ${report.company.tax_id}` : ""}`]);
    ws.addRow([`Obdobje: ${month}`]);
    ws.addRow([]);

    ws.addRow([`Zaposleni: ${emp.full_name}`]).font = { bold: true };
    ws.addRow([
      `EMŠO: ${emp.emso ?? "—"}    Davčna: ${emp.tax_id ?? "—"}    Delovno mesto: ${emp.job_title ?? "—"}    Tedenski delovni čas: ${emp.weekly_hours ?? "—"} h`,
    ]);
    if (emp.is_management) {
      ws.addRow(["Poslovodna oseba — evidenca izrabe delovnega časa se ne vodi."]).font = {
        italic: true,
      };
    }
    ws.addRow([]);

    const head = ws.addRow(headerCols);
    head.font = { bold: true };
    head.eachCell((c) => {
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
      c.border = { bottom: { style: "thin" } };
    });

    for (const e of emp.entries) {
      ws.addRow([
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
      ]);
    }

    const t = emp.totals;
    const totalRow = ws.addRow([
      "SKUPAJ",
      "",
      "",
      t.total_worked_hours,
      t.overtime_hours,
      t.night_hours,
      t.sunday_hours,
      t.holiday_hours,
      t.shift_split_hours,
      t.unevenly_distributed_hours,
      t.pension_benefit_hours,
      "",
      "",
    ]);
    totalRow.font = { bold: true };
    totalRow.eachCell((c) => {
      c.border = { top: { style: "thin" } };
    });

    // Odsotnosti
    ws.addRow([]);
    ws.addRow(["ODSOTNOSTI (neopravljene ure)"]).font = { bold: true };
    if (emp.absences.length === 0) {
      ws.addRow(["Ni odsotnosti v tem obdobju."]);
    } else {
      const ah = ws.addRow(["Od", "Do", "Ure", "Vrsta", "Kategorija nadomestila"]);
      ah.font = { bold: true };
      for (const a of emp.absences) {
        ws.addRow([
          fmtDate(a.date_from),
          fmtDate(a.date_to),
          num(a.unworked_hours),
          TYPE_LABELS[a.compensation_type] ?? a.compensation_type,
          CATEGORY_LABELS[a.compensation_category] ?? a.compensation_category,
        ]);
      }
      ws.addRow(["", "", t.unworked_hours, "SKUPAJ neopravljene ure", ""]).font = { bold: true };
    }

    ws.addRow([]);
    ws.addRow([`Ustvarjeno: ${new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, dateStyle: "long" }).format(new Date())}`]);
    ws.addRow(["Podpis odgovorne osebe: ____________________________"]);
  });

  if (report.employees.length === 0) {
    wb.addWorksheet("Prazno").addRow(["Ni zaposlenih."]);
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
