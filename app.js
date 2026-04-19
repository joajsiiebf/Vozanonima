import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STATE =================
let user = localStorage.getItem("user");
let userId = localStorage.getItem("userId");

const OWNER = "jscol_owner";

// ================= SESSION =================
function saveSession() {
  localStorage.setItem("user", user);
  localStorage.setItem("userId", userId);
}

// ================= AUTO LOGIN =================
window.onload = function () {
  if (user && userId) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";

    document.getElementById("me").innerText = "@" + user;
    showView("home");
  }
};

// ================= NAV =================
window.showView = function (view) {

  hideAll();

  if (view === "home") {
    document.getElementById("feedView").style.display = "block";
    loadFeed();
  }

  if (view === "search") {
    document.getElementById("searchView").style.display = "block";
  }

  if (view === "profile") {
    openProfile(userId, user);
  }

  if (view === "settings") {
    document.getElementById("settingsView").style.display = "block";
  }
};

function hideAll() {
  document.getElementById("feedView").style.display = "none";
  document.getElementById("searchView").style.display = "none";
  document.getElementById("profileView").style.display = "none";
  document.getElementById("settingsView").style.display = "none";
}

// ================= REGISTER =================
window.register = async function () {

  const username = document.getElementById("user").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const pass = document.getElementById("pass").value;

  await addDoc(collection(db, "users"), {
    username,
    phone,
    password: pass,
    followers: username === OWNER ? 110000 : 0,
    following: 0
  });

  alert("Cuenta creada");
};

// ================= LOGIN =================
window.login = async function () {

  const phone = document.getElementById("phone").value;
  const pass = document.getElementById("pass").value;

  const q = query(
    collection(db, "users"),
    where("phone", "==", phone),
    where("password", "==", pass)
  );

  const snap = await getDocs(q);

  if (snap.empty) return alert("Error login");

  snap.forEach(u => {
    user = u.data().username;
    userId = u.id;
  });

  saveSession();

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  showView("home");
};

// ================= POSTS =================
window.createPost = async function () {

  const text = document.getElementById("postText").value;
  if (!text) return;

  await addDoc(collection(db, "posts"), {
    text,
    userId,
    username: user,
    createdAt: new Date()
  });

  document.getElementById("postText").value = "";
  loadFeed();
};

// ================= FEED =================
window.loadFeed = async function () {

  const feed = document.getElementById("feed");

  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  const snap = await getDocs(q);

  feed.innerHTML = "";

  snap.forEach(p => {
    const d = p.data();

    feed.innerHTML += `
      <div class="post">
        <div onclick="openProfile('${d.userId}','${d.username}')"
             class="username">
          @${d.username}
        </div>
        <p>${d.text}</p>
      </div>
    `;
  });
};

// ================= PROFILE =================
window.openProfile = async function (uid, username) {

  hideAll();

  const q = query(collection(db, "posts"), where("userId", "==", uid));
  const snap = await getDocs(q);

  const isMe = uid === userId;

  let followers = username === OWNER ? 110000 : 0;

  let html = `
    <div class="profile-header">
      <h2>@${username}</h2>
      <p>Seguidores: ${followers}</p>
    </div>
  `;

  snap.forEach(p => {
    html += `<div class="post"><p>${p.data().text}</p></div>`;
  });

  document.getElementById("profileView").innerHTML = html;
  document.getElementById("profileView").style.display = "block";
};

// ================= SEARCH =================
window.searchUsers = async function () {

  const value = document.getElementById("searchInput").value.toLowerCase();

  const q = query(collection(db, "users"));
  const snap = await getDocs(q);

  let html = "";

  snap.forEach(u => {

    const d = u.data();

    if (d.username.includes(value)) {

      html += `
        <div class="user-card">
          <p>@${d.username}</p>
          <button onclick="openProfile('${u.id}','${d.username}')">
            Ver perfil
          </button>
        </div>
      `;
    }
  });

  document.getElementById("searchResults").innerHTML = html;
};

// ================= SETTINGS =================
window.toggleTheme = function () {
  document.body.classList.toggle("light");
};

window.toggleLang = function () {
  alert("Idioma cambiado");
};

window.changeUser = function () {
  const u = prompt("Nuevo usuario");
  if (!u) return;

  user = u;
  document.getElementById("me").innerText = "@" + user;
};

window.logout = function () {
  localStorage.clear();
  location.reload();
};
