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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ENTRAR
window.entrar = function() {
  document.getElementById("tutorial").style.display = "none";
  document.getElementById("app").style.display = "block";
};

// USUARIO
window.guardarUsuario = function() {
  const name = document.getElementById("username").value;
  localStorage.setItem("user", name || "Anónimo");
  alert("Guardado");
};

// PUBLICAR
window.enviarChisme = async function() {
  const texto = document.getElementById("inputChisme").value.trim();
  if (!texto) return alert("Escribe algo");

  const user = localStorage.getItem("user") || "Anónimo";

  await addDoc(collection(db, "chismes"), {
    texto,
    user,
    fecha: new Date()
  });

  document.getElementById("inputChisme").value = "";
  cargarChismes();
};

// CARGAR
async function cargarChismes() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

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
}

// INIT
cargarChismes();
