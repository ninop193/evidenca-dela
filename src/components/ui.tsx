import * as React from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_8px_22px_-8px_rgba(29,78,216,0.7)] hover:bg-brand-500 active:bg-brand-700",
  secondary:
    "glass sheen text-slate-800 hover:bg-white/75",
  ghost: "text-slate-600 hover:bg-white/60 hover:text-slate-900",
  danger: "bg-white/70 text-red-600 ring-1 ring-red-200 hover:bg-red-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-full gap-1.5",
  md: "h-11 px-5 text-sm rounded-full gap-2",
  lg: "h-12 px-6 text-base rounded-full gap-2",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(
    "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1",
    "disabled:opacity-50 disabled:pointer-events-none select-none",
    VARIANTS[variant],
    SIZES[size],
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(buttonClasses(variant, size), className)} {...props} />;
}

/* -------------------------------------------------------------------------- */
/* Card — frosted glass                                                        */
/* -------------------------------------------------------------------------- */

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass-strong iris-edge rounded-2xl", className)} {...props} />
  );
}

/* -------------------------------------------------------------------------- */
/* Inputs                                                                      */
/* -------------------------------------------------------------------------- */

export const inputClasses = cn(
  "w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900",
  "ring-1 ring-white/80 shadow-[inset_0_1px_2px_rgba(120,130,200,0.08)] placeholder:text-slate-400",
  "outline-none transition focus:ring-2 focus:ring-brand-500",
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputClasses, className)} {...props} />;
  },
);

export const selectClasses = cn(
  "w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900",
  "ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500",
);

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Badge                                                                       */
/* -------------------------------------------------------------------------- */

type BadgeTone = "brand" | "green" | "amber" | "slate" | "red";
const TONES: Record<BadgeTone, string> = {
  brand: "bg-brand-50/80 text-brand-700 ring-brand-200/60",
  green: "bg-emerald-50/80 text-emerald-700 ring-emerald-200/60",
  amber: "bg-amber-50/80 text-amber-700 ring-amber-200/60",
  slate: "bg-white/70 text-slate-600 ring-slate-200/70",
  red: "bg-red-50/80 text-red-700 ring-red-200/60",
};

export function Badge({
  tone = "slate",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Brand wordmark                                                              */
/* -------------------------------------------------------------------------- */

export function Wordmark({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-bold tracking-tight",
        dark ? "text-white" : "text-slate-900",
        className,
      )}
    >
      <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-[0_4px_14px_-2px_rgba(47,99,255,0.6)]">
        <span className="block h-2.5 w-2.5 rounded-full border-2 border-white" />
      </span>
      Evidenca dela
    </span>
  );
}
