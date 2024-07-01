function initializeSupabase() {
  const supabase = window.supabase.createClient(
    "https://rqyiibvcszfszmdhhgkg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxeWlpYnZjc3pmc3ptZGhoZ2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk2OTI1MTQsImV4cCI6MjAzNTI2ODUxNH0.v0kjLBczNMYAmI-Onwc65LYzVa9roPeo4LcFBEm98ik"
  );

  setupEventListeners(supabase);

  lucide.createIcons();
  checkUser(supabase);
}

initializeSupabase();

function setupEventListeners(supabase) {
  const loginButton = document.getElementById("loginButton");
  loginButton.addEventListener("click", () => handleLoginLogout(supabase));

  const closeLoginModalButton = document.getElementById("closeLoginModal");
  closeLoginModalButton.addEventListener("click", closeLoginModal);

  const submitLoginFormButton = document.getElementById("submitLoginForm");
  submitLoginFormButton.addEventListener("click", () =>
    handleLoginSubmit(supabase)
  );
}

function openLoginModal() {
  const loginModal = document.getElementById("loginModal");
  loginModal.classList.remove("hidden");
}

function closeLoginModal() {
  const loginModal = document.getElementById("loginModal");
  loginModal.classList.add("hidden");
}

async function handleLoginSubmit(supabase) {
  const email = document.getElementById("email").value;

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // emailRedirectTo: "http://localhost:3000",
      },
    });
    if (error) throw error;
    showSnackbar("Check your email for the login link!", "success");
    closeLoginModal();
  } catch (error) {
    showSnackbar(error.error_description || error.message, "error");
  }
}

async function handleLoginLogout(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await handleLogout(supabase);
  } else {
    openLoginModal();
  }
}

async function checkUser(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  updateLoginButton(user);
}

function updateLoginButton(user) {
  const loginButton = document.getElementById("loginButton");

  if (user) {
    loginButton.textContent = "Logout";
  } else {
    loginButton.textContent = "Login";
  }
}

async function handleLogout(supabase) {
  await supabase.auth.signOut();
  window.showSnackbar("You have been logged out successfully", "info");
  updateLoginButton(null);
}
