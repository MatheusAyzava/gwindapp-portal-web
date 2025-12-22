// Service Worker para cache da aplicação
const CACHE_NAME = 'gwind-portal-v1';

// Instalar Service Worker
self.addEventListener('install', (event) => {
  // Não bloquear a instalação se alguns recursos falharem
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Tentar fazer cache apenas da página principal
        // Os outros recursos serão cacheados dinamicamente quando solicitados
        return cache.add('/').catch((err) => {
          console.warn('[SW] Erro ao fazer cache inicial:', err);
          // Continuar mesmo se falhar
        });
      })
      .then(() => {
        // Forçar ativação imediata do novo Service Worker
        return self.skipWaiting();
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições (network-first strategy para evitar problemas)
self.addEventListener('fetch', (event) => {
  // Não fazer cache de requisições de API
  if (event.request.url.includes('/api/') || event.request.url.includes('/medicoes') || event.request.url.includes('/materiais')) {
    return; // Deixar passar direto para a rede
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a requisição foi bem-sucedida, fazer cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar na rede, tentar buscar do cache
        return caches.match(event.request);
      })
  );
});


