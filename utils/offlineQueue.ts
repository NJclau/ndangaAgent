
import { openDB } from 'idb';

const DB_NAME = 'offline-queue';
const STORE_NAME = 'lead-actions';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
  },
});

export const addToQueue = async (action: any) => {
  const db = await dbPromise;
  await db.add(STORE_NAME, action);
};

export const getQueue = async () => {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

export const clearQueue = async () => {
  const db = await dbPromise;
  await db.clear(STORE_NAME);
};
