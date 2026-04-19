import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment
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

/* ======================
   USER
====================== */
function getUser() {
  return localStorage.getItem("user");
}

function setUser(u) {
  localStorage.setItem("user", u);
}

/* ======================
   ENTRAR
====================== */
window.entrar = function () {
  document.getElementById("tutorial").style.display = "none";
  document.getElementById("app").style.display = "block";

  let user = getUser();

  if (!user) {
    user = "Anon_" + Math.floor(Math.random() * 9999);
    setUser(user);
  }

  loadTheme();
  loadPosts();
  loadStories();
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
  alert("Usuario actualizado");
};

/* ======================
   THEME
====================== */
window.toggleTheme = function () {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
}

/* ======================
   ANTI SPAM
====================== */
let lastPost = 0;

/* ======================
   POST
====================== */
window.enviarPost = async function () {
  const now = Date.now();
  if (now - lastPost < 4000) return alert("Espera un poco");

  const text = document.getElementById("inputChisme").value.trim();
  if (!text) return;

  lastPost = now;

  await addDoc(collection(db, "chismes"), {
    texto: text,
    user: getUser(),
    likes: 0,
    createdAt: serverTimestamp()
  });

  document.getElementById("inputChisme").value = "";
};

/* ======================
   FEED (10 POSTS)
====================== */
function loadPosts() {
  const feed = document.getElementById("feed");

  const q = query(collection(db, "chismes"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snap) => {
    feed.innerHTML = "";

    let count = 0;

    snap.forEach(d => {
      if (count++ >= 10) return;

      const data = d.data();
      const id = d.id;

      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <b>${data.user}</b>
        <p>${data.texto}</p>
        <button onclick="likePost('${id}')">❤️ ${data.likes || 0}</button>
      `;

      feed.appendChild(div);
    });
  });
}

/* LIKE */
window.likePost = async function (id) {
  await updateDoc(doc(db, "chismes", id), {
    likes: increment(1)
  });
};

/* ======================
   STORIES (24H)
====================== */
function loadStories() {
  const stories = document.getElementById("stories");

  const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snap) => {
    stories.innerHTML = "";

    const now = Date.now();

    snap.forEach(d => {
      const data = d.data();
      const time = data.createdAt?.seconds * 1000;

      if (now - time > 86400000) return;

      const el = document.createElement("div");
      el.className = "story";
      el.innerText = data.user;

      stories.appendChild(el);
    });
  });
}
