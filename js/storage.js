// Storage-lag: Firestore hvis konfigureret, ellers localStorage.
// Firebase importeres dynamisk – hvis config mangler, indlæses SDK'et slet ikke.

let db = null;
let useFirebase = false;
let firebaseApi = null;

async function tryInitFirebase() {
  if (typeof firebaseConfig === "undefined" ||
      !firebaseConfig.apiKey ||
      firebaseConfig.apiKey === "DIN_API_KEY") {
    console.log("ℹ Firebase ikke konfigureret – bruger localStorage");
    return false;
  }
  try {
    const appMod = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js");
    const fsMod  = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");
    const app = appMod.initializeApp(firebaseConfig);
    db = fsMod.getFirestore(app);
    firebaseApi = fsMod;
    useFirebase = true;
    console.log("✓ Firestore aktiv");
    return true;
  } catch (e) {
    console.warn("Firebase init fejlede – falder tilbage til localStorage", e);
    return false;
  }
}

// Kald init straks; app.js venter på loadCompletions() før første render,
// og loadCompletions await'er ready.
const readyPromise = tryInitFirebase();

const LS_KEY = "agf-runner-completions";
function lsLoad() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}
function lsSave(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }

export async function loadCompletions() {
  await readyPromise;
  if (useFirebase) {
    const { collection, query, orderBy, getDocs } = firebaseApi;
    const q = query(
      collection(db, "users", USER_ID, "completions"),
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  const list = lsLoad();
  list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return list;
}

export async function saveCompletion(entry) {
  await readyPromise;
  if (useFirebase) {
    const { doc, setDoc } = firebaseApi;
    const ref = doc(db, "users", USER_ID, "completions", entry.id);
    await setDoc(ref, entry);
    return entry;
  }
  const list = lsLoad();
  const idx = list.findIndex(x => x.id === entry.id);
  if (idx >= 0) list[idx] = entry; else list.push(entry);
  lsSave(list);
  return entry;
}

export async function deleteCompletion(id) {
  await readyPromise;
  if (useFirebase) {
    const { doc, deleteDoc } = firebaseApi;
    await deleteDoc(doc(db, "users", USER_ID, "completions", id));
    return;
  }
  const list = lsLoad().filter(x => x.id !== id);
  lsSave(list);
}

export function isFirebaseActive() {
  return useFirebase;
}

export async function waitReady() {
  await readyPromise;
}
