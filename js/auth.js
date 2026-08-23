// Firebase Auth – Google Sign-In med whitelist
// Kun larsmollerchristensen@gmail.com har adgang.

import {
  getAuth,
  GoogleAuthProvider,
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

  // Brug altid redirect – popup rammer Cross-Origin-Opener-Policy
  // problemer på både desktop og mobil.
  try {
    await signInWithRedirect(auth, provider);
  } catch (err) {
    console.error("Sign-in failed:", err);
    throw err;
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
  console.log("[auth] initAuth() start");

  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log("[auth] persistence sat");
  } catch (e) {
    console.warn("[auth] kunne ikke sætte persistence:", e);
  }

  // Håndter redirect-resultat FØR vi sætter onAuthStateChanged-lytteren,
  // så vi ikke først fejlagtigt viser login-siden fordi user endnu er null.
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("[auth] getRedirectResult: bruger fundet:", result.user?.email);
    } else {
      console.log("[auth] getRedirectResult: ingen ventende redirect");
    }
  } catch (err) {
    console.error("[auth] getRedirectResult fejlede:", err);
    // Vis fejl i UI så den ikke bare forsvinder
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
      console.log("[auth] onAuthStateChanged:", user?.email || "(null)");
      if (user && user.email && user.email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
        const rejected = user.email;
        console.warn("[auth] uautoriseret email:", rejected);
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
