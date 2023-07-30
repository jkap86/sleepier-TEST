


export const openDB = async (item, fetch, setState) => {
    const request = window.indexedDB.open(item, 1);

    request.onupgradeneeded = (event) => {
        console.log('upgradeneeded')
        const db = event.target.result;

        // Create the object store if it doesn't exist
        if (!db.objectStoreNames.contains(item)) {
            db.createObjectStore(item, { keyPath: 'timestamp', autoIncrement: false });
        }
    };

    request.onsuccess = (event) => {
        const db = event.target.result;

        try {
            const transaction = db.transaction([item], 'readonly');
            const objectStore = transaction.objectStore(item);
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = (event) => {
                if (!(event.target.result[0]?.timestamp > new Date().getTime())) {
                    console.log('fetching ' + item)
                    fetch()
                } else {
                    setState(event.target.result[0].data);
                }
            };

            getAllRequest.onerror = (event) => {
                console.log('Error reading data from IndexedDB: ', event.target.error);
            };
        } catch (error) {
            console.log('fetching ' + item)
            fetch()
            console.log(error.message)
        }
    };

    request.onerror = (event) => {
        console.log('Error opening database: ', event.target.errorCode);
    };
};

export const saveToDB = async (item, data) => {
    const request = window.indexedDB.open(item, 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create the object store if it doesn't exist
        if (!db.objectStoreNames.contains(item)) {
            db.createObjectStore(item, { keyPath: 'timestamp', autoIncrement: false });
        }
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([item], 'readwrite');
        const objectStore = transaction.objectStore(item);

        // Check if the data is an array and store it as individual records

        objectStore.clear();
        // If the data is a single object, add it as a single record
        objectStore.put(data);


        transaction.oncomplete = () => {
            console.log(item + ' saved to IndexedDB successfully.');
        };

        transaction.onerror = (event) => {
            console.log('Error saving data to IndexedDB: ', event.target.error);
        };
    };

    request.onerror = (event) => {
        console.log('Error opening database: ', event.target.errorCode);
    };
};
