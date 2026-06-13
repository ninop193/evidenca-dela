// Slovenske oznake za prikaz (vrednosti ustrezajo CHECK omejitvam v bazi).
export const TYPE_LABELS: Record<string, string> = {
  letni_dopust: "Letni dopust",
  bolniska_do_30: "Bolniška do 30 dni (breme delodajalca)",
  bolniska_zzzs: "Bolniška v breme ZZZS",
  starsevsko: "Starševski dopust / nega",
  izredni_dopust: "Izredni dopust",
  drugo: "Drugo",
};

export const CATEGORY_LABELS: Record<string, string> = {
  nadomestilo_iz_sredstev_delodajalca: "Nadomestilo iz sredstev delodajalca",
  nadomestilo_v_breme_drugih: "Nadomestilo v breme drugih (ZZZS …)",
  brez_nadomestila: "Brez nadomestila (neplačano)",
};
