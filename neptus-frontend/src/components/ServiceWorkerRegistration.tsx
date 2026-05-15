"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none", // Nunca usa cache do navegador para o SW
          });

          console.log("✅ SW: Service Worker registrado:", registration.scope);

          // Verifica se há atualização disponível
          await registration.update();

          // Listen para atualizações
          registration.addEventListener("updatefound", () => {
            console.log("🔄 SW: Nova versão disponível");
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // Força ativação imediata da nova versão
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                  // Recarrega a página para usar a nova versão
                  window.location.reload();
                }
              });
            }
          });

          // Verifica atualizações periodicamente
          setInterval(() => {
            registration.update();
          }, 60000); // A cada 1 minuto
        } catch (error) {
          console.error("❌ SW: Falha ao registrar:", error);
        }
      };

      registerSW();

      // Listen para mensagens do Service Worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SKIP_WAITING") {
          window.location.reload();
        }
      });

      // Listen para mudanças no estado do Service Worker
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("🔄 SW: Controller mudou - recarregando página");
        window.location.reload();
      });
    } else {
      console.warn("⚠️ SW: Service Worker não suportado neste navegador");
    }
  }, []);

  return null;
}
