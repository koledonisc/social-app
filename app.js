// Replace with your Supabase keys
const SUPABASE_URL = "https://trxicnzhmjdgzxcfypsj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyeGljbnpobWpkZ3p4Y2Z5cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDA1NzUsImV4cCI6MjA3MjkxNjU3NX0.eGhW1nqb-_JH16sZrY8dDHjGO-VreRgAVk5Ve4kDH7E";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let currentFriend = null;

// Sign up
async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert(error.message);
  } else {
    alert("Sign-up successful! Check your email to confirm.");
  }
}

// Login
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert(error.message);
  } else {
    currentUser = data.user;
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "flex";
    loadFriends();
  }
}

// Add a friend
async function addFriend() {
  const email = document.getElementById("new-friend").value.trim();
  if (!email) return;

  // Find friend's user ID
  const { data: users, error: userError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email);

  if (userError || users.length === 0) {
    alert("User not found.");
    return;
  }

  const friendId = users[0].id;

  await supabase.from("friends").insert([
    { user_id: currentUser.id, friend_id: friendId }
  ]);

  document.getElementById("new-friend").value = "";
  loadFriends();
}

// Load friend list
async function loadFriends() {
  const { data, error } = await supabase
    .from("friends")
    .select("friend_id, profiles:friend_id(email)")
    .eq("user_id", currentUser.id);

  const friendList = document.getElementById("friends");
  friendList.innerHTML = "";

  if (data) {
    data.forEach(friend => {
      const li = document.createElement("li");
      li.textContent = friend.profiles.email;
      li.onclick = () => openChat(friend.friend_id, friend.profiles.email);
      friendList.appendChild(li);
    });
  }
}

// Open chat with a friend
function openChat(friendId, friendEmail) {
  currentFriend = friendId;
  document.getElementById("chat-with").innerText = `Chatting with ${friendEmail}`;
  loadMessages();

  // Listen for new messages in real-time
  supabase
    .channel('messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      payload => {
        if (
          (payload.new.sender_id === currentFriend && payload.new.receiver_id === currentUser.id) ||
          (payload.new.sender_id === currentUser.id && payload.new.receiver_id === currentFriend)
        ) {
          displayMessage(payload.new);
        }
      }
    )
    .subscribe();
}

// Load messages
async function loadMessages() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${currentFriend}),and(sender_id.eq.${currentFriend},receiver_id.eq.${currentUser.id})`)
    .order("created_at", { ascending: true });

  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";
  if (data) data.forEach(displayMessage);
}

// Display a single message
function displayMessage(msg) {
  const messagesDiv = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = "message";
  div.textContent = `${msg.sender_id === currentUser.id ? "You" : "Them"}: ${msg.content}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Send a message
async function sendMessage() {
  if (!currentFriend) return;
  const text = document.getElementById("message").value.trim();
  if (!text) return;

  await supabase.from("messages").insert([
    {
      sender_id: currentUser.id,
      receiver_id: currentFriend,
      content: text
    }
  ]);

  document.getElementById("message").value = "";
}
