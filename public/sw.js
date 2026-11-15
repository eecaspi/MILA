// Liky service worker: shows push notifications and opens the page that was sent.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || "ליקי";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "יש הטבה חדשה באתר",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      dir: "rtl",
      lang: "he",
      data: { url: data.url || "/deals" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/deals";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
