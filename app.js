// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// STATE
let user = localStorage.getItem("user");
let userId = localStorage.getItem("userId");
let view = "home";

// INIT
window.onload = () => {
  if (user) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("me").innerText = "@" + user;
    loadFeed();
  }
};

// SAVE
function saveSession() {
  localStorage.setItem("user", user);
  localStorage.setItem("userId", userId);
}

// NAV
window.showView = (v) => {
  view = v;

  if (v === "home") loadFeed();
  if (v === "profile") loadProfile();
  if (v === "chat") loadChats();
};

// REGISTER
window.register = async () => {

  const username = user.value;
  const phone = phone.value;
  const pass = pass.value;

  const check = await db.collection("users")
    .where("username", "==", username)
    .get();

  if (!check.empty) return alert("Usuario existe");

  const doc = await db.collection("users").add({
    username,
    phone,
    password: pass,
    followers: 0,
    following: 0
  });

  user = username;
  userId = doc.id;

  saveSession();

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  loadFeed();
};

// LOGIN
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

  saveSession();

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  loadFeed();
};

// FEED
async function loadFeed() {

  const feed = document.getElementById("feedView");
  feed.innerHTML = "";
  feed.style.display = "block";

  const snap = await db.collection("posts").get();

  snap.forEach(p => {

    const d = p.data();

    feed.innerHTML += `
      <div class="post">

        <b>@${d.username}</b>

        <p>${d.text}</p>

        <div class="actions">
          <span>❤️ ${d.likes || 0}</span>
          <span>💬</span>
        </div>

      </div>
    `;
  });
}

// PROFILE
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

// CHATS (BÁSICO REALISTA)
async function loadChats() {

  const c = document.getElementById("chatView");
  c.style.display = "block";
  c.innerHTML = "<h3>Mensajes</h3><p>No implementado completo aún</p>";
}
