var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  console.log('deferredPrompt', deferredPrompt)
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      console.log('choiceResult', choiceResult.outcome)

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

function onSaveButtonClicked(event) {
  console.log('clicked')
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function createCard(cardData) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url("${cardData.image}")`;
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = cardData.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = cardData.location;
  cardSupportingText.style.textAlign = 'center';
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
  data.forEach(createCard)
}

// Stategy: cache then network
var url = 'https://ficha-academia-web-top.firebaseio.com/posts.json';
var networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data);
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


if ('indexDB' in window) {
  readData().then(function(data) {
    if (!networkDataReceived) {
      console.log('From IDB', data);
      updateUI(data);
    }
  })
}