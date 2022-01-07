importScripts("/src/js/idb.js")
importScripts("/src/js/idb-store.js")
const url = "https://ficha-academia-web-top.firebaseio.com/posts.json"
const cache_version = 9
const CACHE_STATIC_NAME = "static-" + 3
const CACHE_DYNAMIC_NAME = "dynamic-" + cache_version
const STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/idb.js",
  "/src/js/idb-store.js",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/material.min.js",
  "src/css/app.css",
  "src/css/feed.css",
  "src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
]

function trimCache(cacheName, maxItems) {
  caches
    .open(cacheName)
    .then(function (cache) {
      return cache.keys()
    })
    .then(function (keys) {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(trimCache(cacheName, maxItems))
      }
    })
}

const sendData = async (post) => {
  try {
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...post,
        image:
          "https://firebasestorage.googleapis.com/v0/b/ficha-academia-web-top.appspot.com/o/sf-boat.jpg?alt=media&token=313e7833-2f83-44ac-a005-3b8ec33f26b4",
      }),
    })
    console.log("[Service Worker] Send Data", response)
    if (response.ok) {
      console.log(post.id)
      clearItemFromData(post.id, "sync-posts")
    }
  } catch (error) {
    console.error(error)
  }
}

self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installing Service worker", event)
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log("[Service Worker] Precaching App Shell")
      // cache.add('/src/js/app.js')
      // App Shell
      cache.addAll(STATIC_FILES)
    })
  )
})

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activating Service worker...", event)
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] removing old cache", key)
            return caches.delete(key)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

function dynamicCache(res, event) {
  return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
    cache.put(event.request.url, res.clone())
    return res
  })
}

// no life-cycle
// Strategy: cache with network fallback
function cacheWithNetworkFallback(event) {
  // console.log('[Service Worker] Fetching Service worker', event)
  // event.respondWith(fetch(event.request)); // overwrite the data that is send
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // if is not found
      if (!response) {
        return fetch(event.request)
          .then((res) => dynamicCache(res, event))
          .catch((err) => {
            console.error(err)
            return caches.open(CACHE_STATIC_NAME).then(function (cache) {
              if (
                event.request.url.headers.get("accept").includes("text/html")
              ) {
                return cache.match("/offline.html")
              }
            })
          })
      }
      // return the cached response
      return response
    })
  )
}

// Strategy: cache with cache only
function cacheWithCacheOnly(event) {
  // console.log('[Service Worker] Fetching Service worker', event)
  // event.respondWith(fetch(event.request)); // overwrite the data that is send
  event.respondWith(
    // return the cached response
    caches.match(event.request)
  )
}

// Strategy: network only
function networkOnly(event) {
  // console.log('[Service Worker] Fetching Service worker', event)
  // event.respondWith(fetch(event.request)); // overwrite the data that is send
  event.respondWith(fetch(event.request))
}

// Strategy: network with cache fallback
function networkWithCacheFallback(event) {
  event.respondWith(
    fetch(event.request)
      .then((res) => dynamicCache(res, event))
      .catch(function (err) {
        caches.match(event.request)
      })
  )
}

// Stategy: cache then network
function cacheThenNetwork(event) {
  var url = "https://ficha-academia-web-top.firebaseio.com/posts"
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then(function (response) {
        var clonedResponse = response.clone()
        clearAllData()
          .then(() => {
            return clonedResponse.json()
          })
          .then((data) => {
            for (let key in data) {
              writeData(data[key])
            }
          })
        return response
      })
      // version with cache
      // caches.open(CACHE_DYNAMIC_NAME)
      //     .then(function(cache) {
      // return fetch(event.request)
      // .then(function(response) {
      //     // cleaning the cache
      //     // trimCache(CACHE_DYNAMIC_NAME, 3)
      //     cache.put(event.request, response.clone());
      //     return response;
      // })
      // })
    )
  } else if (STATIC_FILES.includes(event.request.url)) {
    // Strategy: cache with cache only
    cacheWithCacheOnly(event)
  } else {
    // Strategy: cache Fwith network fallback
    cacheWithNetworkFallback(event)
  }
}

self.addEventListener("beforeinstallprompt", function (event) {
  console.log("[Service Worker] Before install prompt", event)
})

self.addEventListener("fetch", cacheThenNetwork)

self.addEventListener("sync", function (event) {
  console.log("[Service Worker] Background syncing", event)
  if (event.tag == "sync-new-posts") {
    console.log("[Service Worker] Syncing new posts")
    event.waitUntil(
      readData("sync-posts").then(function (posts) {
        console.log({ posts })
        for (post of posts) {
          sendData(post)
        }
      })
    )
  }
})

self.addEventListener("notificationclick", function (event) {
  const notification = event.notification
  const action = event.action

  console.log(notification)

  if (action === "confirm") {
    console.log("Confirm was chosen")
    notification.close()
  } else {
    event.waitUntil(
      clients.matchAll().then((clients) => {
        const clientFound = clients.find(
          (client) => client.visibilityState === "visible"
        )
        if (clientFound) {
          clientFound.navigate("http://localhost:8080" + notification.data.url)
          clientFound.focus()
        } else {
          clients.openWindow("http://localhost:8080" + notification.data.url)
        }
      })
    )
    notification.close()
    console.log(action)
  }
})

self.addEventListener("notificationclose", function (event) {
  console.log("Notification was closed", event)
})

self.addEventListener("push", function (event) {
  console.log("Push Notification received", event)
  let data = {
    title: "New!",
    content: "Something new happend!",
    openUrl: "/help",
  }
  if (event.data) data = JSON.parse(event.data.text())
  const options = {
    body: data.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
    data: { url: data.openUrl },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})
