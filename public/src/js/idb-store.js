function createObjectStore(db, storeName) {
  if (!db.objectStoreNames.contains(storeName)) {
    // create table
    db.createObjectStore(storeName, {
      keyPath: "id", // the pk
    });
  }
}

var dbPromise = idb.open("feed-post-store", 1, function (db) {
  createObjectStore(db, "posts");
  createObjectStore(db, "sync-posts");
});

function writeData(writingData, storeName = "posts") {
  return dbPromise.then((db) => {
    let transactionOperation = db.transaction(storeName, "readwrite");
    let store = transactionOperation.objectStore(storeName);
    store.put(writingData);
    return transactionOperation.complete;
  });
}

function readData(storeName = "posts") {
  return dbPromise.then((db) => {
    let transactionOperation = db.transaction(storeName, "readonly");
    let store = transactionOperation.objectStore(storeName);
    return store.getAll();
  });
}

function clearAllData(storeName = "posts") {
  return dbPromise.then((db) => {
    let transactionOperation = db.transaction(storeName, "readwrite");
    let store = transactionOperation.objectStore(storeName);
    store.clear();
    return transactionOperation.complete;
  });
}

function clearItemFromData(itemIndex, storeName = "posts") {
  return dbPromise
    .then((db) => {
      let transactionOperation = db.transaction(storeName, "readwrite");
      let store = transactionOperation.objectStore(storeName);
      store.delete(itemIndex);
      return transactionOperation.complete;
    })
    .then(function () {
      console.log(`item ${itemIndex} deleted`);
    });
}
