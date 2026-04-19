import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TU CONFIG (la que me pasaste)
const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:57f2b5f00f59002b32f536"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 ENVIAR CHISME
window.enviarChisme = async function () {
  const input = document.getElementById("inputChisme");
  const texto = input.value.trim();

  if (!texto) {
    alert("Escribe algo primero");
    return;
  }

  await addDoc(collection(db, "chismes"), {
    texto: texto,
    estado: "pendiente",
    fecha: new Date(),
    editado: false
  });

  input.value = "";
  alert("👀 Enviado, está en revisión");
};

// 🔥 CARGAR CHISMES APROBADOS
async function cargarChismes() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  const q = query(
    collection(db, "chismes"),
    where("estado", "==", "aprobado"),
    orderBy("fecha", "desc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.classList.add("post");

    const fecha = new Date(data.fecha.seconds * 1000);

    div.innerHTML = `
      <div class="post-header">Anónimo</div>
      <div>${data.texto}</div>
      <div class="post-time">${fecha.toLocaleString()}</div>
    `;

    feed.appendChild(div);
  });
}

// Cargar al iniciar
cargarChismes();
