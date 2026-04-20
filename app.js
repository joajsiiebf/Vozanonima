const firebaseConfig = {
  apiKey: "AIzaSyDln6EBV5vvYf0HzgAqdH8J6OAxIeO50JU",
  authDomain: "vozanonimasm.firebaseapp.com",
  projectId: "vozanonimasm",
  storageBucket: "vozanonimasm.firebasestorage.app",
  messagingSenderId: "533740152067",
  appId: "1:533740152067:web:1ec05c7842f09a9e32f536"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// ================= INIT =================
window.onload = () => {
  currentUser ? showApp() : showLogin();
};

// ================= VIEW =================
function showLogin(){
  loginView.style.display="block";
  appView.style.display="none";
}

function showApp(){
  loginView.style.display="none";
  appView.style.display="block";

  go("feedView","Inicio");
  listenFeed();
  updateRoleUI();
}

// ================= NAV =================
function go(view,title){

  document.querySelectorAll(".screen")
    .forEach(v=>v.style.display="none");

  document.getElementById(view).style.display="block";
  document.getElementById("title").innerText=title;

  document.querySelectorAll(".nav button")
    .forEach(b=>b.classList.remove("activeTab"));

  const map={
    feedView:0,
    searchView:1,
    profileView:3,
    settingsView:4
  };

  const btn=document.querySelectorAll(".nav button")[map[view]];
  if(btn) btn.classList.add("activeTab");
}

// ================= LOGIN =================
async function login(){

  const phone=loginPhone.value;
  const pass=loginPass.value;

  if(phone==="admin" && pass==="admin"){
    currentUser={id:"admin",username:"admin",role:"admin"};
    localStorage.setItem("user",JSON.stringify(currentUser));
    showApp();
    return;
  }

  const snap=await db.collection("users")
    .where("phone","==",phone)
    .where("password","==",pass)
    .get();

  if(snap.empty) return alert("Error login");

  const u=snap.docs[0].data();

  currentUser={
    id:snap.docs[0].id,
    username:u.username,
    role:u.role||"user"
  };

  localStorage.setItem("user",JSON.stringify(currentUser));
  showApp();
}

// ================= REGISTER =================
async function register(){

  const doc=await db.collection("users").add({
    username:regUser.value,
    phone:regPhone.value,
    password:regPass.value,
    role:"user"
  });

  currentUser={
    id:doc.id,
    username:regUser.value,
    role:"user"
  };

  localStorage.setItem("user",JSON.stringify(currentUser));
  showApp();
}

// ================= POSTS =================
function createPost(){

  db.collection("posts").add({
    text:postText.value,
    username:currentUser.username,
    created:Date.now(),
    r:{like:0,love:0,wow:0,haha:0,angry:0}
  });

  postText.value="";
}

// ================= FEED =================
function listenFeed(){

  db.collection("posts")
    .orderBy("created","desc")
    .onSnapshot(snap=>{

      const feed=document.getElementById("feedView");
      let html="";

      snap.forEach(doc=>{

        const p=doc.data();
        const r=p.r||{};

        html+=`
        <div class="post">

          <b>@${p.username}</b>
          <p>${p.text}</p>

          <div class="reactions">
            <button onclick="react('${doc.id}','like')">👍 ${r.like||0}</button>
            <button onclick="react('${doc.id}','love')">❤️ ${r.love||0}</button>
            <button onclick="react('${doc.id}','wow')">😮 ${r.wow||0}</button>
            <button onclick="react('${doc.id}','haha')">😂 ${r.haha||0}</button>
            <button onclick="react('${doc.id}','angry')">😡 ${r.angry||0}</button>
          </div>

          ${currentUser.role==="admin"
            ? `<button onclick="del('${doc.id}')">Eliminar</button>`
            : ""}

        </div>
        `;
      });

      feed.innerHTML=html;
    });
}

// ================= REACTIONS =================
async function react(id,type){

  const ref=db.collection("posts").doc(id);
  const doc=await ref.get();

  let r=doc.data().r||{};
  r[type]=(r[type]||0)+1;

  await ref.update({r});
}

// ================= DELETE =================
async function del(id){
  if(currentUser.role!=="admin")return;
  await db.collection("posts").doc(id).delete();
}

// ================= PROFILE =================
async function loadProfile(){

  const snap=await db.collection("posts")
    .where("username","==",currentUser.username)
    .get();

  profileView.innerHTML=`
    <div class="post">
      <h2>@${currentUser.username}</h2>
      <p>Posts: ${snap.size}</p>
    </div>
  `;
}

// ================= UX =================
function focusPost(){
  postText.focus();
}

function logout(){
  localStorage.clear();
  location.reload();
}

function updateRoleUI(){
  roleBadge.innerText=currentUser.role==="admin"?"👑 ADMIN":"";
}
