
var dbPromise = idb.open('feed-post-store', 1, function(db) {
    if (!db.objectStoreNames.contains('posts'));
    // create table
    db.createObjectStore('posts', {
        keyPath: 'id' // the pk
    });
});

function writeData(writingData) {
    return dbPromise.then((db) => {
        let transactionOperation = db.transaction('posts', 'readwrite');
        let store = transactionOperation.objectStore('posts');
        store.put(writingData);
        return transactionOperation.complete;
    });
}

function readData() {
    return dbPromise.then((db) => {
        let transactionOperation = db.transaction('posts', 'readonly');
        let store = transactionOperation.objectStore('posts');
        return store.getAll();
    })
}

function clearAllData() {
    return dbPromise.then((db) => {
        let transactionOperation = db.transaction('posts', 'readwrite');
        let store = transactionOperation.objectStore('posts');
        store.clear();
        return transactionOperation.complete;
    })
}

function clearItemFromData(itemIndex) {
    return dbPromise.then((db) => {
        let transactionOperation = db.transaction('posts', 'readwrite');
        let store = transactionOperation.objectStore('posts');
        store.delete(itemIndex);
        return transactionOperation.complete;
    }).then(function() {
        console.log(`item ${itemIndex} deleted`);
    })
}git