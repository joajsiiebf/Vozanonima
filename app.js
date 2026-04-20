const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = { username: "demo" };

// ================= INIT =================
window.onload = () => {
  try {
    loadFeed();
  } catch (e) {
    console.error("INIT ERROR:", e);
  }
};

// ================= CREATE POST =================
function createPost() {
  const text = document.getElementById("postText");
  const img = document.getElementById("postImg");

  if (!text.value.trim()) return;

  db.collection("posts").add({
    username: currentUser.username,
    text: text.value,
    image: img.value || "",
    created: Date.now(),
    likes: 0
  }).catch(err => console.error("POST ERROR:", err));

  text.value = "";
  img.value = "";
}

// ================= FEED =================
function loadFeed() {

  db.collection("posts")
    .orderBy("created", "desc")
    .limit(50)
    .onSnapshot(snapshot => {

      const feed = document.getElementById("feed");
      let html = "";

      snapshot.forEach(doc => {

        const p = doc.data();

        html += `
        <div class="post" data-id="${doc.id}">

          <div class="post-header">
            <div class="avatar"></div>
            <b>@${p.username}</b>
          </div>

          ${p.image
            ? `<img class="post-img" src="${p.image}">`
            : `<div class="post-img"></div>`}

          <div class="actions">

            <button class="likeBtn">❤️</button>
            <button class="commentBtn">💬</button>

          </div>

          <b>${p.likes || 0} likes</b>

          <p><b>@${p.username}</b> ${p.text}</p>

        </div>
        `;
      });

      feed.innerHTML = html;

    }, err => {
      console.error("FEED ERROR:", err);
    });
}

// ================= EVENT DELEGATION (CLAVE) =================
document.addEventListener("click", async (e) => {

  const post = e.target.closest(".post");
  if (!post) return;

  const id = post.dataset.id;

  // LIKE
  if (e.target.classList.contains("likeBtn")) {
    try {
      const ref = db.collection("posts").doc(id);
      const doc = await ref.get();

      let likes = doc.data().likes || 0;

      await ref.update({ likes: likes + 1 });

    } catch (err) {
      console.error("LIKE ERROR:", err);
    }
  }

  // COMMENT
  if (e.target.classList.contains("commentBtn")) {

    const text = prompt("Comentario:");
    if (!text) return;

    try {
      await db.collection("posts").doc(id)
        .collection("comments")
        .add({
          text,
          user: currentUser.username,
          created: Date.now()
        });

    } catch (err) {
      console.error("COMMENT ERROR:", err);
    }
  }
});
