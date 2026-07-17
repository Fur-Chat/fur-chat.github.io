const SUPABASE_URL = "https://fmntvfyanikaatsokqpt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtbnR2ZnlhbmlrYWF0c29rcXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjY4MzIsImV4cCI6MjA5OTc0MjgzMn0.Gj4yy_1F-2FOYNPIzw1mfXJLTYtoSYDkOUunbN6-wgY";

const { createClient } = supabase;

const client = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// Elements

const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");
const accountSection = document.getElementById("account-update");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const signupUsername = document.getElementById("signup-username");
const signupAvatar = document.getElementById("signup-avatar");

const authMsg = document.getElementById("auth-msg");
const userEmail = document.getElementById("user-email");

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("message");

const updateUsername = document.getElementById("update-username");
const updateAvatar = document.getElementById("update-avatar");
const updateMsg = document.getElementById("update-msg");

const loadMoreBtn = document.getElementById("loadMoreBtn");


// State

const PAGE_SIZE = 30;

let offset = 0;
let loading = false;
let finished = false;

let messageIDs = new Set();

let realtimeChannel = null;
let messagesLoaded = false;


// Get profile

async function getProfile(id){

    const {data,error} = await client
        .from("profiles")
        .select("username, avatar_url")
        .eq("id",id)
        .single();


    if(error){

        console.error(error);

    }


    return data || {
        username:"Unknown",
        avatar_url:"https://via.placeholder.com/32"
    };

}



// Load messages

async function loadMessages(reset=false){

    if(loading)
        return;


    if(reset){

        offset = 0;
        finished = false;
        messageIDs.clear();
        messagesDiv.innerHTML = "";

    }


    if(finished)
        return;


    loading = true;


    const {data,error} = await client
        .from("messages")
        .select("*")
        .order(
            "inserted_at",
            {
                ascending:true
            }
        )
        .range(
            offset,
            offset + PAGE_SIZE - 1
        );


    if(error){

        console.error(error);
        loading=false;
        return;

    }



    if(data.length < PAGE_SIZE){

        finished=true;

        if(loadMoreBtn)
            loadMoreBtn.style.display="none";

    }



    offset += data.length;



    for(const message of data){

        if(messageIDs.has(message.id))
            continue;


        messageIDs.add(message.id);


        message.profiles =
            await getProfile(message.user_id);


        addMessage(message);

    }



    if(reset){

        messagesDiv.scrollTop =
            messagesDiv.scrollHeight;

    }


    loading=false;

}



// Add new realtime message

async function handleNewMessage(message){

    if(messageIDs.has(message.id))
        return;


    messageIDs.add(message.id);


    message.profiles =
        await getProfile(message.user_id);


    addMessage(message);


    messagesDiv.scrollTop =
        messagesDiv.scrollHeight;

}



// Add message to screen

function addMessage(message){

    const box =
        document.createElement("div");

    box.className="msg";


    const img =
        document.createElement("img");

    img.src =
        message.profiles?.avatar_url ||
        "https://via.placeholder.com/32";


    const content =
        document.createElement("div");

    content.className="msg-content";


    const username =
        document.createElement("div");

    username.className="username";

    username.textContent =
        message.profiles?.username ||
        "Unknown";


    const text =
        document.createElement("div");

    text.textContent =
        message.content;


    const time =
        document.createElement("div");

    time.className="timestamp";

    time.textContent =
        new Date(
            message.inserted_at
        ).toLocaleTimeString();


    content.append(
        username,
        text,
        time
    );


    box.append(
        img,
        content
    );


    messagesDiv.appendChild(box);

}



// Start realtime

function startRealtime(){

    if(realtimeChannel)
        return;


    realtimeChannel =
        client
        .channel("messages-live")
        .on(
            "postgres_changes",
            {
                event:"INSERT",
                schema:"public",
                table:"messages"
            },
            payload=>{

                handleNewMessage(
                    payload.new
                );

            }
        )
        .subscribe(
            status=>{

                console.log(
                    "Realtime status:",
                    status
                );

            }
        );

}



// Stop realtime

function stopRealtime(){

    if(realtimeChannel){

        client.removeChannel(
            realtimeChannel
        );

        realtimeChannel=null;

    }

}

// Send message

async function sendMessage(){

    const text =
        messageInput.value.trim();


    if(!text)
        return;


    const {
        data:{user}
    } =
    await client.auth.getUser();


    if(!user)
        return;


    const {error} =
        await client
        .from("messages")
        .insert({
            user_id:user.id,
            content:text
        });


    if(error){

        alert(error.message);
        return;

    }


    messageInput.value="";

}



// Login

async function login(){

    const {error} =
        await client.auth
        .signInWithPassword({

            email:
                emailInput.value.trim(),

            password:
                passwordInput.value.trim()

        });


    authMsg.textContent =
        error ? error.message : "";

}



// Signup

async function signup(){

    const username =
        signupUsername.value.trim();


    if(!username){

        authMsg.textContent =
            "Username required.";

        return;

    }


    const {error} =
        await client.auth.signUp({

            email:
                emailInput.value.trim(),

            password:
                passwordInput.value.trim(),

            options:{
                data:{
                    username,
                    avatar_url:
                        signupAvatar.value.trim()
                }
            }

        });


    authMsg.textContent =
        error
        ? error.message
        : "Signup successful. Check email.";

}



// Logout

async function logout(){

    await client.auth.signOut();

}



// Update account

async function updateAccount(){

    const {
        data:{user}
    } =
    await client.auth.getUser();


    if(!user)
        return;


    const updates={};


    if(updateUsername.value.trim()){

        updates.username =
            updateUsername.value.trim();

    }


    if(updateAvatar.value.trim()){

        updates.avatar_url =
            updateAvatar.value.trim();

    }



    const {error} =
        await client
        .from("profiles")
        .update(updates)
        .eq(
            "id",
            user.id
        );


    updateMsg.textContent =
        error
        ? error.message
        : "Updated!";

}



// Auth UI

async function updateUI(){

    const {
        data:{user}
    } =
    await client.auth.getUser();



    if(user){

        authSection.classList.add("hidden");
        chatSection.classList.remove("hidden");

        userEmail.textContent =
            user.email;



        if(!messagesLoaded){

            messagesLoaded=true;

            await loadMessages(true);

        }


        startRealtime();


    }
    else{

        authSection.classList.remove("hidden");
        chatSection.classList.add("hidden");

        messagesLoaded=false;

        stopRealtime();

    }

}



// Navigation

window.addEventListener(
    "hashchange",
    ()=>{

        if(location.hash === "#account-update"){

            accountSection.classList.remove("hidden");
            chatSection.classList.add("hidden");

        }


        if(location.hash === "#chat-section"){

            accountSection.classList.add("hidden");
            chatSection.classList.remove("hidden");

        }

    }
);



// Buttons

document.getElementById("loginBtn")
.onclick = login;


document.getElementById("signupBtn")
.onclick = signup;


document.getElementById("logoutBtn")
.onclick = logout;


document.getElementById("sendBtn")
.onclick = sendMessage;


document.getElementById("updateAccountBtn")
.onclick = updateAccount;



if(loadMoreBtn){

    loadMoreBtn.onclick =
        ()=>loadMessages();

}



// Enter send

messageInput.addEventListener(
    "keydown",
    e=>{

        if(e.key==="Enter"){

            e.preventDefault();

            sendMessage();

        }

    }
);



// Auth listener

client.auth.onAuthStateChange(
    ()=>{

        updateUI();

    }
);



// Start app

updateUI();