// Network-first for pages, cache-first for static files. Never caches API calls.
const C = "ch-v1";
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(["/", "/privacy", "/icon.svg", "/manifest.webmanifest"]))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", (e) => {
  const r = e.request; const u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then((res) => { caches.open(C).then((c) => c.put(r, res.clone())); return res; })
      .catch(() => caches.match(r).then((m) => m || caches.match("/"))));
    return;
  }
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { if (res.ok) { const cl = res.clone(); caches.open(C).then((c) => c.put(r, cl)); } return res; })));
});
