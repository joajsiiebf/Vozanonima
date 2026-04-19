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
  doc,
  updateDoc,
  increment
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
let user = null;
let userId = null;
let lang = "es";

// ================= REGISTER =================
window.register = async function () {
  const username = document.getElementById("user").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const pass = document.getElementById("pass").value;

  if (!username || !phone || !pass) return;

  const q1 = query(collection(db, "users"), where("phone", "==", phone));
  const s1 = await getDocs(q1);
  if (!s1.empty) return alert("Teléfono ya registrado");

  const q2 = query(collection(db, "users"), where("username", "==", username));
  const s2 = await getDocs(q2);
  if (!s2.empty) return alert("Usuario ocupado");

  await addDoc(collection(db, "users"), {
    username,
    phone,
    password: pass,
    followers: 0
  });

  alert("Cuenta creada");
};

// ================= LOGIN =================
window.login = async function () {
  const phone = document.getElementById("phone").value.trim();
  const pass = document.getElementById("pass").value;

  const q = query(
    collection(db, "users"),
    where("phone", "==", phone),
    where("password", "==", pass)
  );

  const snap = await getDocs(q);

  if (snap.empty) return alert("Datos incorrectos");

  snap.forEach(u => {
    user = u.data().username;
    userId = u.id;
  });

  enterApp();
};

// ================= ENTER APP =================
function enterApp() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  loadFeed();
}

// ================= CREATE POST =================
window.createPost = async function () {
  const text = document.getElementById("postText").value;
  if (!text) return;

  await addDoc(collection(db, "posts"), {
    text,
    userId,
    username: user,
    createdAt: new Date(),
    likes: 0
  });

  document.getElementById("postText").value = "";
  loadFeed();
};

// ================= LIKE =================
window.like = async function (id) {
  await updateDoc(doc(db, "posts", id), {
    likes: increment(1)
  });

  loadFeed();
};

// ================= SHARE =================
window.sharePost = function (id) {
  const link = `${location.origin}/post.html?id=${id}`;
  navigator.clipboard.writeText(link);
  alert("Link copiado");
};

// ================= FEED =================
window.loadFeed = async function () {
  const feed = document.getElementById("feed");

  const q = query(
    collection(db, "posts"),
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

        <button onclick="like('${p.id}')">
          Like (${d.likes || 0})
        </button>

        <button onclick="sharePost('${p.id}')">
          Compartir
        </button>

      </div>
    `;
  });
};

// ================= PROFILE =================
window.openProfile = async function (uid, username) {

  const q = query(collection(db, "posts"), where("userId", "==", uid));
  const snap = await getDocs(q);

  let html = `
    <div class="profile">
      <h2>@${username}</h2>
      <p>Seguidores: 110000</p>
    </div>
  `;

  snap.forEach(p => {
    html += `
      <div class="post">
        <p>${p.data().text}</p>
      </div>
    `;
  });

  document.getElementById("feed").innerHTML = html;
};

// ================= SETTINGS =================
window.openSettings = function () {
  document.getElementById("settings").style.display = "block";
};

window.toggleTheme = function () {
  document.body.classList.toggle("light");
};

window.toggleLang = function () {
  lang = lang === "es" ? "en" : "es";
  alert(lang);
};

window.changeUser = function () {
  const newUser = prompt("Nuevo usuario");
  if (!newUser) return;

  user = newUser;
  document.getElementById("me").innerText = "@" + user;
};

window.logout = function () {
  location.reload();
};
