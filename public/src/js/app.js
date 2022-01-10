var deferredPrompt
const enableNotificationsButtons = document.querySelectorAll(
  ".enable-notifications"
)

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("sw registered"))
    .catch((error) => console.log("sw error " + error))
}

window.addEventListener("beforeinstallprompt", function (event) {
  console.log("beforeinstallprompt fired")
  event.preventDefault()
  deferredPrompt = event
  return false
})

function displayConfirmNotification() {
  const options = {
    body: "You successfuly subscribe to our Notification service!",
    icon: "/src/images/icons/app-icon-96x96.png", // path to icon url
    image: "/src/images/sf-boat.jpg", // part of the content of notification
    dir: "ltr", // notification direction
    lang: "en-US", // language
    vibrate: [100, 50, 200], // vibration of device
    badge: "/src/images/icons/app-icon-96x96.png",
    tag: "confirm-notification", // id for notification
    renotify: true, // if true, same tag can vibrate again
    actions: [
      // não funciona em todos os devices, não colocar as principais funcionalidades aqui
      {
        action: "confirm",
        title: "Okay",
        icon: "/src/images/icons/app-icon-96x96.png",
      },
      {
        action: "cancel",
        title: "Cancel",
        icon: "/src/images/icons/app-icon-96x96.png",
      },
    ],
  }
  if ("serviceWorker" in navigator) {
    return navigator.serviceWorker.ready.then((serviceWorkerRegistered) => {
      serviceWorkerRegistered.showNotification(
        "Successfully subscribed! (From SW)",
        options
      )
    })
  }
  new Notification("Successfully subscribed!", options)
}

function configurePushSubscriptions() {
  let registration
  navigator.serviceWorker.ready
    .then((serviceWorkerRegistered) => {
      registration = serviceWorkerRegistered
      return serviceWorkerRegistered.pushManager.getSubscription()
    })
    .then((subscription) => {
      if (subscription === null) {
        // create a new
        const vapidPublicKey = "" // the web-push public key
        registration.pushManager.subscribe({
          userVisibleOnly: true,
        })
      } else {
        // update the subscription
      }
    })
}

function askForNotificiationPermission(event) {
  Notification.requestPermission((result) => {
    console.log("User Choice ", result)
    if (result !== "granted") {
      console.log("No notification permission granted")
      return
    }
    configurePushSubscriptions()
    // displayConfirmNotification()
    event.target.style.display = "none"
  })
  // .then((response) => {
  //   console.log(response)
  // })
  // .catch((error) => {
  //   console.error(error)
  // })
}

if ("Notification" in window && "serviceWorker" in navigator) {
  enableNotificationsButtons.forEach((enableNotificationButton) => {
    enableNotificationButton.style.display = "inline-block"
    enableNotificationButton.addEventListener(
      "click",
      askForNotificiationPermission
    )
  })
}
