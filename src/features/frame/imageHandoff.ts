const DB_NAME = 'itar';
const DB_VERSION = 1;
const STORE_NAME = 'handoff';
const RECORD_KEY = 'pending-image';

type HandoffRecord = {
  blob: Blob;
  name: string;
  type: string;
};

function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }

    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

export async function stashImage(file: File): Promise<boolean> {
  const db = await openDatabase();
  if (!db) {
    return false;
  }

  const record: HandoffRecord = { blob: file, name: file.name, type: file.type };

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(record, RECORD_KEY);
      transaction.oncomplete = () => {
        db.close();
        resolve(true);
      };
      transaction.onerror = () => {
        db.close();
        resolve(false);
      };
      transaction.onabort = () => {
        db.close();
        resolve(false);
      };
    } catch {
      db.close();
      resolve(false);
    }
  });
}

export async function takeStashedImage(): Promise<File | null> {
  const db = await openDatabase();
  if (!db) {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(RECORD_KEY);

      request.onsuccess = () => {
        const record = request.result as HandoffRecord | undefined;
        store.delete(RECORD_KEY);
        if (record == null) {
          resolve(null);
          return;
        }
        resolve(new File([record.blob], record.name, { type: record.type }));
      };
      request.onerror = () => resolve(null);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        resolve(null);
      };
    } catch {
      db.close();
      resolve(null);
    }
  });
}
