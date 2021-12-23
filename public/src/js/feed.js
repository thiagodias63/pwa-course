var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var inputTitle = document.querySelector("#title");
var inputLocation = document.querySelector("#location");

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(() => {
  createPostArea.style.transform = "translateY(0)";
  // }, 1);
  console.log("deferredPrompt", deferredPrompt);
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      console.log("choiceResult", choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.transform = "translateY(100vh)";
  // createPostArea.style.display = 'none';
}

function onSaveButtonClicked(event) {
  console.log("clicked");
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function createCard(cardData) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url("${cardData.image}")`;
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardTitle.style.backgroundPosition = "bottom"; // Or try 'center'
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = cardData.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = cardData.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement('button')
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function mountCardData(data) {
  var cardData = [];
  for (var key in data) {
    cardData.push(data[key]);
  }
  return cardData;
}

function updateUI(data) {
  data.forEach(createCard);
}

// Stategy: cache then network
var url = "https://ficha-academia-web-top.firebaseio.com/posts.json";
var networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log("From web", data);
    // createCard();
    updateUI(mountCardData(data));
  });

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
      console.log("From IDB", data);
      updateUI(data);
    }
  });
}
function sendData() {
  const post = {
    id: new Date().toISOString(),
    title: inputTitle.value,
    location: inputLocation.value,
    image:
      "https://firebasestorage.googleapis.com/v0/b/ficha-academia-web-top.appspot.com/o/sf-boat.jpg?alt=media&token=313e7833-2f83-44ac-a005-3b8ec33f26b4",
  };
  // talvez colocar essa função como async function para pegar o id corretamente
  fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(post),
  }).then(function (response) {
    console.log("Send Data", response);
    updateUI();
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!inputTitle.value.trim() || !inputLocation.value.trim()) {
    alert("Please enter valid data!");
    return;
  }

  closeCreatePostModal();

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then(function (serviceWorker) {
      const post = {
        id: new Date().toISOString(),
        title: inputTitle.value,
        location: inputLocation.value,
      };
      writeData("sync-posts", post)
        .then(function () {
          return serviceWorker.sync.register("sync-new-posts");
        })
        .then(function () {
          const snackbarContainer =
            document.querySelector("#confimation-toast");
          const data = {
            message: "Your post was saved for syncing!",
          };
          snackbarContainer.MaterialSnackbar.showNackbar(data);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  } else {
    sendData();
  }
});
