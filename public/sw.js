// Minimalni service worker — omogoča "namestljivost" PWA (Add to Home Screen).
// NAMENOMA brez offline predpomnjenja (brief: offline način ne gradimo).
// Vse zahteve gredo neposredno na mrežo, zato ni tveganja za zastarele podatke.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Brez posega — privzeto mrežno vedenje brskalnika.
});
