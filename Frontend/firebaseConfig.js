//import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyCz1krYTXRP5Td0jfFSelt5eASqT-s8SD0',
  authDomain: 'in-fit-945de.firebaseapp.com',
  projectId: 'in-fit-945de',
  storageBucket: 'in-fit-945de.firebasestorage.app',
  messagingSenderId: '3752609566',
  appId: '1:3752609566:android:500c40210cf609477b6b0f',
};

// Inicialización segura (evita reinicializar si ya existe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Instancia de Firestore compartida para toda la app
export const db = getFirestore(app);
