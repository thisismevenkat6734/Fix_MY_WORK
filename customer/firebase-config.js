import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
    getFunctions
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";


/* ============================================================
   FIX MY WORK — FIREBASE CONFIGURATION
   ============================================================ */

const firebaseConfig = {
    apiKey: "AIzaSyCP8DGLQMXPUsv_p2zQ-NLkziwPQe1XkgU",
    authDomain: "fixmywork-d83ba.firebaseapp.com",
    databaseURL: "https://fixmywork-d83ba-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fixmywork-d83ba",
    storageBucket: "fixmywork-d83ba.firebasestorage.app",
    messagingSenderId: "207313302232",
    appId: "1:207313302232:web:73055348982ad84abeddad",
    measurementId: "G-11FQMLCBQY"
};


/* ============================================================
   INITIALIZE FIREBASE
   ============================================================ */

const app = initializeApp(firebaseConfig);


/* ============================================================
   FIREBASE SERVICES
   ============================================================ */

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

const functions = getFunctions(
    app,
    "asia-south1"
);


/* ============================================================
   EXPORT
   ============================================================ */

export {
    app,
    auth,
    db,
    storage,
    functions
};
