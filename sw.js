// SERVICE WORKER DA ACADEMIA TÉCNICA MIKROTIK
const CACHE_NAME = 'academia-mikrotik-v2.1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/modules.css',
  './css/winbox.css',
  './css/terminal.css',
  './css/lab.css',
  './css/quiz.css',
  './css/admin.css',
  './css/certificate.css',
  './js/app.js',
  './js/api.js',
  './js/localApi.js',
  './js/icons.js',
  './js/router.js',
  './js/data/modulesData.js',
  './js/data/labsData.js',
  './js/data/curriculumData.js',
  './js/data/materialsData.js',
  './js/views/login.js',
  './js/views/dashboard.js',
  './js/views/syllabus.js',
  './js/views/moduleView.js',
  './js/views/lesson.js',
  './js/views/labs.js',
  './js/views/quiz.js',
  './js/views/competencies.js',
  './js/views/finalProject.js',
  './js/views/materials.js',
  './js/views/profile.js',
  './js/views/certificate.js',
  './js/views/admin.js',
  './images/pwa-icon-192.png',
  './images/pwa-icon-512.png',
  './images/pwa-icon-maskable.png',
  './images/apple-touch-icon.png',
  './images/pwa-icon.svg',
  './images/mikrotik_rack_setup.jpg',
  './images/mikrotik_bench_lab.jpg',
  './images/mikrotik_hardware_closeup.jpg'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA] Pré-carregando assets estáticos para funcionamento offline...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA] Aviso no pré-cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não intercepta chamadas de API do backend (deixa o cliente tratar)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Para assets estáticos: Stale While Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Se falhou rede e tem cache, o cachedResponse já é retornado
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

