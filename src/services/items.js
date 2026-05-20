import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const getItemsCollection = (userId) => collection(db, "users", userId, "items");

export const subscribeToItems = (userId, onNext, onError) => {
  if (!db) {
    onError?.(new Error("Firebase no está configurado."));
    return () => {};
  }

  const itemsQuery = query(getItemsCollection(userId), orderBy("updatedAt", "desc"));

  return onSnapshot(
    itemsQuery,
    (snapshot) => {
      const items = snapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data(),
      }));

      onNext(items);
    },
    (error) => {
      onError?.(error);
    },
  );
};

export const createItem = async (userId, payload) => {
  const itemsCollection = getItemsCollection(userId);

  return addDoc(itemsCollection, {
    title: payload.title,
    description: payload.description,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateItem = async (userId, itemId, payload) => {
  const itemRef = doc(db, "users", userId, "items", itemId);

  return updateDoc(itemRef, {
    title: payload.title,
    description: payload.description,
    updatedAt: serverTimestamp(),
  });
};

export const removeItem = async (userId, itemId) => {
  const itemRef = doc(db, "users", userId, "items", itemId);

  return deleteDoc(itemRef);
};