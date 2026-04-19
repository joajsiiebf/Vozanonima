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

// ================= USER =================
window.createUser = async function () {
  const username = document.getElementById("username").value.trim();
  if (!username) return;

  const check = await getDocs(
    query(collection(db, "users"), where("username", "==", username))
  );

  if (check.empty) {
    const ref = await addDoc(collection(db, "users"), {
      username,
      reputation: 0
    });
    userId = ref.id;
  } else {
    check.forEach(d => userId = d.id);
  }

  user = username;

  localStorage.setItem("user", JSON.stringify({ user, userId }));

  enterApp();
};

// ================= ENTER =================
function enterApp() {
  document.getElementById("setup").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("me").innerText = "@" + user;

  loadFeed();
  loadNotifications();
}

// auto login
const saved = JSON.parse(localStorage.getItem("user"));
if (saved) {
  user = saved.user;
  userId = saved.userId;
  setTimeout(enterApp, 0);
}

// ================= POSTS =================
window.createPost = async function () {
  const text = document.getElementById("postText").value;

  await addDoc(collection(db, "posts"), {
    text,
    userId,
    createdAt: new Date(),
    likes: 0
  });

  await updateRep(1);

  document.getElementById("postText").value = "";

  await notifyFollowers("post", "publicó algo nuevo");
};

// ================= LIKE =================
window.like = async function (postId, ownerId) {

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

  await updateDoc(doc(db, "posts", postId), {
    likes: increment(1)
  });

  await updateRep(2);
  await notify(ownerId, "like", "like en tu post");
};

// ================= COMMENTS =================
window.comment = async function (postId, ownerId) {
  const input = document.getElementById("c-" + postId);

  await addDoc(collection(db, "comments"), {
    postId,
    userId,
    text: input.value,
    createdAt: new Date()
  });

  await updateRep(3);
  await notify(ownerId, "comment", "comentario en tu post");

  input.value = "";
};

// ================= REPUTATION =================
async function updateRep(val) {
  await updateDoc(doc(db, "users", userId), {
    reputation: increment(val)
  });
}

// ================= NOTIFICATIONS =================
async function notify(to, type, text) {
  await addDoc(collection(db, "notifications"), {
    to,
    from: userId,
    type,
    text,
    read: false,
    createdAt: new Date()
  });
}

// ================= FEED =================
function loadFeed() {
  const feed = document.getElementById("feed");

  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  onSnapshot(q, snap => {
    feed.innerHTML = "";

    snap.forEach(pDoc => {
      const p = pDoc.data();

      const div = document.createElement("div");

      div.innerHTML = `
        <p>${p.text}</p>

        <button onclick="like('${pDoc.id}','${p.userId}')">
          ❤️ ${p.likes || 0}
        </button>

        <div id="c-${pDoc.id}"></div>

        <input id="i-${pDoc.id}" placeholder="Comentar">
        <button onclick="comment('${pDoc.id}','${p.userId}')">Enviar</button>
      `;

      feed.appendChild(div);

      loadComments(pDoc.id);
    });
  });
}

// ================= COMMENTS =================
function loadComments(postId) {
  const box = document.getElementById("c-" + postId);

  onSnapshot(collection(db, "comments"), snap => {
    box.innerHTML = "";

    snap.forEach(c => {
      const d = c.data();
      if (d.postId === postId) {
        box.innerHTML += `<small>@${d.userId}: ${d.text}</small><br>`;
      }
    });
  });
}

// ================= NOTIFICATIONS UI =================
window.openNotifications = async function () {
  document.getElementById("notificationsPanel").style.display = "block";

  const snap = await getDocs(
    query(collection(db, "notifications"), where("to", "==", userId))
  );

  const list = document.getElementById("notificationsList");
  list.innerHTML = "";

  let count = 0;

  snap.forEach(n => {
    const d = n.data();
    list.innerHTML += `<p>${d.text}</p>`;
    if (!d.read) count++;
  });

  document.getElementById("notiCount").innerText = count;
};

window.closeNotifications = () => {
  document.getElementById("notificationsPanel").style.display = "none";
};

// ================= FOLLOW NOTIS =================
async function notifyFollowers(type, text) {
  const snap = await getDocs(
    query(collection(db, "follows"), where("to", "==", userId))
  );

  snap.forEach(async f => {
    await notify(f.data().from, type, text);
  });
};

// ================= SETTINGS =================
window.openSettings = () => document.getElementById("settingsPanel").style.display = "block";
window.closeSettings = () => document.getElementById("settingsPanel").style.display = "none";

// ================= THEME =================
window.toggleTheme = function () {
  document.body.classList.toggle("dark");
};

// ================= LOGOUT =================
window.logout = function () {
  localStorage.clear();
  location.reload();
};
