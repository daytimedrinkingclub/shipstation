// // Initialize Supabase client

// const supabase = supabase.createClient(
//   "https://rzikuenjublzqxeiddil.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aWt1ZW5qdWJsenF4ZWlkZGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1ODI0NTQsImV4cCI6MjAzNTE1ODQ1NH0.RuIiGyqtNdFWm5AGIFBB8Tl2A-AuGXqPqZTAWDh6NkQ"
// );

// document.addEventListener("DOMContentLoaded", () => {
//   const loginButton = document.getElementById("loginButton");
//   loginButton.addEventListener("click", handleLogin);

//   checkUser();
// });

// async function handleLogin() {
//   try {
//     const { data, error } = await supabase.auth.signInWithOtp({
//       email: prompt("Please enter your email:"),
//     });

//     if (error) throw error;

//     alert("Check your email for the login link!");
//   } catch (error) {
//     alert(error.error_description || error.message);
//   }
// }

// async function checkUser() {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (user) {
//     document.getElementById("loginButton").textContent = "Logout";
//     document
//       .getElementById("loginButton")
//       .removeEventListener("click", handleLogin);
//     document
//       .getElementById("loginButton")
//       .addEventListener("click", handleLogout);
//   }
// }

// async function handleLogout() {
//   await supabase.auth.signOut();
//   window.showSnackbar("You have been logged out successfully", "info");
//   document.getElementById("loginButton").textContent = "Login";
//   document
//     .getElementById("loginButton")
//     .removeEventListener("click", handleLogout);
//   document.getElementById("loginButton").addEventListener("click", handleLogin);
// }
