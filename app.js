// ================= FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:1ec05c7842f09a9e32f536"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STATE =================
let currentUser = null;

// ================= CREATE USER (FIX FLUJO) =================
window.createUser = function () {
  const u = document.getElementById("username").value.trim();

  if (!u) return alert("Escribe un usuario");
  if (u.length < 3) return alert("Muy corto");

  currentUser = u;

  localStorage.setItem("user", u);

  enterApp();
};

// ================= ENTER APP =================
function enterApp() {
  if (!currentUser) return;

  document.getElementById("setup").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + currentUser;

  loadPosts();
}

// AUTO LOGIN FIX
const saved = localStorage.getItem("user");
if (saved) {
  currentUser = saved;
  setTimeout(enterApp, 0);
}

// ================= LOGOUT =================
window.logout = function () {
  localStorage.removeItem("user");
  location.reload();
};

// ================= POST =================
window.createPost = async function () {
  const text = document.getElementById("postText").value.trim();
  if (!text) return;

  await addDoc(collection(db, "posts"), {
    text,
    user: currentUser,
    likes: 0,
    createdAt: new Date()
  });

  document.getElementById("postText").value = "";
};

// ================= LIKE =================
window.like = async function (id) {
  const ref = doc(db, "posts", id);
  await updateDoc(ref, {
    likes: increment(1)
  });
};

// ================= POSTS =================
function loadPosts() {
  const feed = document.getElementById("feed");

  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snap) => {
    feed.innerHTML = "";

    snap.forEach(post => {
      const p = post.data();

      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <b>@${p.user}</b>
        <p>${p.text}</p>

        <button onclick="like('${post.id}')">❤️ ${p.likes || 0}</button>

        <div id="comments-${post.id}"></div>

        <input id="c-${post.id}" placeholder="Comentar...">
        <button onclick="comment('${post.id}')">Enviar</button>
      `;

      feed.appendChild(div);

      loadComments(post.id);
    });
  });
}

// ================= COMMENTS =================
window.comment = async function (postId) {
  const input = document.getElementById("c-" + postId);
  const text = input.value.trim();

  if (!text) return;

  await addDoc(collection(db, "comments"), {
    postId,
    text,
    user: currentUser,
    createdAt: new Date()
  });

  input.value = "";
};

// ================= LOAD COMMENTS =================
function loadComments(postId) {
  const box = document.getElementById("comments-" + postId);

  const q = query(collection(db, "comments"), orderBy("createdAt", "asc"));

  onSnapshot(q, (snap) => {
    box.innerHTML = "";

    snap.forEach(c => {
      const d = c.data();

      if (d.postId === postId) {
        const div = document.createElement("div");
        div.className = "comment";
        div.innerHTML = `<b>@${d.user}</b>: ${d.text}`;
        box.appendChild(div);
      }
    });
  });
}
