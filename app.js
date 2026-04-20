const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = { username: "user" };

// ================= CREATE =================
function createPost(){

  if(!postText.value) return;

  db.collection("posts").add({
    username: currentUser.username,
    text: postText.value,
    image: postImg.value || "",
    created: Date.now(),
    likes: 0
  });

  postText.value="";
  postImg.value="";
}

// ================= FEED =================
function loadFeed(){

  db.collection("posts")
    .orderBy("created","desc")
    .onSnapshot(snap=>{

      const feed=document.getElementById("feed");
      let html="";

      snap.forEach(doc=>{

        const p=doc.data();

        html+=`
        <div class="post">

          <div class="post-header">
            <div class="avatar"></div>
            <b>@${p.username}</b>
          </div>

          ${p.image ? `<img class="post-img" src="${p.image}">`
                     : `<div class="post-img"></div>`}

          <div style="display:flex;gap:12px;padding:8px 0">

            <svg onclick="like('${doc.id}')" class="icon" viewBox="0 0 24 24">
              <path d="M12 21s-8-4.5-8-11a4 4 0 018-2 4 4 0 018 2c0 6.5-8 11-8 11z"/>
            </svg>

            <svg onclick="comment('${doc.id}')" class="icon" viewBox="0 0 24 24">
              <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z"/>
            </svg>

          </div>

          <b>${p.likes||0} likes</b>

          <p><b>@${p.username}</b> ${p.text}</p>

        </div>
        `;
      });

      feed.innerHTML=html;
    });
}

// ================= LIKE =================
async function like(id){

  const ref=db.collection("posts").doc(id);
  const doc=await ref.get();

  let likes=doc.data().likes||0;

  ref.update({likes:likes+1});
}

// ================= COMMENT =================
function comment(id){

  const text=prompt("Comentario:");

  if(!text) return;

  db.collection("posts").doc(id)
    .collection("comments").add({
      text,
      user:currentUser.username,
      created:Date.now()
    });
}

// ================= INIT =================
window.onload=()=>{
  loadFeed();
};
