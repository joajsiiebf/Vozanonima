// ================= FIREBASE =================
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

// ================= SAFE INIT =================
window.onload = () => {

  try {

    if (user && userId) {
      document.getElementById("auth").style.display = "none";
      document.getElementById("app").style.display = "block";
      document.getElementById("me").innerText = "@" + user;
      render();
    }

  } catch (e) {
    console.log(e);
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

  const feed = document.getElementById("feedView");
  const profile = document.getElementById("profileView");
  const chat = document.getElementById("chatView");

  if (!feed || !profile || !chat) return;

  feed.style.display = "none";
  profile.style.display = "none";
  chat.style.display = "none";

  if (view === "home") loadFeed();
  if (view === "profile") loadProfile();
  if (view === "chat") loadChat();
}

// ================= REGISTER SAFE =================
window.register = async () => {

  const username = document.getElementById("user").value;
  const phone = document.getElementById("phone").value;
  const pass = document.getElementById("pass").value;

  if (!username || !phone || !pass) return alert("Completa todo");

  try {

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

  } catch (e) {
    console.log(e);
    alert("Error registro");
  }
};

// ================= LOGIN SAFE =================
window.login = async () => {

  const phone = document.getElementById("phone").value;
  const pass = document.getElementById("pass").value;

  try {

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

  } catch (e) {
    console.log(e);
    alert("Error login");
  }
};

// ================= FEED SAFE (SIN ORDERBY) =================
async function loadFeed() {

  const feed = document.getElementById("feedView");
  if (!feed) return;

  feed.style.display = "block";
  feed.innerHTML = "";

  try {

    const snap = await db.collection("posts").get();

    let posts = [];

    snap.forEach(p => {
      posts.push(p.data());
    });

    posts.reverse();

    posts.slice(0, 10).forEach(d => {

      feed.innerHTML += `
        <div class="post">

          <b>@${d.username || "user"}</b>

          <p>${d.text || ""}</p>

        </div>
      `;
    });

  } catch (e) {
    console.log(e);
    feed.innerHTML = "<p>Error feed</p>";
  }
}

// ================= PROFILE =================
async function loadProfile() {

  const p = document.getElementById("profileView");
  if (!p) return;

  p.style.display = "block";
  p.innerHTML = "<h3>Perfil</h3>";

  try {

    const snap = await db.collection("posts")
      .where("userId", "==", userId)
      .get();

    snap.forEach(x => {
      p.innerHTML += `<div class="post">${x.data().text}</div>`;
    });

  } catch (e) {
    console.log(e);
  }
}

// ================= CHAT SIMPLE =================
async function loadChat() {

  const c = document.getElementById("chatView");
  if (!c) return;

  c.style.display = "block";
  c.innerHTML = "<h3>Mensajes</h3>";
}
