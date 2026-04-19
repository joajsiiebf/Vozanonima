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

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:57f2b5f00f59002b32f536"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ENVIAR
window.enviarChisme = async function () {
  const input = document.getElementById("inputChisme");
  const texto = input.value.trim();

  if (!texto) return alert("Escribe algo");

  await addDoc(collection(db, "chismes"), {
    texto,
    estado: "pendiente",
    fecha: new Date()
  });

  input.value = "";
  alert("👀 Enviado para revisión");
};

// CARGAR
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
    const fecha = new Date(data.fecha.seconds * 1000);

    const div = document.createElement("div");
    div.classList.add("post");

    div.innerHTML = `
      <div class="post-header">Anónimo</div>
      <div>${data.texto}</div>
      <div class="post-time">${fecha.toLocaleString()}</div>

      <div class="post-actions">
        <span onclick="likePost(this)">👍 Me interesa</span>
        <span onclick="alert('Próximamente')">💬 Comentar</span>
        <span onclick="compartir('${data.texto}')">🔁 Compartir</span>
        <span onclick="alert('Reportado')">🚩</span>
      </div>
    `;

    feed.appendChild(div);
  });
}

// FUNCIONES BOTONES
window.likePost = function(el) {
  el.innerText = "👍 Te interesa";
};

window.compartir = function(texto) {
  navigator.clipboard.writeText(texto);
  alert("Copiado 🔥");
};

// INIT
cargarChismes();
