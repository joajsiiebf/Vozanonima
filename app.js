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
  deleteDoc,
  doc
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

// ================= SESSION =================
function saveSession() {
  localStorage.setItem("user", user);
  localStorage.setItem("userId", userId);
}

// ================= AUTO LOGIN =================
window.onload = () => {
  if (user && userId) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("me").innerText = "@" + user;
    showView("home");
  }
};

// ================= NAV =================
window.showView = function (v) {
  hideAll();

  if (v === "home") {
    document.getElementById("feedView").style.display = "block";
    loadFeed();
  }

  if (v === "search") {
    document.getElementById("searchView").style.display = "block";
  }

  if (v === "profile") {
    openProfile(userId, user);
  }

  if (v === "settings") {
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
window.register = async () => {

  const username = userInput();
  const phone = phoneInput();
  const pass = passInput();

  await addDoc(collection(db, "users"), {
    username,
    phone,
    password: pass,
    followers: 110000
  });

  alert("Cuenta creada");
};

// ================= LOGIN =================
window.login = async () => {

  const phone = phoneInput();
  const pass = passInput();

  const q = query(collection(db, "users"),
    where("phone", "==", phone),
    where("password", "==", pass)
  );

  const snap = await getDocs(q);

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
window.createPost = async () => {

  const text = document.getElementById("postText").value;
  if (!text) return;

  await addDoc(collection(db, "posts"), {
    text,
    userId,
    username: user,
    createdAt: new Date()
  });

  loadFeed();
};

// ================= FEED =================
window.loadFeed = async () => {

  const feed = document.getElementById("feed");

  const q = query(collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  const snap = await getDocs(q);

  feed.innerHTML = "";

  snap.forEach(p => {
    const d = p.data();

    feed.innerHTML += `
      <div class="post">

        <div onclick="openProfile('${d.userId}','${d.username}')">
          @${d.username}
        </div>

        <p>${d.text}</p>

        <button onclick="openComments('${p.id}')">Comentarios</button>
        <button onclick="createChat('${d.userId}')">Mensaje</button>

      </div>
    `;
  });
};

// ================= PROFILE =================
window.openProfile = async (uid, username) => {

  hideAll();

  const q = query(collection(db, "posts"),
    where("userId", "==", uid)
  );

  const snap = await getDocs(q);

  let html = `
    <h2>@${username}</h2>
    <p>Seguidores: 110000</p>
  `;

  snap.forEach(p => {
    html += `<div class="post">${p.data().text}</div>`;
  });

  document.getElementById("profileView").innerHTML = html;
  document.getElementById("profileView").style.display = "block";
};

// ================= COMMENTS =================
window.openComments = async (postId) => {

  const q = query(collection(db, "comments"),
    where("postId", "==", postId)
  );

  const snap = await getDocs(q);

  let html = `
    <h3>Comentarios</h3>
    <input id="cmt">
    <button onclick="addComment('${postId}')">Enviar</button>
  `;

  snap.forEach(c => {
    html += `<p>@${c.data().user}: ${c.data().text}</p>`;
  });

  document.getElementById("feed").innerHTML = html;
};

// ================= ADD COMMENT =================
window.addComment = async (postId) => {

  const text = document.getElementById("cmt").value;

  await addDoc(collection(db, "comments"), {
    postId,
    text,
    user
  });

  openComments(postId);
};

// ================= SEARCH =================
window.searchUsers = async () => {

  const value = document.getElementById("searchInput").value.toLowerCase();

  const q = query(collection(db, "users"));
  const snap = await getDocs(q);

  let html = "";

  snap.forEach(u => {

    const d = u.data();

    if (d.username.includes(value)) {

      html += `
        <div>
          @${d.username}
          <button onclick="openProfile('${u.id}','${d.username}')">
            Ver
          </button>
        </div>
      `;
    }
  });

  document.getElementById("searchResults").innerHTML = html;
};

// ================= CHAT BASE =================
window.createChat = async (targetId) => {

  const chat = await addDoc(collection(db, "chats"), {
    users: [userId, targetId]
  });

  alert("Chat creado");
};

// ================= SETTINGS =================
window.toggleTheme = () => document.body.classList.toggle("dark");

window.changeUser = () => {
  const u = prompt("Usuario");
  user = u;
};

window.logout = () => {
  localStorage.clear();
  location.reload();
};

// ================= HELPERS =================
function userInput() {
  return document.getElementById("user").value;
}
function phoneInput() {
  return document.getElementById("phone").value;
}
function passInput() {
  return document.getElementById("pass").value;
}
