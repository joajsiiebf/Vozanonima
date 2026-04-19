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
let activeChat = null;

// ================= SESSION =================
function saveSession() {
  localStorage.setItem("user", user);
  localStorage.setItem("userId", userId);
}

// ================= VIEW ENGINE (CLAVE FIX) =================
let currentView = "home";

function render() {
  hideAll();

  if (currentView === "home") {
    document.getElementById("feedView").style.display = "block";
    loadFeed();
  }

  if (currentView === "search") {
    document.getElementById("searchView").style.display = "block";
  }

  if (currentView === "profile") {
    document.getElementById("profileView").style.display = "block";
  }

  if (currentView === "settings") {
    document.getElementById("settingsView").style.display = "block";
  }

  if (currentView === "chat") {
    document.getElementById("chatView").style.display = "block";
  }
}

window.showView = function (v) {
  currentView = v;
  render();
};

function hideAll() {
  document.getElementById("feedView").style.display = "none";
  document.getElementById("searchView").style.display = "none";
  document.getElementById("profileView").style.display = "none";
  document.getElementById("settingsView").style.display = "none";
  document.getElementById("chatView").style.display = "none";
}

// ================= AUTO LOGIN =================
window.onload = () => {
  if (user && userId) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";

    document.getElementById("me").innerText = "@" + user;

    currentView = "home";
    render();
  }
};

// ================= LOGIN =================
window.login = async () => {

  const phone = document.getElementById("phone").value;
  const pass = document.getElementById("pass").value;

  const q = query(collection(db, "users"),
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

  currentView = "home";
  render();
};

// ================= REGISTER =================
window.register = async () => {

  const username = document.getElementById("user").value;
  const phone = document.getElementById("phone").value;
  const pass = document.getElementById("pass").value;

  await addDoc(collection(db, "users"), {
    username,
    phone,
    password: pass,
    followers: 110000
  });

  alert("Cuenta creada");
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

        <div onclick="openProfile('${d.userId}','${d.username}')"
             class="username">
          @${d.username}
        </div>

        <p>${d.text}</p>

        <button onclick="openComments('${p.id}')">Comentarios</button>
        <button onclick="createChat('${d.userId}')">Mensaje</button>

      </div>
    `;
  });
};

// ================= PROFILE FIX (NO ROMPE FEED) =================
window.openProfile = async (uid, username) => {

  currentView = "profile";
  render();

  const q = query(collection(db, "posts"),
    where("userId", "==", uid)
  );

  const snap = await getDocs(q);

  let html = `
    <div class="profile-header">
      <h2>@${username}</h2>
      <p>Seguidores: 110000</p>
    </div>
  `;

  snap.forEach(p => {
    html += `<div class="post">${p.data().text}</div>`;
  });

  document.getElementById("profileView").innerHTML = html;
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

  document.getElementById("feedView").innerHTML = html;
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

// ================= CHAT MESSENGER =================
window.createChat = async (targetId) => {

  const chat = await addDoc(collection(db, "chats"), {
    users: [userId, targetId]
  });

  openChat(chat.id);
};

window.openChat = async (chatId) => {

  activeChat = chatId;

  currentView = "chat";
  render();

  loadMessages(chatId);
};

async function loadMessages(chatId) {

  const q = query(collection(db, "messages"),
    where("chatId", "==", chatId)
  );

  const snap = await getDocs(q);

  let html = "";

  snap.forEach(m => {
    html += `
      <div class="msg">
        <b>${m.data().from}</b>: ${m.data().text}
      </div>
    `;
  });

  document.getElementById("messages").innerHTML = html;
}

window.sendMessage = async () => {

  const text = document.getElementById("msgInput").value;
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    chatId: activeChat,
    from: user,
    text,
    createdAt: new Date()
  });

  document.getElementById("msgInput").value = "";

  loadMessages(activeChat);
};

// ================= SETTINGS =================
window.toggleTheme = () => document.body.classList.toggle("dark");

window.changeUser = () => {
  const u = prompt("Nuevo usuario");
  if (u) user = u;
};

window.logout = () => {
  localStorage.clear();
  location.reload();
};
