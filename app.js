// Replace with your Supabase keys
const SUPABASE_URL = "https://trxicnzhmjdgzxcfypsj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyeGljbnpobWpkZ3p4Y2Z5cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDA1NzUsImV4cCI6MjA3MjkxNjU3NX0.eGhW1nqb-_JH16sZrY8dDHjGO-VreRgAVk5Ve4kDH7E";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  let { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert(error.message);
  } else {
    alert("Sign-up successful! Check your email to confirm.");
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  let { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message);
  } else {
    document.getElementById("auth").style.display = "none";
    document.getElementById("chat").style.display = "block";
  }
}

function sendMessage() {
  alert("Messaging will go here soon!");
}
