import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= FIREBASE AUTO =================
const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:1ec05c7842f09a9e32f536"
};

// INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STATE =================
let user = null;
let userId = null;

// ================= AUTO USER =================
window.createUser = async function () {
  const username = document.getElementById("username").value.trim();
  if (!username) return;

  // crea o reutiliza usuario automáticamente
  const q = query(collection(db, "users"), where("username", "==", username));
  const snap = await getDocs(q);

  if (!snap.empty) {
    snap.forEach(d => {
      userId = d.id;
      user = username;
    });
  } else {
    const docRef = await addDoc(collection(db, "users"), {
      username,
      reputation: 0,
      createdAt: new Date()
    });

    user = username;
    userId = docRef.id;
  }

  localStorage.setItem("user", JSON.stringify({ user, userId }));

  enterApp();
};

// ================= AUTO LOGIN =================
const saved = JSON.parse(localStorage.getItem("user"));
if (saved) {
  user = saved.user;
  userId = saved.userId;
  setTimeout(enterApp, 0);
}

// ================= ENTER APP =================
function enterApp() {
  document.getElementById("setup").style.display = "none";
  document.getElementById("app").style.display = "block";
  loadFeed();
}

// ================= POSTS AUTO =================
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
window.like = async function (postId) {

  const check = await getDocs(
    query(collection(db, "likes"),
    where("postId", "==", postId),
    where("userId", "==", userId))
  );

  if (!check.empty) return;

  await addDoc(collection(db, "likes"), {
    postId,
    userId
  });

  const ref = doc(db, "posts", postId);

  await updateDoc(ref, {
    likes: increment(1)
  });
};

// ================= FEED AUTO =================
function loadFeed() {
  const feed = document.getElementById("feed");

  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  onSnapshot(q, snap => {
    feed.innerHTML = "";

    snap.forEach(pDoc => {
      const p = pDoc.data();

      const div = document.createElement("div");

      div.innerHTML = `
        <b>@${p.userId}</b>
        <p>${p.text}</p>

        <button onclick="like('${pDoc.id}')">
          ❤️ ${p.likes || 0}
        </button>
      `;

      feed.appendChild(div);
    });
  });
}
