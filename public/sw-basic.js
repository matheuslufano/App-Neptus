// Service Worker básico para Neptus - Não bloqueia acesso offline
const CACHE_NAME = "neptus-basic-v1";

// Lista de recursos essenciais para cache
const ESSENTIAL_RESOURCES = [
  "/login",
  "/_next/static/css/",
  "/_next/static/chunks/",
  "/images/",
  "/fonts/",
];

// Instala e faz cache básico
self.addEventListener("install", (event) => {
  console.log("📦 SW: Instalando...");
  self.skipWaiting(); // Força ativação imediata
});

// Ativa e assume controle
self.addEventListener("activate", (event) => {
  console.log("🚀 SW: Ativando...");
  event.waitUntil(
    Promise.all([
      // Limpa caches antigos
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((cacheName) => cacheName !== CACHE_NAME)
              .map((cacheName) => caches.delete(cacheName))
          )
        ),
      // Assume controle imediato
      self.clients.claim(),
    ])
  );
});

// Intercepta requests - NUNCA bloqueia navegação
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignora requests não-HTTP
  if (!request.url.startsWith("http")) return;

  const url = new URL(request.url);

  // Para navegação (páginas HTML)
  if (request.mode === "navigate") {
    event.respondWith(
      // Sempre tenta rede primeiro, mas NÃO espera muito
      Promise.race([
        fetch(request).catch(() => {
          console.log("📱 SW: Rede falhou, permitindo acesso offline");
          throw new Error("Network failed");
        }),
        // Timeout de 2 segundos
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 2000)
        ),
      ]).catch(async () => {
        // Se falhou, tenta cache ou permite que a página carregue normalmente
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          console.log("📱 SW: Servindo do cache");
          return cachedResponse;
        }

        // Último recurso: deixa o navegador lidar com isso
        // Isso permite que a aplicação Next.js lide com o offline
        console.log("📱 SW: Sem cache, deixando navegador lidar");
        return new Response("", { status: 200 });
      })
    );
    return;
  }

  // Para recursos estáticos, tenta cache primeiro
  if (
    url.pathname.includes("/_next/") ||
    url.pathname.includes("/images/") ||
    url.pathname.includes("/fonts/") ||
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Se conseguiu buscar, salva no cache
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Se falhou, retorna resposta vazia mas não bloqueia
            return new Response("", { status: 404 });
          });
      })
    );
    return;
  }

  // Para tudo mais (APIs, etc), deixa passar normalmente
  // NÃO intercepta para não causar bloqueios
});

console.log("✅ SW Neptus Básico: Carregado - Modo não-bloqueante");
