import { type Firestore } from "firebase/firestore"

let _instance: Firestore | null = null

export function _setFirestoreInstance(instance: Firestore) {
  _instance = instance
}

export function getDb(): Firestore {
  if (!_instance) throw new Error("Firestore accessed before Firebase plugin initialized")
  return _instance
}
