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
  projectId: "vozanonimasm"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STATE =================
let user = null;
let userId = null;
const followingMap = {};

// ================= REGISTER =================
window.register = async function () {

  const username = document.getElementById("user").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const pass = document.getElementById("pass").value;

  if (!username || !phone || !pass) return;

  const q1 = query(collection(db, "users"), where("phone", "==", phone));
  const s1 = await getDocs(q1);
  if (!s1.empty) return alert("Teléfono ya registrado");

  const q2 = query(collection(db, "users"), where("username", "==", username));
  const s2 = await getDocs(q2);
  if (!s2.empty) return alert("Usuario ocupado");

  await addDoc(collection(db, "users"), {
    username,
    phone,
    password: pass,
    followers: 0,
    following: 0
  });

  alert("Cuenta creada");
};

// ================= LOGIN =================
window.login = async function () {

  const phone = document.getElementById("phone").value.trim();
  const pass = document.getElementById("pass").value;

  const q = query(
    collection(db, "users"),
    where("phone", "==", phone),
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

// ================= CREATE POST =================
window.createPost = async function () {

  const text = document.getElementById("postText").value;
  if (!text) return;

  await addDoc(collection(db, "posts"), {
    text,
    userId,
    username: user,
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

  document.getElementById("profileView").innerHTML = "";

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

        <div class="username"
          onclick="openProfile('${d.userId}','${d.username}')">
          @${d.username}
        </div>

        <p>${d.text}</p>

        <button onclick="like('${p.id}')">
          Like (${d.likes || 0})
        </button>

      </div>
    `;
  });
};

// ================= PROFILE REAL =================
window.openProfile = async function (uid, username) {

  const q = query(collection(db, "posts"), where("userId", "==", uid));
  const snap = await getDocs(q);

  const userData = await getUser(uid);

  let html = `
    <div class="profile-header">
      <h2>@${username}</h2>

      <p>
        Seguidores: ${userData.followers || 0} |
        Siguiendo: ${userData.following || 0}
      </p>

      <button onclick="toggleFollow('${uid}')">
        Seguir / Dejar de seguir
      </button>
    </div>
  `;

  snap.forEach(p => {
    html += `
      <div class="post">
        <p>${p.data().text}</p>
      </div>
    `;
  });

  document.getElementById("feed").innerHTML = "";
  document.getElementById("profileView").innerHTML = html;
};

// ================= GET USER =================
async function getUser(uid) {
  const q = query(collection(db, "users"), where("__name__", "==", uid));
  const snap = await getDocs(q);

  let data = {};
  snap.forEach(u => data = u.data());

  return data;
}

// ================= FOLLOW =================
window.toggleFollow = function (uid) {

  if (!followingMap[uid]) {
    followingMap[uid] = true;
    alert("Siguiendo usuario");
  } else {
    delete followingMap[uid];
    alert("Dejaste de seguir");
  }
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

          <button onclick="toggleFollow('${u.id}')">
            Follow
          </button>

        </div>
      `;
    }
  });

  document.getElementById("searchResults").innerHTML = html;
};

// ================= SETTINGS =================
window.openSettings = function () {
  document.getElementById("settings").style.display = "block";
};

window.toggleTheme = function () {
  document.body.classList.toggle("light");
};

window.toggleLang = function () {
  alert("Idioma cambiado");
};

window.changeUser = function () {
  const newUser = prompt("Nuevo usuario");
  if (!newUser) return;

  user = newUser;
  document.getElementById("me").innerText = "@" + user;
};

window.logout = function () {
  location.reload();
};
