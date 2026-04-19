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
  return localStorage.getItem("user") || null;
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

  loadPosts();
  loadStories();
  loadTheme();
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
  alert("Usuario cambiado");
};

window.toggleTheme = function () {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
}

/* ======================
   ANTI SPAM
====================== */
let lastPostTime = 0;

/* ======================
   POST
====================== */
window.enviarPost = async function () {
  const now = Date.now();
  if (now - lastPostTime < 5000) return alert("Espera 5s");

  const text = document.getElementById("inputChisme").value.trim();
  if (!text) return;

  lastPostTime = now;

  await addDoc(collection(db, "chismes"), {
    texto: text,
    user: getUser(),
    likes: 0,
    createdAt: serverTimestamp()
  });

  document.getElementById("inputChisme").value = "";
};

/* ======================
   FEED + LIKES + COMMENTS
====================== */
function loadPosts() {
  const feed = document.getElementById("feed");

  const q = query(collection(db, "chismes"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snap) => {
    feed.innerHTML = "";

    let count = 0;

    snap.forEach(docSnap => {
      if (count++ >= 10) return;

      const d = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <b>${d.user}</b>
        <p>${d.texto}</p>

        <div class="post-actions">
          <button onclick="likePost('${id}', ${d.likes || 0})">❤️ ${d.likes || 0}</button>
          <button onclick="commentPost('${id}')">💬</button>
        </div>
      `;

      feed.appendChild(div);
    });
  });
}

/* LIKE */
window.likePost = async function (id, likes) {
  await updateDoc(doc(db, "chismes", id), {
    likes: increment(1)
  });
};

/* COMMENT (simple prompt) */
window.commentPost = function () {
  alert("Comentarios (próxima mejora: hilo real)");
};

/* ======================
   STORIES (24h)
====================== */
window.loadStories = function () {
  const stories = document.getElementById("stories");

  const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snap) => {
    stories.innerHTML = "";

    const now = Date.now();

    snap.forEach(d => {
      const data = d.data();

      const time = data.createdAt?.seconds * 1000;

      if (now - time > 86400000) return; // 24h

      const el = document.createElement("div");
      el.className = "story";
      el.innerText = data.user;

      stories.appendChild(el);
    });
  });
};
