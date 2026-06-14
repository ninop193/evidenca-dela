// Temno "aurora" ozadje za liquid-glass površine (marketing, prijava).
export function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#020617]">
      <div
        className="aurora-orb float-a"
        style={{ width: 560, height: 560, left: "-8%", top: "-12%", background: "radial-gradient(circle, #2f63ff, transparent 70%)" }}
      />
      <div
        className="aurora-orb float-b"
        style={{ width: 520, height: 520, right: "-6%", top: "6%", background: "radial-gradient(circle, #a855f7, transparent 70%)" }}
      />
      <div
        className="aurora-orb float-a"
        style={{ width: 620, height: 620, left: "22%", bottom: "-26%", background: "radial-gradient(circle, #22d3ee, transparent 70%)", animationDelay: "-7s" }}
      />
      <div className="grain absolute inset-0 opacity-[0.13] mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/10 via-[#020617]/40 to-[#020617]" />
    </div>
  );
}
