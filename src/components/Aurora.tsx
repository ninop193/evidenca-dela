// Svetlo holografsko ozadje — živ pastelni mavrični mesh z iridescenco.
export function Aurora() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #eef0ff 0%, #fdeaf7 45%, #eafff6 100%)" }}
    >
      <div
        className="holo-orb float-a"
        style={{ width: 720, height: 720, left: "-12%", top: "-18%", background: "radial-gradient(circle, var(--color-holo-rose), transparent 66%)" }}
      />
      <div
        className="holo-orb float-b"
        style={{ width: 660, height: 660, right: "-10%", top: "-10%", background: "radial-gradient(circle, var(--color-holo-sky), transparent 66%)" }}
      />
      <div
        className="holo-orb float-a"
        style={{ width: 760, height: 760, left: "8%", bottom: "-30%", background: "radial-gradient(circle, var(--color-holo-violet), transparent 66%)", animationDelay: "-7s" }}
      />
      <div
        className="holo-orb float-b"
        style={{ width: 620, height: 620, right: "2%", bottom: "-22%", background: "radial-gradient(circle, var(--color-holo-mint), transparent 66%)", animationDelay: "-4s" }}
      />
      <div
        className="holo-orb float-y"
        style={{ width: 520, height: 520, left: "38%", top: "28%", background: "radial-gradient(circle, var(--color-holo-peach), transparent 66%)", opacity: 0.7 }}
      />
      <div className="holo-sheen hue-spin absolute inset-0 opacity-70" />
      <div className="grain absolute inset-0 opacity-[0.05]" />
      <div className="absolute inset-0 bg-white/10" />
    </div>
  );
}
