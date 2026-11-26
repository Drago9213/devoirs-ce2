// Service worker : uniquement pour les notifications (aucun cache).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: "Devoirs CE2", body: e.data ? e.data.text() : "" }; }
  e.waitUntil((async () => {
    await self.registration.showNotification(d.title || "Devoirs CE2", {
      body: d.body || "", tag: d.tag || undefined, icon: "icon-192.png", badge: "icon-192.png", data: { url: d.url || "./" },
    });
    // Pastille rouge sur l'icône : nombre de notifications non lues
    try {
      let n = 1;
      try { n = (await self.registration.getNotifications()).length || 1; } catch {}
      if (self.navigator.setAppBadge) await self.navigator.setAppBadge(n);
    } catch {}
  })());
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  try { if (self.navigator.clearAppBadge) self.navigator.clearAppBadge(); } catch {}
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) { if ("focus" in c) { c.postMessage({ type: "refresh" }); return c.focus(); } }
    return self.clients.openWindow(url);
  })());
});
