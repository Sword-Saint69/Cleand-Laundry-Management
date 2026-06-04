import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { _setFirestoreInstance } from "~/utils/firebase"

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseApp = getApps().length === 0
    ? initializeApp({
        apiKey: config.public.firebaseApiKey as string,
        authDomain: config.public.firebaseAuthDomain as string,
        projectId: config.public.firebaseProjectId as string,
        storageBucket: config.public.firebaseStorageBucket as string,
        messagingSenderId: config.public.firebaseMessagingSenderId as string,
        appId: config.public.firebaseAppId as string,
        measurementId: config.public.firebaseMeasurementId as string,
      })
    : getApps()[0]

  _setFirestoreInstance(getFirestore(firebaseApp))
})
