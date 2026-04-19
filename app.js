import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:57f2b5f00f59002b32f536"
};

let db;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.log("Firebase error:", e);
}

/* ======================
   ENTRAR
====================== */
window.entrar = function () {
  document.getElementById("tutorial").style.display = "none";
  document.getElementById("app").style.display = "block";
};

/* ======================
   USUARIO AUTO
====================== */
window.guardarUsuario = function () {
  let name = document.getElementById("username").value;

  if (!name) {
    name = "Anon_" + Math.floor(Math.random() * 9999);
  }

  localStorage.setItem("user", name);
  alert("Usuario: " + name);
};

/* ======================
   PUBLICAR (MEJORADO)
====================== */
window.enviarChisme = async function () {
  const btn = document.getElementById("btnPost");
  const text = document.getElementById("inputChisme").value.trim();

  if (!text) return;

  const user = localStorage.getItem("user") || "Anon_" + Math.floor(Math.random() * 9999);

  btn.disabled = true;

  try {
    await addDoc(collection(db, "chismes"), {
      texto: text,
      user: user,
      fecha: serverTimestamp()
    });

    document.getElementById("inputChisme").value = "";

  } catch (e) {
    console.log(e);
  }

  btn.disabled = false;
};

/* ======================
   FEED EN TIEMPO REAL 🔥
====================== */
function cargarFeed() {
  const feed = document.getElementById("feed");

  const q = query(collection(db, "chismes"), orderBy("fecha", "desc"));

  onSnapshot(q, (snapshot) => {
    feed.innerHTML = "";

    snapshot.forEach(doc => {
      const d = doc.data();

      const div = document.createElement("div");
      div.classList.add("post");

      div.innerHTML = `
        <b>${d.user}</b>
        <p>${d.texto}</p>
      `;

      feed.appendChild(div);
    });
  });
}

cargarFeed();
