import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:57f2b5f00f59002b32f536"
};

let db = null;

// 🔥 Firebase protegido (no rompe la app)
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase listo");
} catch (e) {
  console.log("Firebase falló, modo local activo", e);
}

/* =========================
   👁️ ENTRAR (SIEMPRE FUNCIONA)
========================= */
window.entrar = function () {
  document.getElementById("tutorial").style.display = "none";
  document.getElementById("app").style.display = "block";
};

/* =========================
   👤 USUARIO
========================= */
window.guardarUsuario = function () {
  const name = document.getElementById("username").value;
  localStorage.setItem("user", name || "Anónimo");
  alert("Usuario guardado");
};

/* =========================
   📤 PUBLICAR
========================= */
window.enviarChisme = async function () {
  const texto = document.getElementById("inputChisme").value.trim();
  if (!texto) return alert("Escribe algo");

  const user = localStorage.getItem("user") || "Anónimo";

  // 🔥 si Firebase no carga, no rompe
  if (!db) {
    alert("Sin conexión a base de datos");
    return;
  }

  try {
    await addDoc(collection(db, "chismes"), {
      texto,
      user,
      fecha: new Date()
    });

    document.getElementById("inputChisme").value = "";
    cargarChismes();
  } catch (e) {
    console.log(e);
    alert("Error publicando");
  }
};

/* =========================
   📥 CARGAR POSTS
========================= */
async function cargarChismes() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  if (!db) {
    feed.innerHTML = "<p>No hay conexión</p>";
    return;
  }

  try {
    const q = query(collection(db, "chismes"), orderBy("fecha", "desc"));
    const snap = await getDocs(q);

    snap.forEach(doc => {
      const data = doc.data();

      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `
        <b>${data.user || "Anónimo"}</b><br>
        ${data.texto}
      `;
      feed.appendChild(div);
    });

  } catch (e) {
    console.log(e);
  }
}

cargarChismes();
