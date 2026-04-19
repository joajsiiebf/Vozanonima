import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  doc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STATE =================
let user = null;
let userId = null;
let postsLimit = 10;

// ================= AUTO DARK =================
document.body.classList.add("dark");

// ================= AUTH =================
window.register = async function () {
  const u = userInput();
  const p = passInput();

  await addDoc(collection(db, "users"), {
    username: u,
    password: p,
    bio: "",
    reputation: 0
  });

  alert("Usuario creado");
};

window.login = async function () {
  const u = userInput();
  const p = passInput();

  const q = query(collection(db, "users"),
    where("username", "==", u),
    where("password", "==", p)
  );

  const snap = await getDocs(q);

  if (snap.empty) return alert("Incorrecto");

  snap.forEach(d => {
    user = d.data().username;
    userId = d.id;
  });

  enter();
};

function userInput() {
  return document.getElementById("user").value;
}

function passInput() {
  return document.getElementById("pass").value;
}

function enter() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  loadFeed();
}

// ================= POSTS =================
window.createPost = async function () {
  const text = document.getElementById("postText").value;

  await addDoc(collection(db, "posts"), {
    text,
    userId,
    createdAt: new Date(),
    likes: 0
  });

  document.getElementById("postText").value = "";

  loadFeed();
};

// ================= LIKE =================
window.like = async function (id) {
  await updateDoc(doc(db, "posts", id), {
    likes: increment(1)
  });

  loadFeed();
};

// ================= FEED =================
window.loadFeed = async function () {
  const feed = document.getElementById("feed");

  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(postsLimit)
  );

  const snap = await getDocs(q);

  feed.innerHTML = "";

  snap.forEach(p => {
    const d = p.data();

    feed.innerHTML += `
      <div class="post">
        <p>${d.text}</p>

        <button onclick="like('${p.id}')">
          Like (${d.likes || 0})
        </button>

        <a href="post.html?id=${p.id}">
          Ver post
        </a>
      </div>
    `;
  });

  if (snap.size === postsLimit) {
    feed.innerHTML += `
      <button onclick="more()">Show more</button>
    `;
  }
};

window.more = function () {
  postsLimit += 10;
  loadFeed();
};

// ================= PROFILE =================
window.openProfile = function () {
  alert("Perfil: @" + user);
};

// ================= SETTINGS =================
window.openSettings = function () {
  alert("Settings: idioma / tema / usuario");
};
