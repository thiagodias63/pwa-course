var shareImageButton = document.querySelector("#share-image-button")
var createPostArea = document.querySelector("#create-post")
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
)
var sharedMomentsArea = document.querySelector("#shared-moments")
var form = document.querySelector("form")
var inputTitle = document.querySelector("#title")
var inputLocation = document.querySelector("#location")
var videoPlayer = document.querySelector("#player")
var canvasPlayer = document.querySelector("#canvas")
var captureBtn = document.querySelector("#capture-btn")
var imagePicker = document.querySelector("#image-picker")
var imagePickerArea = document.querySelector("#pick-image")
var picture
var locationBtn = document.querySelector("#location-btn")
var locationLoader = document.querySelector("#location-loader")
var fetchedLocation

locationBtn.addEventListener("click", (event) => {
  if (!("geolocation" in navigator)) return
  const options = {
    timeout: 7_000,
  }
  var sawAlert = false
  locationBtn.style.display = "none"
  locationLoader.style.display = "block"

  navigator.geolocation.getCurrentPosition(
    (position) => {
      locationBtn.style.display = "inline"
      locationLoader.style.display = "none"
      fetchedLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
      inputLocation.value = "In Munich"
      inputLocation.classList.add("is-focused")
    },
    (error) => {
      if (!sawAlert) {
        sawAlert = true
        alert("Couldn't fetch location, please enter manually!")
      }
      locationBtn.style.display = "inline"
      locationLoader.style.display = "none"
      console.error(error)
      fetchedLocation = null
    },
    options
  )
})

function initializeLocation() {
  if (!("geolocation" in navigator)) {
    locationBtn.style.display = "none"
  }
}

function initializeMedia() {
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {}
  }

  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = (constraints) => {
      let getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia
      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented!"))
      }
      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject)
      })
    }
  }

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      videoPlayer.srcObject = stream
      videoPlayer.style.display = "block"
    })
    .catch((error) => {
      // user doesnt give the access
      imagePickerArea.style.display = "block"
      captureBtn.style.display = "none"
    })
}

captureBtn.addEventListener("click", (event) => {
  canvasPlayer.style.display = "block"
  videoPlayer.style.display = "none"
  captureBtn.style.display = "none"
  const context = canvasPlayer.getContext("2d")
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvas.width,
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
  )
  videoPlayer.srcObject.getVideoTracks().forEach((track) => {
    track.stop()
  })
  picture = dataURItoBlob(canvasPlayer.toDataURL())
})

imagePicker.addEventListener("change", (event) => {
  picture = event.target.files[0]
})

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  setTimeout(() => {
    createPostArea.style.transform = "translateY(0)"
  }, 1)

  // createPostArea.style.transform = "translateY(0)"
  initializeMedia()
  initializeLocation()
  console.log("deferredPrompt", deferredPrompt)
  if (deferredPrompt) {
    deferredPrompt.prompt()

    deferredPrompt.userChoice.then((choiceResult) => {
      console.log("choiceResult", choiceResult.outcome)

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation")
      } else {
        console.log("User added to home screen")
      }
    })

    deferredPrompt = null
  }
}

function closeCreatePostModal() {
  // createPostArea.style.transform = "translateY(100vh)"
  // createPostArea.style.display = 'none';
  videoPlayer.style.display = "none"
  imagePickerArea.style.display = "none"
  canvasPlayer.style.display = "none"
  locationBtn.style.display = "inline"
  locationLoader.style.display = "none"
  captureBtn.style.display = "inline"
  inputLocation.value = ""
  inputTitle.value = ""
  if (videoPlayer.srcObject) {
    video.srcObject.getVideoTracks().forEach((track) => {
      track.stop()
    })
  }

  setTimeout(() => {
    createPostArea.style.transform = "translateY(100vh)"
  }, 1)
}

function onSaveButtonClicked(event) {
  console.log("clicked")
}

shareImageButton.addEventListener("click", openCreatePostModal)

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal)

function createCard(cardData) {
  var cardWrapper = document.createElement("div")
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp"
  var cardTitle = document.createElement("div")
  cardTitle.className = "mdl-card__title"
  cardTitle.style.backgroundImage = `url("${cardData.image}")`
  cardTitle.style.backgroundSize = "cover"
  cardTitle.style.height = "180px"
  cardTitle.style.backgroundPosition = "bottom" // Or try 'center'
  cardWrapper.appendChild(cardTitle)
  var cardTitleTextElement = document.createElement("h2")
  cardTitleTextElement.className = "mdl-card__title-text"
  cardTitleTextElement.textContent = cardData.title
  cardTitle.appendChild(cardTitleTextElement)
  var cardSupportingText = document.createElement("div")
  cardSupportingText.className = "mdl-card__supporting-text"
  cardSupportingText.textContent = cardData.location
  cardSupportingText.style.textAlign = "center"
  // var cardSaveButton = document.createElement('button')
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText)
  componentHandler.upgradeElement(cardWrapper)
  sharedMomentsArea.appendChild(cardWrapper)
}

function mountCardData(data) {
  var cardData = []
  for (var key in data) {
    cardData.push(data[key])
  }
  return cardData
}

function updateUI(data) {
  data.forEach(createCard)
}

// Stategy: cache then network
var url = "https://ficha-academia-web-top.firebaseio.com/posts.json"
var networkDataReceived = false

fetch(url)
  .then(function (res) {
    return res.json()
  })
  .then(function (data) {
    networkDataReceived = true
    console.log("From web", data)
    // createCard();
    updateUI(mountCardData(data))
  })

// Substituído cache por indexDB
// if ('caches' in window) {
//   caches.match(url).then(function(response) {
//     if (response) {
//       return response.json();
//     }
//   }).then(function(data) {
//     console.log('From cache', data);
//     if (networkDataReceived) return;
//     updateUI(mountCardData(data));
//   })
// }

if ("indexDB" in window) {
  readData().then(function (data) {
    if (!networkDataReceived) {
      console.log("From IDB", data)
      updateUI(data)
    }
  })
}
function sendData() {
  const post = {
    id: new Date().toISOString(),
    title: inputTitle.value,
    location: inputLocation.value,
    // image:
    //   "https://firebasestorage.googleapis.com/v0/b/ficha-academia-web-top.appspot.com/o/sf-boat.jpg?alt=media&token=313e7833-2f83-44ac-a005-3b8ec33f26b4",
  }

  const postData = new FormData()
  postData.append("id", post.id)
  postData.append("title", post.title)
  postData.append("location", post.location)
  postData.append("file", picture, post.id + ".png")
  postData.append("rawLocation", JSON.stringify(fetchedLocation))

  fetch(url, {
    method: "post",
    // headers: {
    //   "Content-Type": "application/json",
    //   Accept: "application/json",
    // },
    // body: JSON.stringify(post),
    body: postData,
  }).then(function (response) {
    console.log("Send Data", response)
    updateUI()
  })
}

form.addEventListener("submit", function (event) {
  event.preventDefault()

  if (!inputTitle.value.trim() || !inputLocation.value.trim()) {
    alert("Please enter valid data!")
    return
  }

  closeCreatePostModal()

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then(function (sw) {
      const post = {
        id: new Date().toISOString(),
        title: inputTitle.value,
        location: inputLocation.value,
        picture,
        rawLocation: JSON.stringify(fetchedLocation),
      }
      writeData(post, "sync-posts")
        .then(function () {
          console.log("register stored in sync-post")
          return sw.sync.register("sync-new-posts")
        })
        .then(function () {
          const snackbarContainer = document.querySelector(
            "#confirmation-toast"
          )
          const data = {
            message: "Your post was saved for syncing!",
          }

          snackbarContainer.MaterialSnackbar.showSnackbar(data)
        })
        .catch(function (err) {
          console.log(err)
        })
    })
  } else {
    sendData()
  }
})
