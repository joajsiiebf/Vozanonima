const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let user = localStorage.getItem("user");
let userId = localStorage.getItem("userId");
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
  if (view === "chat") loadChats();
}

function save() {
  localStorage.setItem("user", user);
  localStorage.setItem("userId", userId);
}

// ================= REGISTER =================
window.register = async () => {

  const username = user.value;
  const phone = phone.value;
  const pass = pass.value;

  const doc = await db.collection("users").add({
    username,
    phone,
    password: pass,
    followers: 110000,
    following: 0
  });

  user = username;
  userId = doc.id;

  save();

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  view = "home";
  render();
};

// ================= LOGIN =================
window.login = async () => {

  const phoneVal = phone.value;
  const passVal = pass.value;

  const snap = await db.collection("users")
    .where("phone", "==", phoneVal)
    .where("password", "==", passVal)
    .get();

  if (snap.empty) return alert("Error login");

  snap.forEach(d => {
    user = d.data().username;
    userId = d.id;
  });

  save();

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  view = "home";
  render();
};

// ================= FEED REAL =================
async function loadFeed() {

  const feed = document.getElementById("feedView");
  feed.style.display = "block";
  feed.innerHTML = "";

  const snap = await db.collection("posts").get();

  snap.forEach(p => {

    const d = p.data();

    feed.innerHTML += `
      <div class="post">

        <b>@${d.username}</b>

        <p>${d.text}</p>

        <div class="post-actions">
          <span onclick="likePost('${p.id}')">❤️ ${d.likes || 0}</span>
          <span onclick="toggleComment('${p.id}')">💬 comentar</span>
          <span onclick="openProfile()">👤 perfil</span>
        </div>

        <div id="c-${p.id}" style="display:none;" class="comment-box">
          <input id="i-${p.id}" placeholder="comentario">
          <button onclick="addComment('${p.id}')">Enviar</button>
        </div>

      </div>
    `;
  });
}

// ================= LIKE =================
window.likePost = async (id) => {

  const ref = db.collection("posts").doc(id);
  const doc = await ref.get();

  let likes = doc.data().likes || 0;

  await ref.update({ likes: likes + 1 });

  loadFeed();
};

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
async function loadProfile() {

  const p = document.getElementById("profileView");
  p.style.display = "block";
  p.innerHTML = `<h2>@${user}</h2>`;

  const snap = await db.collection("posts")
    .where("userId", "==", userId)
    .get();

  snap.forEach(d => {
    p.innerHTML += `<div class="post">${d.data().text}</div>`;
  });
}

// ================= CHAT (LISTA SIMPLE) =================
async function loadChats() {

  const c = document.getElementById("chatView");
  c.style.display = "block";

  c.innerHTML = `<h3>Chats</h3><p>No hay chats aún</p>`;
}
