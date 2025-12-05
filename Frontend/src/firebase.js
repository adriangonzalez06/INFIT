// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// ----- Configuración de Firebase ----- //
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

// Configura persistencia de sesión (guarda sesión tras cerrar/abrir app)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Error configurando persistencia", err);
});

// Proveedor de Google
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function loginWithGoogle() {
  try {
    const res = await signInWithPopup(auth, provider);
    return res.user;
  } catch (err) {
    console.warn("signInWithPopup falló, intentando redirect...", err);
    await signInWithRedirect(auth, provider);
    /* Con redirect, el control vuelve tras redirigir; podemos gestionar el resultado
    en el listener onAuthStateChanged pero por ahora no lo hacemos aquí. */
    return null;
  }
}

// Logout
export async function logout() {
  return signOut(auth);
}

// Listener de cambios de estado de autenticación
export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Obtener ID token del usuario actual
export async function getIdToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken(forceRefresh);
  }
  return null;
}
