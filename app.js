import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* FIREBASE */
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

/* ======================
   USER
====================== */
function user() {
  return localStorage.getItem("user");
}

function setUser(u) {
  localStorage.setItem("user", u);
}

/* ======================
   CONFIG OPTIONS
====================== */
let commentsEnabled = true;

/* ======================
   ENTRAR
====================== */
window.entrar = function () {
  document.getElementById("tutorial").style.display = "none";
  document.getElementById("app").style.display = "block";

  if (!user()) {
    setUser("Anon_" + Math.floor(Math.random() * 9999));
  }

  loadTheme();
  loadPosts();
};

/* ======================
   CONFIG
====================== */
window.toggleConfig = function () {
  const c = document.getElementById("config");
  c.style.display = c.style.display === "block" ? "none" : "block";
};

window.cambiarUsuario = function () {
  const u = document.getElementById("configUser").value;
  if (!u) return;
  setUser(u);
};

window.toggleTheme = function () {
  document.body.classList.toggle("dark");
};

window.toggleComments = function () {
  commentsEnabled = !commentsEnabled;
  alert("Comentarios: " + (commentsEnabled ? "ON" : "OFF"));
};

/* ======================
   POST
====================== */
window.crearPost = async function () {
  const text = document.getElementById("inputPost").value;
  if (!text) return;

  await addDoc(collection(db, "posts"), {
    text,
    user: user(),
    reactions: {
      like: 0,
      love: 0,
      wow: 0,
      angry: 0
    }
  });

  document.getElementById("inputPost").value = "";
};

/* ======================
   REACCIONES (1 POR USUARIO SIMULADO)
====================== */
window.react = async function (id, type) {
  await updateDoc(doc(db, "posts", id), {
    [`reactions.${type}`]: increment(1)
  });
};

/* ======================
   POSTS
====================== */
function loadPosts() {
  const feed = document.getElementById("feed");

  const q = query(collection(db, "posts"), orderBy("text"));

  onSnapshot(q, (snap) => {
    feed.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();

      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <b>${data.user}</b>
        <p>${data.text}</p>

        <div class="reactions">
          <button onclick="react('${d.id}','like')">👍 ${data.reactions?.like || 0}</button>
          <button onclick="react('${d.id}','love')">❤️ ${data.reactions?.love || 0}</button>
          <button onclick="react('${d.id}','wow')">😮 ${data.reactions?.wow || 0}</button>
          <button onclick="react('${d.id}','angry')">😡 ${data.reactions?.angry || 0}</button>
        </div>

        ${
          commentsEnabled && user()
            ? `<button onclick="alert('comentarios en siguiente upgrade')">💬 Comentar</button>`
            : ""
        }
      `;

      feed.appendChild(div);
    });
  });
}

/* ======================
   THEME LOAD
====================== */
function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
}
