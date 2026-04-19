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
let user = null;
let userId = null;
let lang = "es";
let postsLimit = 10;

// ================= REGISTER =================
window.register = async function () {
  const username = document.getElementById("user").value;
  const phone = document.getElementById("phone").value;
  const pass = document.getElementById("pass").value;

  if (!username || !phone || !pass) return;

  await addDoc(collection(db, "users"), {
    username,
    phone,
    password: pass,
    bio: "",
    reputation: 0
  });

  alert("Cuenta creada");
};

// ================= LOGIN =================
window.login = async function () {
  const username = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  const q = query(
    collection(db, "users"),
    where("username", "==", username),
    where("password", "==", pass)
  );

  const snap = await getDocs(q);

  if (snap.empty) return alert("Datos incorrectos");

  snap.forEach(u => {
    user = u.data().username;
    userId = u.id;
  });

  enterApp();
};

// ================= ENTER APP =================
function enterApp() {
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
          Ver publicación
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

// ================= SHOW MORE =================
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
  document.getElementById("settings").style.display = "block";
};

window.toggleTheme = function () {
  document.body.classList.toggle("dark");
};

window.toggleLang = function () {
  lang = lang === "es" ? "en" : "es";
  alert(lang);
};

window.logout = function () {
  localStorage.clear();
  location.reload();
};
