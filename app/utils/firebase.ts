import { type Firestore } from "firebase/firestore"

let _instance: Firestore | null = null

export function _setFirestoreInstance(instance: Firestore) {
  _instance = instance
}

// Proxy so all existing `import { db }` callers work after plugin initializes
export const db = new Proxy({} as Firestore, {
  get(_, prop) {
    if (!_instance) throw new Error("Firestore accessed before Firebase plugin initialized")
    return (_instance as any)[prop]
  },
})
