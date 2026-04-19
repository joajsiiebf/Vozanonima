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
let currentView = "home";
let activeChat = null;

// ================= SESSION =================
function saveSession() {
  localStorage.setItem("user", user);
  localStorage.setItem("userId", userId);
}

// ================= INIT =================
window.onload = () => {
  if (user && userId) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("me").innerText = "@" + user;
    render();
  }
};

// ================= VIEW ENGINE FIX =================
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

  document.getElementById("postText").value = "";
  loadFeed();
};

// ================= FEED (FIX ANTI-SALTO) =================
window.loadFeed = async () => {

  const feed = document.getElementById("feed");
  feed.innerHTML = ""; // 🔥 evita salto visual

  const q = query(collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  const snap = await getDocs(q);

  snap.forEach(async (p) => {

    const d = p.data();

    const cq = query(collection(db, "comments"),
      where("postId", "==", p.id)
    );

    const csnap = await getDocs(cq);

    let commentsHTML = "";

    csnap.forEach(c => {
      commentsHTML += `
        <div class="comment">
          <b>@${c.data().user}</b> ${c.data().text}
        </div>
      `;
    });

    feed.innerHTML += `
      <div class="post">

        <div class="username"
          onclick="openProfile('${d.userId}','${d.username}')">
          @${d.username}
        </div>

        <p>${d.text}</p>

        <button onclick="toggleCommentBox('${p.id}')">Comentar</button>
        <button onclick="createChat('${d.userId}')">Mensaje</button>

        <div id="comments-${p.id}" class="comments">
          ${commentsHTML}
        </div>

        <div id="input-${p.id}" style="display:none;">
          <input id="c-${p.id}">
          <button onclick="addComment('${p.id}')">Enviar</button>
        </div>

      </div>
    `;
  });
};

// ================= COMMENTS =================
window.toggleCommentBox = function (id) {

  const box = document.getElementById(`input-${id}`);

  box.style.display = box.style.display === "block" ? "none" : "block";
};

window.addComment = async function (postId) {

  const input = document.getElementById(`c-${postId}`);
  const text = input.value;

  await addDoc(collection(db, "comments"), {
    postId,
    text,
    user
  });

  loadFeed();
};

// ================= PROFILE =================
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

// ================= CHAT (INBOX + RESTRICCIÓN) =================
window.createChat = async function (targetId) {

  const followCheck = await getDocs(collection(db, "follows"));

  let allowed = false;

  followCheck.forEach(f => {
    const d = f.data();
    if (d.from === userId && d.to === targetId) allowed = true;
  });

  if (!allowed) return alert("Solo puedes escribir a usuarios que sigues");

  const chat = await addDoc(collection(db, "chats"), {
    users: [userId, targetId]
  });

  openChat(chat.id);
};

window.openChat = async function (chatId) {

  activeChat = chatId;

  currentView = "chat";
  render();

  const q = query(collection(db, "messages"),
    where("chatId", "==", chatId)
  );

  const snap = await getDocs(q);

  let html = "";

  snap.forEach(m => {
    html += `<div class="msg"><b>${m.data().from}</b>: ${m.data().text}</div>`;
  });

  document.getElementById("messages").innerHTML = html;
};

window.sendMessage = async function () {

  const text = document.getElementById("msgInput").value;
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    chatId: activeChat,
    from: user,
    text,
    createdAt: new Date()
  });

  openChat(activeChat);
};

// ================= SETTINGS =================
window.toggleTheme = () => document.body.classList.toggle("dark");
window.changeUser = () => user = prompt("Nuevo usuario");
window.logout = () => location.reload();
