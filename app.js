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
let chatId = null;
let view = "home";

// ================= INIT =================
window.onload = () => {
  if (user) {
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

// ================= LOGIN =================
window.login = async () => {

  const phone = phone.value;
  const pass = pass.value;

  const snap = await db.collection("users")
    .where("phone", "==", phone)
    .where("password", "==", pass)
    .get();

  if (snap.empty) return alert("Error login");

  snap.forEach(d => {
    user = d.data().username;
    userId = d.id;
  });

  saveSession();

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  render();
};

// ================= REGISTER =================
window.register = async () => {

  await db.collection("users").add({
    username: user.value,
    phone: phone.value,
    password: pass.value,
    followers: 110000
  });

  alert("Creado");
};

// ================= NAV =================
window.showView = (v) => {
  view = v;
  render();
};

// ================= RENDER ENGINE =================
function render() {

  document.getElementById("feedView").style.display = "none";
  document.getElementById("profileView").style.display = "none";
  document.getElementById("chatView").style.display = "none";

  if (view === "home") loadFeed();
  if (view === "profile") loadProfile();
  if (view === "chat") loadChat();
}

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

        <b>@${d.username}</b>

        <p>${d.text}</p>

        <button onclick="openChat('${d.userId}')">Mensaje</button>

      </div>
    `;
  });
}

// ================= PROFILE =================
async function loadProfile() {

  const viewEl = document.getElementById("profileView");
  viewEl.style.display = "block";
  viewEl.innerHTML = "";

  const snap = await db.collection("posts")
    .where("userId", "==", userId)
    .get();

  viewEl.innerHTML += `<h2>@${user}</h2>`;

  snap.forEach(p => {
    viewEl.innerHTML += `<div class="post">${p.data().text}</div>`;
  });
}

// ================= CHAT =================
window.openChat = async (targetId) => {

  const chat = await db.collection("chats").add({
    users: [userId, targetId]
  });

  chatId = chat.id;
  view = "chat";
  render();
};

async function loadChat() {

  const chatBox = document.getElementById("chatView");
  chatBox.style.display = "flex";

  const snap = await db.collection("messages")
    .where("chatId", "==", chatId)
    .get();

  let html = "";

  snap.forEach(m => {
    html += `<div>${m.data().from}: ${m.data().text}</div>`;
  });

  document.getElementById("messages").innerHTML = html;
}

// ================= SEND MESSAGE =================
window.sendMessage = async () => {

  await db.collection("messages").add({
    chatId,
    from: user,
    text: msgInput.value
  });

  msgInput.value = "";
  loadChat();
};
