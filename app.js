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
  orderBy,
  getDocs,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:1ec05c7842f09a9e32f536"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STATE =================
let currentUser = null;

// ================= USER =================
window.createUser = async function () {
  const u = document.getElementById("username").value.trim();
  if (!u) return;

  const exists = await getDocs(query(collection(db, "users"), where("username", "==", u)));

  if (!exists.empty) return alert("Usuario en uso");

  await addDoc(collection(db, "users"), { username: u });

  currentUser = u;
  localStorage.setItem("user", u);

  enterApp();
};

function enterApp() {
  document.getElementById("setup").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("me").innerText = "@" + currentUser;

  loadFeed();
}

// auto login
if (localStorage.getItem("user")) {
  currentUser = localStorage.getItem("user");
  setTimeout(enterApp, 0);
}

// ================= POST =================
window.createPost = async function () {
  const text = document.getElementById("postText").value;

  await addDoc(collection(db, "posts"), {
    text,
    user: currentUser,
    likes: 0,
    createdAt: new Date()
  });

  document.getElementById("postText").value = "";
};

// ================= LIKE (1 POR USER) =================
window.like = async function (postId) {

  const likeCheck = await getDocs(
    query(collection(db, "likes"),
    where("postId", "==", postId),
    where("user", "==", currentUser))
  );

  if (!likeCheck.empty) return;

  await addDoc(collection(db, "likes"), {
    postId,
    user: currentUser
  });

  const ref = doc(db, "posts", postId);
  await updateDoc(ref, {
    likes: increment(1)
  });
};

// ================= FOLLOW =================
window.follow = async function (user) {
  await addDoc(collection(db, "follows"), {
    from: currentUser,
    to: user
  });
};

// ================= PROFILE =================
window.openProfile = async function (user) {
  document.getElementById("profileModal").style.display = "block";
  document.getElementById("profileName").innerText = "@" + user;

  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  const snap = await getDocs(q);

  const box = document.getElementById("profilePosts");
  box.innerHTML = "";

  snap.forEach(p => {
    if (p.data().user === user) {
      const div = document.createElement("div");
      div.innerHTML = `<p>${p.data().text}</p>`;
      box.appendChild(div);
    }
  });
};

window.closeProfile = function () {
  document.getElementById("profileModal").style.display = "none";
};

// ================= FEED =================
function loadFeed() {
  const feed = document.getElementById("feed");

  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  onSnapshot(q, snap => {
    feed.innerHTML = "";

    snap.forEach(post => {
      const p = post.data();

      const div = document.createElement("div");

      div.innerHTML = `
        <b onclick="openProfile('${p.user}')">@${p.user}</b>
        <button onclick="follow('${p.user}')">Seguir</button>

        <p>${p.text}</p>

        <button onclick="like('${post.id}')">❤️ ${p.likes || 0}</button>

        <div id="c-${post.id}"></div>

        <input id="i-${post.id}" placeholder="Comentario">
        <button onclick="comment('${post.id}')">Enviar</button>
      `;

      feed.appendChild(div);

      loadComments(post.id);
    });
  });
}

// ================= COMMENTS =================
window.comment = async function (postId) {
  const input = document.getElementById("i-" + postId);

  await addDoc(collection(db, "comments"), {
    postId,
    text: input.value,
    user: currentUser
  });

  input.value = "";
};

// ================= COMMENTS LOAD =================
function loadComments(postId) {
  const box = document.getElementById("c-" + postId);

  onSnapshot(collection(db, "comments"), snap => {
    box.innerHTML = "";

    snap.forEach(c => {
      const d = c.data();
      if (d.postId === postId) {
        const div = document.createElement("div");
        div.innerHTML = `<small>@${d.user}: ${d.text}</small>`;
        box.appendChild(div);
      }
    });
  });
}

// ================= LOGOUT =================
window.logout = function () {
  localStorage.removeItem("user");
  location.reload();
};
