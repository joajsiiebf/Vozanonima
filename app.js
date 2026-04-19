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
   POST
====================== */
window.crearPost = async function () {
  const text = document.getElementById("inputPost").value.trim();
  if (!text) return;

  await addDoc(collection(db, "posts"), {
    text,
    user: user(),
    likes: 0
  });

  document.getElementById("inputPost").value = "";
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
   COMMENT
====================== */
window.comentar = async function (postId) {
  const input = document.getElementById("c-" + postId);
  const text = input.value.trim();
  if (!text || !user()) return;

  await addDoc(collection(db, "comments"), {
    postId,
    text,
    user: user()
  });

  input.value = "";
};

/* ======================
   LOAD COMMENTS
====================== */
async function loadComments(postId, container) {
  const snap = await getDocs(collection(db, "comments"));

  container.innerHTML = "";

  snap.forEach(d => {
    const c = d.data();

    if (c.postId === postId) {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `<b>${c.user}</b>: ${c.text}`;
      container.appendChild(div);
    }
  });
}

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

        <div class="actions">
          <button onclick="like('${d.id}')">❤️ ${data.likes || 0}</button>
        </div>

        <div class="comments" id="comments-${d.id}"></div>

        ${
          user()
            ? `<div class="comment-box">
                <input id="c-${d.id}" placeholder="Comentar...">
                <button onclick="comentar('${d.id}')">Enviar</button>
              </div>`
            : ""
        }
      `;

      feed.appendChild(div);

      setTimeout(() => {
        loadComments(d.id, document.getElementById("comments-" + d.id));
      }, 300);
    });
  });
}
