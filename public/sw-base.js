importScripts("workbox-sw.prod.v2.1.3.js")
importScripts("/src/js/idb.js")
importScripts("/src/js/idb-store.js")

const ONCE_PER_MONTH = 60 * 60 * 24 * 30
const url = "https://ficha-academia-web-top.firebaseio.com/posts.json"
const workboxSW = new self.WorkboxSW()

workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "google-fonts",
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: ONCE_PER_MONTH,
    },
  })
)
workboxSW.router.registerRoute(
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "material-css",
  })
)
// ignore images
workboxSW.router.registerRoute(
  /.*(?:firebasestorage\.googleapis)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "post-images",
  })
)

workboxSW.router.registerRoute(url, (args) => {
  fetch(args.event.request).then(function (response) {
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
})

function dynamicCache(res, event) {
  return caches.open("dynamic").then(function (cache) {
    cache.put(event.request.url, res.clone())
    return res
  })
}

const sendData = async (post) => {
  try {
    const postData = new FormData()
    postData.append("id", post.id)
    postData.append("title", post.title)
    postData.append("location", post.location)
    postData.append("file", post.picture, post.id + ".png")
    postData.append("rawLocation", post.rawLocation)

    const response = await fetch(url, {
      method: "post",
      // The content is no longer json, just a formData
      // headers: {
      //   "Content-Type": "application/json",
      //   Accept: "application/json",
      // },
      // body: JSON.stringify({
      //   ...post,
      //   image:
      //     "https://firebasestorage.googleapis.com/v0/b/ficha-academia-web-top.appspot.com/o/sf-boat.jpg?alt=media&token=313e7833-2f83-44ac-a005-3b8ec33f26b4",
      // }),
      body: postData,
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

workboxSW.router.registerRoute(
  (routeData) => {
    return routeData.event.request.headers.get("accept").includes("text/html")
  },
  (args) => {
    caches.match(args.event.request).then(function (response) {
      if (!response) {
        return fetch(args.event.request)
          .then((res) => dynamicCache(res, args.event))
          .catch((err) => {
            console.error(err)
            return caches.matchs("/offline.html").then((responseOffline) => {
              return responseOffline
            })
          })
      }
      // return the cached response
      return response
    })
  }
)

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

workboxSW.precache([])
