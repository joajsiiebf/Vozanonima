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
  increment,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:1ec05c7842f09a9e32f536"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STATE =================
let user = null;
let userId = null;
let postsLimit = 10;

// ================= AUTO DARK MODE =================
document.body.classList.add("dark");

// ================= USER =================
window.createUser = async function () {
  const name = document.getElementById("username").value.trim();
  if (!name) return;

  const q = query(collection(db, "users"), where("username", "==", name));
  const snap = await getDocs(q);

  if (snap.empty) {
    const ref = await addDoc(collection(db, "users"), {
      username: name,
      reputation: 0
    });
    userId = ref.id;
  } else {
    snap.forEach(d => userId = d.id);
  }

  user = name;

  localStorage.setItem("user", JSON.stringify({ user, userId }));

  enterApp();
};

function enterApp() {
  document.getElementById("setup").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  loadFeed();
}

// auto login
const saved = JSON.parse(localStorage.getItem("user"));
if (saved) {
  user = saved.user;
  userId = saved.userId;
  setTimeout(enterApp, 0);
}

// ================= CREATE POST =================
window.createPost = async function () {
  const text = document.getElementById("postText").value;
  if (!text) return;

  await addDoc(collection(db, "posts"), {
    text,
    userId,
    likes: 0,
    createdAt: new Date()
  });

  document.getElementById("postText").value = "";
};

// ================= LIKE =================
window.like = async function (id) {
  const ref = doc(db, "posts", id);

  await updateDoc(ref, {
    likes: increment(1)
  });
};

// ================= FEED =================
async function loadFeed() {
  const feed = document.getElementById("feed");

  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(postsLimit)
  );

  const snap = await getDocs(q);

  feed.innerHTML = "";

  snap.forEach(p => {
    const d = p.data();

    feed.innerHTML += `
      <div class="post">
        <p>${d.text}</p>

        <button onclick="like('${p.id}')">
          Like (${d.likes || 0})
        </button>

        <a href="post.html?id=${p.id}">
          Ver publicación
        </a>
      </div>
    `;
  });

  if (snap.size === postsLimit) {
    feed.innerHTML += `
      <button onclick="showMore()">Show more</button>
    `;
  }
}

// ================= SHOW MORE =================
window.showMore = function () {
  postsLimit += 10;
  loadFeed();
};

// ================= LOGOUT =================
window.logout = function () {
  localStorage.clear();
  location.reload();
};
