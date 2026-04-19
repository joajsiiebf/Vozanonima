const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================= STATE =================
let user = localStorage.getItem("user");
let userId = localStorage.getItem("userId");
let view = "home";
let chatActive = null;

// ================= INIT =================
window.onload = () => {
  if (user && userId) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("me").innerText = "@" + user;
    render();
  }
};

// ================= SESSION =================
function saveSession() {
  localStorage.setItem("user", user);
  localStorage.setItem("userId", userId);
}

// ================= NAV =================
window.showView = (v) => {
  view = v;
  render();
};

function render() {

  document.getElementById("feedView").style.display = "none";
  document.getElementById("profileView").style.display = "none";
  document.getElementById("chatView").style.display = "none";

  if (view === "home") loadFeed();
  if (view === "profile") loadProfile();
  if (view === "chat") loadChat();
}

// ================= REGISTER =================
window.register = async () => {

  const username = document.getElementById("user").value;
  const phone = document.getElementById("phone").value;
  const pass = document.getElementById("pass").value;

  if (!username || !phone || !pass) return alert("Completa todo");

  const exists = await db.collection("users")
    .where("username", "==", username)
    .get();

  if (!exists.empty) return alert("Usuario ya existe");

  const doc = await db.collection("users").add({
    username,
    phone,
    password: pass,
    followers: 110000
  });

  user = username;
  userId = doc.id;

  saveSession();

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  view = "home";
  render();
};

// ================= LOGIN =================
window.login = async () => {

  const phone = document.getElementById("phone").value;
  const pass = document.getElementById("pass").value;

  const snap = await db.collection("users")
    .where("phone", "==", phone)
    .where("password", "==", pass)
    .get();

  if (snap.empty) return alert("Datos incorrectos");

  snap.forEach(d => {
    user = d.data().username;
    userId = d.id;
  });

  saveSession();

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  view = "home";
  render();
};

// ================= FEED =================
async function loadFeed() {

  const feed = document.getElementById("feedView");
  feed.style.display = "block";
  feed.innerHTML = "";

  const snap = await db.collection("posts")
    .orderBy("createdAt", "desc")
    .limit(10)
    .get();

  snap.forEach(p => {

    const d = p.data();

    feed.innerHTML += `
      <div class="post">

        <b onclick="openProfile('${d.userId}','${d.username}')">
          @${d.username}
        </b>

        <p>${d.text}</p>

        <button onclick="toggleComment('${p.id}')">Comentar</button>
        <button onclick="openChat('${d.userId}')">Mensaje</button>

        <div id="c-${p.id}" style="display:none;">
          <input id="i-${p.id}">
          <button onclick="addComment('${p.id}')">Enviar</button>
        </div>

      </div>
    `;
  });
}

// ================= COMMENTS =================
window.toggleComment = (id) => {
  const box = document.getElementById("c-" + id);
  box.style.display = box.style.display === "block" ? "none" : "block";
};

window.addComment = async (id) => {

  const text = document.getElementById("i-" + id).value;

  await db.collection("comments").add({
    postId: id,
    text,
    user
  });

  loadFeed();
};

// ================= PROFILE =================
window.openProfile = async (uid, username) => {

  view = "profile";
  render();

  const snap = await db.collection("posts")
    .where("userId", "==", uid)
    .get();

  let html = `<h2>@${username}</h2>`;

  snap.forEach(p => {
    html += `<div class="post">${p.data().text}</div>`;
  });

  document.getElementById("profileView").innerHTML = html;
};

// ================= CHAT =================
window.openChat = async (targetId) => {

  const chat = await db.collection("chats").add({
    users: [userId, targetId]
  });

  chatActive = chat.id;
  view = "chat";
  render();

  loadChat();
};

async function loadChat() {

  const snap = await db.collection("messages")
    .where("chatId", "==", chatActive)
    .get();

  let html = "";

  snap.forEach(m => {
    html += `<div>${m.data().from}: ${m.data().text}</div>`;
  });

  document.getElementById("chatView").innerHTML = html;
}

// ================= SEND =================
window.sendMessage = async () => {

  await db.collection("messages").add({
    chatId: chatActive,
    from: user,
    text: msgInput.value
  });

  msgInput.value = "";
  loadChat();
};
