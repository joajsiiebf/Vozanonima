console.log("APP BOOT SAFE MODE");

// ================= ERROR SYSTEM =================
function showError(msg) {
  const box = document.getElementById("errorBox");
  box.style.display = "block";
  box.innerHTML = "⚠️ " + msg;
}

// evita crash total
window.onerror = function (msg) {
  showError(msg);
};

// ================= FIREBASE SAFE INIT =================
let db;

try {
  const firebaseConfig = {
    apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
    authDomain: "vozanonimasm.firebaseapp.com",
    projectId: "vozanonimasm"
  };

  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();

} catch (e) {
  showError("Firebase no inicializó");
}

// ================= STATE SAFE =================
let user = localStorage.getItem("user") || null;
let userId = localStorage.getItem("userId") || null;
let view = "home";

// ================= SAFE DOM CHECK =================
function safe(id) {
  const el = document.getElementById(id);
  if (!el) console.warn("Falta ID:", id);
  return el;
}

// ================= INIT =================
window.onload = () => {

  try {

    if (user && userId) {
      safe("auth").style.display = "none";
      safe("app").style.display = "block";
      safe("me").innerText = "@" + user;
      render();
    }

  } catch (e) {
    showError("Error en init");
  }
};

// ================= NAV SAFE =================
window.showView = (v) => {
  view = v;
  render();
};

function render() {

  try {

    const feed = safe("feedView");
    const profile = safe("profileView");
    const chat = safe("chatView");

    if (!feed || !profile || !chat) {
      showError("Faltan vistas en HTML");
      return;
    }

    feed.style.display = "none";
    profile.style.display = "none";
    chat.style.display = "none";

    if (view === "home") loadFeed();
    if (view === "profile") loadProfile();
    if (view === "chat") loadChat();

  } catch (e) {
    showError("Render falló");
  }
}

// ================= REGISTER SAFE =================
window.register = async () => {

  try {

    const username = safe("user").value;
    const phone = safe("phone").value;
    const pass = safe("pass").value;

    if (!username || !phone || !pass)
      return showError("Completa todos los campos");

    const doc = await db.collection("users").add({
      username,
      phone,
      password: pass,
      followers: 110000
    });

    user = username;
    userId = doc.id;

    localStorage.setItem("user", user);
    localStorage.setItem("userId", userId);

    safe("auth").style.display = "none";
    safe("app").style.display = "block";

    safe("me").innerText = "@" + user;

    view = "home";
    render();

  } catch (e) {
    showError("Error en registro");
  }
};

// ================= LOGIN SAFE =================
window.login = async () => {

  try {

    const phone = safe("phone").value;
    const pass = safe("pass").value;

    const snap = await db.collection("users")
      .where("phone", "==", phone)
      .where("password", "==", pass)
      .get();

    if (snap.empty) return showError("Usuario incorrecto");

    snap.forEach(d => {
      user = d.data().username;
      userId = d.id;
    });

    localStorage.setItem("user", user);
    localStorage.setItem("userId", userId);

    safe("auth").style.display = "none";
    safe("app").style.display = "block";

    safe("me").innerText = "@" + user;

    view = "home";
    render();

  } catch (e) {
    showError("Error login Firebase");
  }
};

// ================= FEED SAFE =================
async function loadFeed() {

  try {

    const feed = safe("feedView");
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
        </div>
      `;
    });

  } catch (e) {
    showError("Error cargando feed");
  }
}

// ================= PROFILE SAFE =================
async function loadProfile() {

  try {

    const p = safe("profileView");
    p.style.display = "block";
    p.innerHTML = "<h3>Perfil</h3>";

  } catch (e) {
    showError("Error perfil");
  }
}

// ================= CHAT SAFE =================
async function loadChat() {

  try {

    const c = safe("chatView");
    c.style.display = "block";
    c.innerHTML = "<h3>Chat</h3>";

  } catch (e) {
    showError("Error chat");
  }
}
