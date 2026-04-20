// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:1ec05c7842f09a9e32f536"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================= STATE =================
let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let darkMode = JSON.parse(localStorage.getItem("dark")) || false;

// ================= INIT =================
window.onload = () => {
  applyTheme();

  if (currentUser?.id) {
    showApp();
  } else {
    showLogin();
  }
};

// ================= THEME =================
function toggleTheme() {
  darkMode = !darkMode;
  localStorage.setItem("dark", JSON.stringify(darkMode));
  applyTheme();
}

function applyTheme() {
  document.body.classList.toggle("light", !darkMode);
}

// ================= UI CONTROL =================
function showLogin() {
  document.getElementById("loginView").style.display = "block";
  document.getElementById("appView").style.display = "none";
}

function showApp() {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("appView").style.display = "block";

  go("feedView", "Inicio");
  listenFeed();
  updateRoleUI();
}

// ================= NAVIGATION =================
function go(viewId, title) {
  document.querySelectorAll(".screen").forEach(v => {
    v.style.display = "none";
  });

  const el = document.getElementById(viewId);
  if (el) el.style.display = "block";

  document.getElementById("title").innerText = title;
}

// ================= AUTH =================
async function login() {
  const phone = loginPhone.value.trim();
  const pass = loginPass.value;

  if (phone === "admin" && pass === "admin") {
    currentUser = {
      id: "admin",
      username: "admin",
      role: "admin"
    };

    localStorage.setItem("user", JSON.stringify(currentUser));
    showApp();
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
  showApp();
}

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
    role: "user"
  });

  currentUser = { id: doc.id, username, role: "user" };
  localStorage.setItem("user", JSON.stringify(currentUser));

  showApp();
}

function logout() {
  localStorage.removeItem("user");
  currentUser = null;
  showLogin();
}

// ================= POSTS REALTIME FEED =================
function listenFeed() {
  const feed = document.getElementById("feedView");

  db.collection("posts")
    .orderBy("created", "desc")
    .limit(30)
    .onSnapshot(snapshot => {

      feed.innerHTML = "";

      snapshot.forEach(doc => {
        const p = doc.data();

        const div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
          <b>@${p.username}</b>
          <p>${p.text}</p>

          <button onclick="likePost('${doc.id}', ${p.likes || 0})">
            ❤️ ${p.likes || 0}
          </button>

          ${
            currentUser?.role === "admin"
              ? `<button style="background:red" onclick="deletePost('${doc.id}')">
                  🗑 Eliminar
                </button>`
              : ""
          }
        `;

        feed.appendChild(div);
      });
    });
}

// ================= CREATE POST =================
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
}

// ================= LIKE =================
async function likePost(id, likes) {
  await db.collection("posts").doc(id).update({
    likes: likes + 1
  });
}

// ================= DELETE (ADMIN) =================
async function deletePost(id) {
  if (currentUser.role !== "admin") return;

  await db.collection("posts").doc(id).delete();
}

// ================= ROLE UI =================
function updateRoleUI() {
  const badge = document.getElementById("roleBadge");
  if (!badge) return;

  badge.innerText =
    currentUser?.role === "admin"
      ? "👑 ADMIN"
      : "USER";
}
