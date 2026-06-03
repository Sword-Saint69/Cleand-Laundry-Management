import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBWUHJtVs7avfffR4KEL0jT6GSuTnZoexo",
  authDomain: "cleand-laundry.firebaseapp.com",
  projectId: "cleand-laundry",
  storageBucket: "cleand-laundry.firebasestorage.app",
  messagingSenderId: "225653403338",
  appId: "1:225653403338:web:229d62ec2724d603828e33",
  measurementId: "G-64B2912GRM"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Export Firestore reference
export const db = getFirestore(app)
