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

// ================= ESTADO GLOBAL =================
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// ================= SEGURIDAD GLOBAL =================
window.onerror = function (msg, src, line) {
  console.error("GLOBAL ERROR:", msg, src, line);
  return true;
};

// ================= HELPERS UI =================
function showAuth() {
  document.getElementById("loginView").classList.add("active");
  document.getElementById("appView").classList.remove("active");
}

function showApp() {
  document.getElementById("loginView").classList.remove("active");
  document.getElementById("appView").classList.add("active");

  go("feedView", "Inicio");
  loadFeed();
}

// SPA NAVIGATION (CONTROL REAL)
function go(viewId, title) {
  const screens = document.querySelectorAll(".screen");

  screens.forEach(s => {
    s.classList.remove("active");
    s.classList.add("hidden");
  });

  const active = document.getElementById(viewId);
  if (active) {
    active.classList.remove("hidden");
    active.classList.add("active");
  }

  document.getElementById("title").innerText = title;

  if (viewId === "feedView") loadFeed();
}

// ================= AUTH =================
async function register() {
  try {
    const username = regUser.value.trim();
    const phone = regPhone.value.trim();
    const password = regPass.value;

    if (!username || !phone || !password)
      return alert("Completa todos los campos");

    const exists = await db.collection("users")
      .where("username", "==", username)
      .get();

    if (!exists.empty)
      return alert("Username ya existe");

    const doc = await db.collection("users").add({
      username,
      phone,
      password,
      followers: 0,
      following: 0,
      created: Date.now()
    });

    currentUser = { id: doc.id, username };
    localStorage.setItem("user", JSON.stringify(currentUser));

    showApp();

  } catch (e) {
    console.error("REGISTER ERROR:", e);
    alert("Error creando cuenta");
  }
}

async function login() {
  try {
    const phone = loginPhone.value.trim();
    const password = loginPass.value;

    if (!phone || !password)
      return alert("Completa login");

    const snap = await db.collection("users")
      .where("phone", "==", phone)
      .where("password", "==", password)
      .get();

    if (snap.empty)
      return alert("Datos incorrectos");

    const user = snap.docs[0];

    currentUser = {
      id: user.id,
      username: user.data().username
    };

    localStorage.setItem("user", JSON.stringify(currentUser));

    showApp();

  } catch (e) {
    console.error("LOGIN ERROR:", e);
    alert("Error iniciando sesión");
  }
}

function logout() {
  localStorage.removeItem("user");
  currentUser = null;
  showAuth();
}

// ================= POSTS =================
async function createPost() {
  try {
    const text = postText.value.trim();
    if (!text) return;

    await db.collection("posts").add({
      text,
      userId: currentUser.id,
      username: currentUser.username,
      likes: 0,
      created: Date.now()
    });

    postText.value = "";
    loadFeed();

  } catch (e) {
    console.error("POST ERROR:", e);
  }
}

async function loadFeed() {
  try {
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
      `;

      feed.appendChild(div);
    });

  } catch (e) {
    console.error("FEED ERROR:", e);
  }
}

async function likePost(id, likes) {
  try {
    await db.collection("posts").doc(id).update({
      likes: likes + 1
    });

    loadFeed();

  } catch (e) {
    console.error("LIKE ERROR:", e);
  }
}

// ================= SEARCH =================
async function searchUsers() {
  try {
    const q = searchInput.value.trim();
    const box = document.getElementById("searchResults");
    box.innerHTML = "";

    if (!q) return;

    const snap = await db.collection("users")
      .where("username", ">=", q)
      .where("username", "<=", q + "z")
      .get();

    snap.forEach(u => {
      const d = u.data();

      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `@${d.username}`;

      box.appendChild(div);
    });

  } catch (e) {
    console.error("SEARCH ERROR:", e);
  }
}

// ================= SETTINGS =================
function toggleTheme() {
  document.body.classList.toggle("light");
}

// ================= INIT =================
(function init() {
  if (currentUser && currentUser.id) {
    showApp();
  } else {
    showAuth();
  }
})();
