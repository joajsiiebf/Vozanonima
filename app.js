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

let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// ================= RENDER ÚNICO (CLAVE DEL FIX) =================
function render(view) {
  const app = document.getElementById("appView");
  const login = document.getElementById("loginView");

  // SIEMPRE OCULTA TODO
  login.style.display = "none";
  app.style.display = "none";

  if (view === "login") {
    login.style.display = "block";
  }

  if (view === "app") {
    app.style.display = "block";
  }
}

// ================= SPA NAV (SOLO UNA VISTA ACTIVA) =================
function go(viewId, title) {
  document.querySelectorAll(".screen").forEach(el => {
    el.style.display = "none";
  });

  const target = document.getElementById(viewId);
  if (target) target.style.display = "block";

  document.getElementById("title").innerText = title;

  if (viewId === "feedView") loadFeed();
}

// ================= INIT =================
function init() {
  if (currentUser && currentUser.id) {
    render("app");
    go("feedView", "Inicio");
    loadFeed();
  } else {
    render("login");
  }
}

// ================= AUTH =================
async function register() {
  try {
    const username = regUser.value.trim();
    const phone = regPhone.value.trim();
    const password = regPass.value;

    if (!username || !phone || !password) return alert("Completa todo");

    const exists = await db.collection("users")
      .where("username", "==", username)
      .get();

    if (!exists.empty) return alert("Username ya existe");

    const doc = await db.collection("users").add({
      username,
      phone,
      password,
      created: Date.now()
    });

    currentUser = { id: doc.id, username };
    localStorage.setItem("user", JSON.stringify(currentUser));

    render("app");
    go("feedView", "Inicio");
    loadFeed();

  } catch (e) {
    console.error(e);
    alert("Error registro");
  }
}

async function login() {
  try {
    const phone = loginPhone.value.trim();
    const password = loginPass.value;

    const snap = await db.collection("users")
      .where("phone", "==", phone)
      .where("password", "==", password)
      .get();

    if (snap.empty) return alert("Datos incorrectos");

    const u = snap.docs[0];

    currentUser = {
      id: u.id,
      username: u.data().username
    };

    localStorage.setItem("user", JSON.stringify(currentUser));

    render("app");
    go("feedView", "Inicio");
    loadFeed();

  } catch (e) {
    console.error(e);
    alert("Error login");
  }
}

function logout() {
  localStorage.removeItem("user");
  currentUser = null;
  render("login");
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
    `;

    feed.appendChild(div);
  });
}

async function likePost(id, likes) {
  await db.collection("posts").doc(id).update({
    likes: likes + 1
  });

  loadFeed();
}

// ================= SEARCH =================
function searchUsers() {
  const q = searchInput.value.trim();
  const box = searchResults;
  box.innerHTML = "";
}

// ================= START =================
window.onload = init;
