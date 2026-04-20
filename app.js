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

function showLogin(){
  loginView.style.display="block";
  appView.style.display="none";
}

function showApp(){
  loginView.style.display="none";
  appView.style.display="block";

  listenFeed();
  updateRoleUI();
}

// ================= NAV =================
function go(view){
  document.querySelectorAll(".screen")
    .forEach(s=>s.classList.add("hidden"));

  const el=document.getElementById(view);
  if(el) el.classList.remove("hidden");
}

// ================= LOGIN =================
async function login(){

  if(loginPhone.value==="admin" && loginPass.value==="admin"){
    currentUser={id:"admin",username:"admin",role:"admin"};
    localStorage.setItem("user",JSON.stringify(currentUser));
    showApp();
    return;
  }

  const snap=await db.collection("users")
    .where("phone","==",loginPhone.value)
    .where("password","==",loginPass.value)
    .get();

  if(snap.empty) return alert("Error");

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
    created:Date.now()
  });

  postText.value="";
}

// ================= FEED =================
function listenFeed(){

  db.collection("posts")
    .orderBy("created","desc")
    .limit(30)
    .onSnapshot(snap=>{

      const feed=document.getElementById("feedView");
      let html="";

      snap.forEach(doc=>{

        const p=doc.data();

        html+=`
          <div class="post">
            <b>@${p.username}</b>
            <p>${p.text}</p>
          </div>
        `;
      });

      feed.innerHTML=html;
    });
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
function logout(){
  localStorage.clear();
  location.reload();
}

function updateRoleUI(){
  roleBadge.innerText=currentUser.role==="admin"?"👑 ADMIN":"";
}
