export function promisify<T = undefined> (request:IDBRequest<T>|IDBTransaction) {
    return new Promise<T>((resolve, reject) => {
        // @ts-ignore
        request.oncomplete = request.onsuccess = () => resolve(request.result);
        // @ts-ignore
        request.onabort = request.onerror = () => reject(request.error);
    });
}