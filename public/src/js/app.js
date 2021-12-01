if ('serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('/sw.js')
    .then(() => console.log('sw registered'))
    .catch((error) => console.log('sw error ' + error));
}