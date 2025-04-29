"use client"
export function getLocalStorage() {
    //set object: [{ date: Date.now(), blogs: {id: 0, name: '...', date: '...'}},...]
    //get current date and get by 
    const localStorageItem = localStorage.getItem("blogs");
    console.log(localStorageItem);
    return localStorageItem;
}

export function setLocalStorage(object : Array<{id: number, name: string, date: string}>) {
    const objectToStore = {
        date: new Date().toISOString().split('T')[0],
        array: object
    }
    console.log(objectToStore);
    localStorage.setItem("blogs", JSON.stringify(objectToStore));
}

