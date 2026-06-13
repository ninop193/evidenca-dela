// =============================================================================
// Bruto-neto kalkulator — računski motor in konstante.
//
// ⚠️ POMEMBNO: vse stopnje in olajšave so REGULIRANE številke (FURS).
// Preden kalkulator javno promoviraš, jih POTRDI pri FURS za tekoče leto.
// Spodnje vrednosti so izhodišče za leto 2025 in NISO pravno preverjene.
//
// Vir za preverjanje: FURS – Dohodnina, prispevki za socialno varnost.
// =============================================================================

export const PLACA_CONFIG = {
  leto: 2025,

  // Prispevki za socialno varnost (delež bruto plače)
  prispevkiDelojemalca: 0.221, // 22,10 % (bremenijo zaposlenega)
  prispevkiDelodajalca: 0.161, // 16,10 % (dodatni strošek delodajalca)

  // Splošna olajšava (letni znesek) — PREVERI FURS
  splosnaOlajsavaLetna: 5000,

  // Dohodninska lestvica — LETNE neto osnove — PREVERI FURS
  // (mesečni izračun = letna lestvica / 12)
  lestvica: [
    { doLetno: 8500, stopnja: 0.16 },
    { doLetno: 25000, stopnja: 0.26 },
    { doLetno: 50000, stopnja: 0.33 },
    { doLetno: 72000, stopnja: 0.39 },
    { doLetno: Infinity, stopnja: 0.5 },
  ],
} as const;

export type PlacaIzracun = {
  bruto: number;
  prispevkiDelojemalca: number;
  osnovaZaDohodnino: number;
  dohodnina: number;
  neto: number;
  prispevkiDelodajalca: number;
  strosekDelodajalca: number;
};

// Mesečna akontacija dohodnine po progresivni lestvici (osnova je mesečna).
function dohodninaMesecna(osnovaMesecna: number): number {
  const letnaOsnova = Math.max(0, osnovaMesecna) * 12;
  let davek = 0;
  let prejsnjaMeja = 0;
  for (const razred of PLACA_CONFIG.lestvica) {
    const delez = Math.min(letnaOsnova, razred.doLetno) - prejsnjaMeja;
    if (delez > 0) davek += delez * razred.stopnja;
    prejsnjaMeja = razred.doLetno;
    if (letnaOsnova <= razred.doLetno) break;
  }
  return davek / 12;
}

// Glavni izračun: iz bruto mesečne plače → neto + strošek delodajalca.
export function izracunajPlaco(bruto: number): PlacaIzracun {
  const c = PLACA_CONFIG;
  const b = Math.max(0, bruto || 0);

  const prispevkiDelojemalca = b * c.prispevkiDelojemalca;
  const splosnaOlajsavaMesecna = c.splosnaOlajsavaLetna / 12;
  const osnovaZaDohodnino = Math.max(0, b - prispevkiDelojemalca - splosnaOlajsavaMesecna);
  const dohodnina = dohodninaMesecna(osnovaZaDohodnino);
  const neto = b - prispevkiDelojemalca - dohodnina;
  const prispevkiDelodajalca = b * c.prispevkiDelodajalca;

  return {
    bruto: b,
    prispevkiDelojemalca,
    osnovaZaDohodnino,
    dohodnina,
    neto,
    prispevkiDelodajalca,
    strosekDelodajalca: b + prispevkiDelodajalca,
  };
}

export const eur = (n: number) =>
  new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR" }).format(n || 0);
