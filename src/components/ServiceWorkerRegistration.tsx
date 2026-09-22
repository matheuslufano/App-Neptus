"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.warn("SW: Service Worker nao suportado neste navegador");
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      const clearDevelopmentServiceWorker = async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map((registration) => registration.unregister()),
          );

          if ("caches" in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames
                .filter(
                  (cacheName) =>
                    cacheName.includes("neptus") ||
                    cacheName.includes("workbox"),
                )
                .map((cacheName) => caches.delete(cacheName)),
            );
          }

          console.log("SW: Service Worker desativado em desenvolvimento");
        } catch (error) {
          console.error("SW: Falha ao limpar service worker em dev:", error);
        }
      };

      clearDevelopmentServiceWorker();
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        console.log("SW: Service Worker registrado:", registration.scope);

        await registration.update();

        registration.addEventListener("updatefound", () => {
          console.log("SW: Nova versao disponivel");
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                newWorker.postMessage({ type: "SKIP_WAITING" });
                window.location.reload();
              }
            });
          }
        });

        setInterval(() => {
          registration.update();
        }, 60000);
      } catch (error) {
        console.error("SW: Falha ao registrar:", error);
      }
    };

    registerSW();

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SKIP_WAITING") {
        window.location.reload();
      }
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("SW: Controller mudou - recarregando pagina");
      window.location.reload();
    });
  }, []);

  return null;
}
