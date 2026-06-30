"use client";

import { useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { inputClasses, cn } from "@/components/ui";

// ISO (yyyy-mm-dd) → slovenski prikaz "d. m. llll".
function isoToSlo(iso?: string | null): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  return `${+m[3]}. ${+m[2]}. ${m[1]}`;
}

// Slovenski vnos "d. m. llll" / "d.m.llll" → ISO (ali "" če neveljaven).
function sloToIso(s: string): string {
  const m = s.trim().match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/);
  if (!m) return "";
  const d = +m[1], mo = +m[2], y = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  const iso = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const dt = new Date(iso + "T00:00:00");
  if (isNaN(dt.getTime()) || dt.getMonth() + 1 !== mo || dt.getDate() !== d) return "";
  return iso;
}

// Datumsko polje, ki VEDNO prikaže slovenski format (d. m. llll), neodvisno od
// jezika brskalnika. Vrednost se odda kot ISO (yyyy-mm-dd) prek skritega polja.
// Desno je koledarček (nativni izbirnik) za tiste, ki raje kliknejo.
export function SloDateInput({
  name,
  defaultValue = "",
  required = false,
  className,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}) {
  const [iso, setIso] = useState(defaultValue || "");
  const [text, setText] = useState(isoToSlo(defaultValue));
  const textRef = useRef<HTMLInputElement>(null);

  function applyValidity(t: string, newIso: string) {
    textRef.current?.setCustomValidity(
      t.trim() !== "" && !newIso ? "Vnesi datum kot d. m. llll (npr. 15. 7. 2026)." : "",
    );
  }
  function onText(e: React.ChangeEvent<HTMLInputElement>) {
    const t = e.target.value;
    const newIso = sloToIso(t);
    setText(t);
    setIso(newIso);
    applyValidity(t, newIso);
  }
  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value; // ISO iz nativnega izbirnika
    setIso(v);
    setText(isoToSlo(v));
    textRef.current?.setCustomValidity("");
  }

  return (
    <div className={cn("relative", className)}>
      {/* Vrednost, ki se odda (ISO) */}
      <input type="hidden" name={name} value={iso} />
      {/* Vidno polje s slovenskim formatom */}
      <input
        ref={textRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={text}
        onChange={onText}
        required={required}
        placeholder="d. m. llll"
        className={cn(inputClasses, "pr-11")}
      />
      <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      {/* Prozoren nativni izbirnik čez ikono (odpre koledar ob kliku) */}
      <input
        type="date"
        value={iso}
        onChange={onPick}
        aria-label="Izberi datum iz koledarja"
        className="absolute right-0 top-0 h-full w-11 cursor-pointer opacity-0"
      />
    </div>
  );
}
