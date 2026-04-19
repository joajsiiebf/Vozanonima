import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  getDocs
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
   ENTRAR
====================== */
window.entrar = function () {
  document.getElementById("tutorial").style.display = "none";
  document.getElementById("app").style.display = "block";

  if (!user()) setUser("Anon_" + Math.floor(Math.random() * 9999));

  loadPosts();
  loadTheme();
};

/* ======================
   CONFIG
====================== */
window.toggleConfig = function () {
  const c = document.getElementById("config");
  c.style.display = c.style.display === "block" ? "none" : "block";
};

window.saveUser = function () {
  const u = document.getElementById("userInput").value;
  if (!u) return;
  setUser(u);
};

/* ======================
   THEME
====================== */
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
   POSTS
====================== */
window.createPost = async function () {
  const text = document.getElementById("text").value.trim();
  if (!text) return;

  await addDoc(collection(db, "posts"), {
    text,
    user: user(),
    likes: 0
  });

  document.getElementById("text").value = "";
};

/* ======================
   LIKE
====================== */
window.like = async function (id) {
  await updateDoc(doc(db, "posts", id), {
    likes: increment(1)
  });
};

/* ======================
   LOAD POSTS (ESTABLE)
====================== */
function loadPosts() {
  const feed = document.getElementById("feed");

  onSnapshot(collection(db, "posts"), (snap) => {
    feed.innerHTML = "";

    snap.forEach(d => {
      const p = d.data();

      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <b>${p.user}</b>
        <p>${p.text}</p>
        <button onclick="like('${d.id}')">❤️ ${p.likes || 0}</button>
      `;

      feed.appendChild(div);
    });
  });
}
