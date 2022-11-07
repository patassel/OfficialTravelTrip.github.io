'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "2c82a35cb9d289f500a6be7f9e87bd2b",
"assets/assets/font/Merienda-Regular.ttf": "37794e74f8aea133479ab6b268e4467d",
"assets/assets/font/OoohBaby-Regular.ttf": "2d3cee10b218b6f30adb6738acfd48aa",
"assets/assets/footer/footer.jpg": "854cdc86388660a0685de02e479d302b",
"assets/assets/footer/welcomeFooter.jpg": "c47af8a839837c444413c75bfd4ea9ca",
"assets/assets/image/backgroundCuran.jpg": "d4710c3754552143721ffeb103696252",
"assets/assets/image/background_deco1.jpg": "acd9c9cfa1b7895f47e87a88b61f2ec2",
"assets/assets/image/belg1.jpg": "1ba6c338f16b70465923748a0e1c9a2a",
"assets/assets/image/campFire.jpg": "cc7568a1418f469d3349f25945c3744a",
"assets/assets/image/desert1.jpg": "306551222363e325a28ad05b85acfdf5",
"assets/assets/image/galaxyFont1.jpg": "45fdc3af0de909e5e5bb4692afdb95fb",
"assets/assets/image/kitTravel.jpg": "7fa5c9bf1046e99e095bae88aa2b622f",
"assets/assets/image/maroc1.jpg": "5a9dc25cb7d9e16c9900b22b855b4b05",
"assets/assets/image/mountain1.jpg": "70ddc8982942e4f784003da642d96bcb",
"assets/assets/image/pioupiou2.jpg": "a04cab872c7735ec7890192baed915d3",
"assets/assets/image/sundown2.jpg": "1f7b6164718cc327c10fe1b33c97e6c4",
"assets/assets/image/sundownnight.jpg": "b859cc3bb7659b5ef695b0c6336c3c77",
"assets/assets/image/travelAirline.jpg": "2ce18721d29567ff3605e2dc51e1bc80",
"assets/assets/logo/travellogo.jpg": "8203bec818d65006b0c509af573d0bf4",
"assets/assets/logo/travelplaya.jpg": "8ef53e63d4003c9e1371ebc726f912cb",
"assets/FontManifest.json": "f70d5dad0a11d3b6c7f52afff01b1579",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/NOTICES": "3ef9058373de1b71b17c334604465120",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/shaders/ink_sparkle.frag": "ae6c1fd6f6ee6ee952cde379095a8f3f",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"favicon.png": "8f650b4c9e564fe1256248ce644e9c4a",
"flutter.js": "f85e6fb278b0fd20c349186fb46ae36d",
"icons/Icon-192.png": "f7cb350e5a57a7fdfb310e907d0450ff",
"icons/Icon-512.png": "ec292b99e8aa1c865c1480041dfa9639",
"icons/Icon-maskable-192.png": "f7cb350e5a57a7fdfb310e907d0450ff",
"icons/Icon-maskable-512.png": "ec292b99e8aa1c865c1480041dfa9639",
"index.html": "3d18ff6c62786c96181495925e093f70",
"/": "3d18ff6c62786c96181495925e093f70",
"main.dart.js": "5622a279b2a9e4d583ee1f898d71b620",
"manifest.json": "0fc6af932db0b615eaecef77e9022e33",
"version.json": "7ed757daf29d7dfcb976026ecec2d3ad"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
