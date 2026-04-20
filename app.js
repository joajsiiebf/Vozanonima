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

// ================= ESTADO =================
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// ================= SEGURIDAD =================
window.onerror = function () {
  alert("Error interno. Recargando...");
  location.reload();
};

// ================= AUTH =================
async function register() {
  try {
    const username = regUser.value.trim();
    const phone = regPhone.value.trim();
    const pass = regPass.value;

    if (!username || !phone || !pass) return alert("Completa todo");

    const usersRef = db.collection("users");

    const existing = await usersRef.where("username", "==", username).get();
    if (!existing.empty) return alert("Username ya existe");

    const doc = await usersRef.add({
      username,
      phone,
      password: pass,
      followers: 0,
      following: 0
    });

    currentUser = { id: doc.id, username };
    localStorage.setItem("user", JSON.stringify(currentUser));

    showApp();
  } catch (e) {
    console.error(e);
  }
}

async function login() {
  try {
    const phone = loginPhone.value;
    const pass = loginPass.value;

    const snap = await db.collection("users")
      .where("phone", "==", phone)
      .where("password", "==", pass)
      .get();

    if (snap.empty) return alert("Datos incorrectos");

    const user = snap.docs[0];
    currentUser = { id: user.id, username: user.data().username };

    localStorage.setItem("user", JSON.stringify(currentUser));
    showApp();

  } catch (e) {
    console.error(e);
  }
}

// ================= APP =================
function showApp() {
  loginScreen.classList.remove("active");
  appScreen.classList.add("active");
  loadFeed();
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// ================= POSTS =================
async function createPost() {
  try {
    const text = postText.value;
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
    console.error(e);
  }
}

async function loadFeed() {
  try {
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
    console.error("Feed error", e);
  }
}

async function likePost(id, likes) {
  try {
    await db.collection("posts").doc(id).update({
      likes: likes + 1
    });
    loadFeed();
  } catch (e) {
    console.error(e);
  }
}

// ================= NAV =================
function navigate(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(view).classList.remove("hidden");
  topTitle.innerText = view.toUpperCase();
}

// ================= SEARCH =================
async function searchUsers() {
  const q = searchInput.value;

  const snap = await db.collection("users")
    .where("username", ">=", q)
    .where("username", "<=", q + "z")
    .get();

  searchResults.innerHTML = "";

  snap.forEach(u => {
    const d = u.data();
    const div = document.createElement("div");
    div.innerHTML = `@${d.username}`;
    searchResults.appendChild(div);
  });
}

// ================= THEME =================
function toggleTheme() {
  document.body.classList.toggle("light");
}

// ================= INIT =================
if (currentUser) showApp();
