console.log("APP INICIADA");


// ================= FIREBASE (CDN COMPATIBLE) =================
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "XXX",
  appId: "XXX"
};

// Firebase scripts desde CDN
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================= USER =================
function getUser() {
  return localStorage.getItem("user");
}

function setUser(u) {
  localStorage.setItem("user", u);
}

// ================= APP START =================
window.entrar = function () {
  document.getElementById("tutorial").style.display = "none";
  document.getElementById("app").style.display = "block";

  if (!getUser()) {
    setUser("Anon_" + Math.floor(Math.random() * 9999));
  }

  loadPosts();
};

// ================= CONFIG =================
window.toggleConfig = function () {
  const c = document.getElementById("config");
  c.style.display = c.style.display === "block" ? "none" : "block";
};

window.saveUser = function () {
  const u = document.getElementById("userInput").value;
  if (!u) return;
  setUser(u);
};

window.toggleTheme = function () {
  document.body.classList.toggle("dark");
};

// ================= POSTS =================
window.createPost = async function () {
  const text = document.getElementById("text").value.trim();
  if (!text) return;

  await db.collection("posts").add({
    text,
    user: getUser(),
    likes: 0,
    createdAt: new Date()
  });

  document.getElementById("text").value = "";
};

// ================= LIKE =================
window.like = async function (id) {
  const ref = db.collection("posts").doc(id);
  const doc = await ref.get();
  ref.update({
    likes: (doc.data().likes || 0) + 1
  });
};

// ================= LOAD POSTS =================
function loadPosts() {
  const feed = document.getElementById("feed");

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
      feed.innerHTML = "";

      snapshot.forEach(doc => {
        const p = doc.data();

        const div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
          <b>${p.user}</b>
          <p>${p.text}</p>
          <button onclick="like('${doc.id}')">❤️ ${p.likes || 0}</button>
        `;

        feed.appendChild(div);
      });
    });
}
