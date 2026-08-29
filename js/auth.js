// Firebase Auth – Google Sign-In med whitelist
// Kun larsmollerchristensen@gmail.com har adgang.

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut as fbSignOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const ALLOWED_EMAIL = "larsmollerchristensen@gmail.com";

let _auth = null;
let _state = { status: "unknown", user: null, rejectedEmail: null };
const _listeners = new Set();

function getAuthInstance() {
  if (_auth) return _auth;
  if (!window.firebaseApp) {
    throw new Error("Firebase-app ikke initialiseret");
  }
  _auth = getAuth(window.firebaseApp);
  return _auth;
}

function setState(next) {
  _state = { ..._state, ...next };
  _listeners.forEach(fn => {
    try { fn(_state); } catch (e) { console.error(e); }
  });
}

/**
 * Lyt på auth-state.
 * State har form: { status: "signed-in" | "signed-out" | "rejected" | "unknown",
 *                   user: FirebaseUser | null,
 *                   rejectedEmail: string | null }
 */
export function onAuthChange(fn) {
  _listeners.add(fn);
  fn(_state);
  return () => _listeners.delete(fn);
}

export function currentState() {
  return _state;
}

export async function signIn() {
  const auth = getAuthInstance();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  // Popup som primær metode – virker på både desktop og iOS uden
  // tredjeparts-cookie-problemer. Redirect som fallback hvis popup
  // blokeres (fx PWA-standalone mode eller aggressiv popup-blocker).
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.warn("Popup fejlede, prøver redirect:", err?.code);
    // Fald tilbage til redirect ved kendte popup-fejl
    const fallbackCodes = [
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
      "auth/cancelled-popup-request",
      "auth/operation-not-supported-in-this-environment"
    ];
    if (fallbackCodes.includes(err?.code)) {
      await signInWithRedirect(auth, provider);
    } else {
      throw err;
    }
  }
}

export async function signOutUser() {
  const auth = getAuthInstance();
  await fbSignOut(auth);
  setState({ status: "signed-out", user: null, rejectedEmail: null });
}

/**
 * Initialiser auth-lytning. Returnerer promise der resolver
 * når den første auth-state er kendt.
 */
export async function initAuth() {
  const auth = getAuthInstance();

  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) {
    console.warn("Kunne ikke sætte auth-persistence:", e);
  }

  try {
    await getRedirectResult(auth);
  } catch (err) {
    console.error("Redirect-result fejl:", err);
    setState({
      status: "signed-out",
      user: null,
      rejectedEmail: null,
      lastError: err?.message || String(err)
    });
  }

  return new Promise(resolve => {
    let firstResolved = false;
    onAuthStateChanged(auth, async user => {
      if (user && user.email && user.email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
        const rejected = user.email;
        console.warn("Uautoriseret email:", rejected);
        try { await fbSignOut(auth); } catch (e) { /* noop */ }
        setState({ status: "rejected", user: null, rejectedEmail: rejected });
      } else if (user) {
        setState({ status: "signed-in", user, rejectedEmail: null });
      } else {
        setState({ status: "signed-out", user: null, rejectedEmail: null });
      }
      if (!firstResolved) {
        firstResolved = true;
        resolve(_state);
      }
    });
  });
}

export const ALLOWED_EMAIL_STR = ALLOWED_EMAIL;
