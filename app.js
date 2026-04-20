// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:1ec05c7842f09a9e32f536",
  measurementId: "G-S53MVLKF66"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================= STATE =================
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// ================= UI CONTROL =================
function renderApp() {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("appView").style.display = "block";

  updateRoleUI();
}

function renderLogin() {
  document.getElementById("loginView").style.display = "block";
  document.getElementById("appView").style.display = "none";
}

// ================= INIT =================
window.onload = () => {
  if (currentUser?.id) {
    renderApp();
    go("feedView", "Inicio");
    loadFeed();
  } else {
    renderLogin();
  }
};

// ================= NAV =================
function go(viewId, title) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  const view = document.getElementById(viewId);
  if (view) view.classList.add("active");

  document.getElementById("title").innerText = title;

  if (viewId === "feedView") loadFeed();
}

// ================= ADMIN LOGIN =================
function isAdminLogin(phone, pass) {
  return phone === "admin" && pass === "admin";
}

// ================= REGISTER =================
async function register() {
  const username = regUser.value.trim();
  const phone = regPhone.value.trim();
  const pass = regPass.value;

  if (!username || !phone || !pass) return alert("Completa todo");

  const exists = await db.collection("users")
    .where("username", "==", username)
    .get();

  if (!exists.empty) return alert("Usuario ya existe");

  const doc = await db.collection("users").add({
    username,
    phone,
    password: pass,
    role: "user",
    created: Date.now()
  });

  currentUser = { id: doc.id, username, role: "user" };
  localStorage.setItem("user", JSON.stringify(currentUser));

  renderApp();
  go("feedView", "Inicio");
  loadFeed();
}

// ================= LOGIN =================
async function login() {
  const phone = loginPhone.value.trim();
  const pass = loginPass.value;

  // 👑 ADMIN FIX
  if (isAdminLogin(phone, pass)) {
    currentUser = {
      id: "admin",
      username: "admin",
      role: "admin"
    };

    localStorage.setItem("user", JSON.stringify(currentUser));

    renderApp();
    go("feedView", "Inicio");
    loadFeed();

    return;
  }

  const snap = await db.collection("users")
    .where("phone", "==", phone)
    .where("password", "==", pass)
    .get();

  if (snap.empty) return alert("Datos incorrectos");

  const u = snap.docs[0].data();

  currentUser = {
    id: snap.docs[0].id,
    username: u.username,
    role: u.role || "user"
  };

  localStorage.setItem("user", JSON.stringify(currentUser));

  renderApp();
  go("feedView", "Inicio");
  loadFeed();
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("user");
  currentUser = null;
  renderLogin();
}

// ================= POSTS =================
async function createPost() {
  const text = postText.value.trim();
  if (!text) return;

  await db.collection("posts").add({
    text,
    username: currentUser.username,
    likes: 0,
    created: Date.now()
  });

  postText.value = "";
  loadFeed();
}

async function loadFeed() {
  const feed = document.getElementById("feedView");
  feed.innerHTML = "";

  const snap = await db.collection("posts")
    .orderBy("created", "desc")
    .limit(10)
    .get();

  snap.forEach(doc => {
    const p = doc.data();

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <b>@${p.username}</b>
      <p>${p.text}</p>

      <button onclick="likePost('${doc.id}', ${p.likes})">
        ❤️ ${p.likes}
      </button>

      ${currentUser.role === "admin"
        ? `<button style="background:red;" onclick="deletePost('${doc.id}')">
            🗑 Eliminar
          </button>`
        : ""
      }
    `;

    feed.appendChild(div);
  });
}

// ================= LIKE =================
async function likePost(id, likes) {
  await db.collection("posts").doc(id).update({
    likes: likes + 1
  });

  loadFeed();
}

// ================= DELETE (ADMIN) =================
async function deletePost(id) {
  if (currentUser.role !== "admin") return;

  await db.collection("posts").doc(id).delete();
  loadFeed();
}

// ================= SEARCH =================
function searchUsers() {}

// ================= THEME =================
function toggleTheme() {
  document.body.classList.toggle("light");
}

// ================= ROLE UI =================
function updateRoleUI() {
  const badge = document.getElementById("roleBadge");

  if (!badge) return;

  badge.innerText =
    currentUser.role === "admin"
      ? "👑 ADMIN"
      : "USER";
}
