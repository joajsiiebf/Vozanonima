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
let currentUser = null;

// ================= ERROR SCREEN =================
function showFatalError(msg) {
  document.body.innerHTML = `
    <div style="
      color:white;
      background:#0b0f14;
      padding:20px;
      font-family:Arial;
    ">
      <h2>⚠️ Error de carga</h2>
      <p>${msg}</p>
    </div>
  `;
}

// ================= SAFE GET =================
function get(id) {
  const el = document.getElementById(id);
  if (!el) {
    showFatalError("Falta elemento HTML: " + id);
    throw new Error("Missing element " + id);
  }
  return el;
}

// ================= INIT =================
window.onload = () => {
  try {
    boot();
  } catch (e) {
    console.error(e);
    showFatalError("Error iniciando app");
  }
};

function boot() {
  console.log("APP START");

  currentUser = JSON.parse(localStorage.getItem("user"));

  const loginView = document.getElementById("loginView");
  const appView = document.getElementById("appView");

  if (!loginView || !appView) {
    showFatalError("HTML base incompleto (loginView/appView)");
    return;
  }

  if (currentUser?.id) {
    renderApp();
  } else {
    renderLogin();
  }
}

// ================= VIEWS =================
function renderLogin() {
  get("loginView").style.display = "block";
  get("appView").style.display = "none";
}

function renderApp() {
  get("loginView").style.display = "none";
  get("appView").style.display = "block";

  go("feedView", "Inicio");
  loadFeed();
}

// ================= NAV =================
function go(viewId, title) {
  const views = document.querySelectorAll(".screen");

  views.forEach(v => v.style.display = "none");

  const target = document.getElementById(viewId);

  if (!target) {
    showFatalError("No existe view: " + viewId);
    return;
  }

  target.style.display = "block";
  document.getElementById("title").innerText = title;
}

// ================= LOGIN =================
async function login() {
  try {
    const phone = get("loginPhone").value;
    const pass = get("loginPass").value;

    if (phone === "admin" && pass === "admin") {
      currentUser = { id: "admin", username: "admin", role: "admin" };
      localStorage.setItem("user", JSON.stringify(currentUser));
      renderApp();
      return;
    }

    const snap = await db.collection("users")
      .where("phone", "==", phone)
      .where("password", "==", pass)
      .get();

    if (snap.empty) {
      alert("Usuario incorrecto");
      return;
    }

    const u = snap.docs[0];

    currentUser = {
      id: u.id,
      username: u.data().username,
      role: u.data().role || "user"
    };

    localStorage.setItem("user", JSON.stringify(currentUser));

    renderApp();

  } catch (e) {
    console.error(e);
    showFatalError("Error login");
  }
}

// ================= REGISTER =================
async function register() {
  try {
    const username = get("regUser").value;
    const phone = get("regPhone").value;
    const pass = get("regPass").value;

    if (!username || !phone || !pass) return alert("Completa todo");

    const exists = await db.collection("users")
      .where("username", "==", username)
      .get();

    if (!exists.empty) return alert("Usuario existe");

    const doc = await db.collection("users").add({
      username,
      phone,
      password: pass,
      role: "user"
    });

    currentUser = { id: doc.id, username, role: "user" };
    localStorage.setItem("user", JSON.stringify(currentUser));

    renderApp();

  } catch (e) {
    console.error(e);
    showFatalError("Error registro");
  }
}

// ================= FEED =================
async function loadFeed() {
  try {
    const feed = get("feedView");
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

        <button onclick="likePost('${doc.id}', ${p.likes || 0})">
          ❤️ ${p.likes || 0}
        </button>

        ${
          currentUser?.role === "admin"
            ? `<button style="background:red;" onclick="deletePost('${doc.id}')">
                🗑
              </button>`
            : ""
        }
      `;

      feed.appendChild(div);
    });

  } catch (e) {
    console.error(e);
    showFatalError("Error cargando feed");
  }
}

// ================= POST =================
async function createPost() {
  const text = get("postText").value;

  if (!text) return;

  await db.collection("posts").add({
    text,
    username: currentUser.username,
    likes: 0,
    created: Date.now()
  });

  get("postText").value = "";
  loadFeed();
}

// ================= LIKE =================
async function likePost(id, likes) {
  await db.collection("posts").doc(id).update({
    likes: likes + 1
  });

  loadFeed();
}

// ================= DELETE ADMIN =================
async function deletePost(id) {
  if (currentUser.role !== "admin") return;

  await db.collection("posts").doc(id).delete();
  loadFeed();
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("user");
  currentUser = null;
  renderLogin();
}
