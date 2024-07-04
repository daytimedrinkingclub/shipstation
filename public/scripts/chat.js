lucide.createIcons();

let conversation = [];
let roomId = null; // Store room ID

const socket = io(); // Connect to the server

const requirementsTextarea = document.getElementById("user-input");
const generateButton = document.getElementById("generateButton");

const cardContainer = document.getElementById("card-container");
const shipForm = document.getElementById("ship-form");
const userInput = document.getElementById("user-input");

let isUserLoggedIn = false; // Add this line at the top of the file

// Modify the event listeners for the cards
document.getElementById("landing-page-card").addEventListener("click", () => {
  if (isUserLoggedIn) {
    window.shipType = "landing_page";
    // sendMessage("landing_page", "shipType");
    cardContainer.classList.add("hidden");
    shipForm.classList.remove("hidden");
    userInput.placeholder =
      "Enter your landing page requirements...\nDescribe the layout, sections, and copy in detail.\nYou can also include brand guidelines and color palette.";
  } else {
    openLoginModal();
  }
});

document
  .getElementById("personal-website-card")
  .addEventListener("click", () => {
    if (isUserLoggedIn) {
      window.shipType = "portfolio";
      // sendMessage("portfolio", "shipType");
      cardContainer.classList.add("hidden");
      shipForm.classList.remove("hidden");
      userInput.placeholder =
        "Enter your personal website requirements...\nDescribe the type of website (portfolio, resume, etc.), layout, sections, and copy in detail.\nYou can also include your personal brand guidelines and color palette.";
    } else {
      openLoginModal();
    }
  });

// Add this function to update the login state
function updateLoginState(loggedIn) {
  isUserLoggedIn = loggedIn;
}

function renderRecentlyShipped(websites = []) {
  if (websites.length === 0) {
    return;
  }
  const recentlyShippedSection = document.getElementById("recently-shipped");
  const recentlyShippedList = document.getElementById("recently-shipped-list");

  recentlyShippedSection.classList.remove("hidden");
  recentlyShippedList.innerHTML = "";

  websites.forEach(({ slug }) => {
    const anchor = document.createElement("a");
    anchor.href = `/${slug}`;
    anchor.target = "_blank";
    anchor.className =
      "text-cerulean hover:text-berkeley-blue border border-cerulean rounded-lg px-4 py-2 transition duration-300 ease-in-out transform hover:scale-105";
    anchor.textContent = slug;
    recentlyShippedList.appendChild(anchor);
  });
}

function showSnackbar(message, type = "info") {
  const snackbarContainer = document.getElementById("snackbar-container");
  const snackbar = document.createElement("div");
  snackbar.className = `mx-auto mb-4 px-4 py-2 rounded-md text-white text-sm font-bold shadow-lg transition-opacity duration-300 ease-in-out pointer-events-auto`;

  switch (type) {
    case "error":
      snackbar.classList.add("bg-red-500");
      break;
    case "info":
    default:
      snackbar.classList.add("bg-blue-500");
      break;
  }

  snackbar.textContent = message;
  snackbarContainer.appendChild(snackbar);

  // Fade in
  setTimeout(() => {
    snackbar.classList.add("opacity-90");
  }, 10);

  // Fade out and remove
  setTimeout(() => {
    snackbar.classList.remove("opacity-90");
    snackbar.classList.add("opacity-0");
    setTimeout(() => {
      snackbarContainer.removeChild(snackbar);
    }, 300);
  }, 4000);
}

window.showSnackbar = showSnackbar;

socket.on("connect", () => {
  if (!roomId) {
    roomId = "room_" + Math.random().toString(36).substr(2, 9); // Generate a random room ID only once
    socket.emit("joinRoom", roomId);
  }
});

function sendMessage(message, type = "prompt") {
  const user = getUserFromLocalStorage();
  const userId = user?.id;
  socket.emit("startProject", {
    roomId,
    userId,
    message,
    type,
    apiKey: localStorage.getItem("anthropicKey"),
  });
  socket.on("newMessage", ({ conversation: messages }) => {
    if (messages) {
      conversation = messages;
    }
  });

  socket.on("error", ({ error }) => {
    hideLoader();
    showSnackbar(
      "We are experiencing unusually high load, please try again later!",
      "error"
    );
    console.error("Error:", error);
  });

  socket.on("showPaymentOptions", ({ error }) => {
    hideLoader();
    togglePaymentOption(true);
    showSnackbar(error, "info");
  });

  socket.on("websiteDeployed", ({ slug }) => {
    const deployedUrl = `${window.location.protocol}//${window.location.host}/${slug}`;
    showSuccessOverlay(slug, deployedUrl);
  });

  socket.on("progress", ({ message }) => {
    document.getElementById("loaderText").innerHTML = message;
  });
}

function showLoader() {
  const loaderOverlay = document.getElementById("loaderOverlay");
  loaderOverlay.classList.remove("hidden");

  const lottieContainer = document.getElementById("lottieAnimation");
  // Clear existing animations
  lottieContainer.innerHTML = "";

  const lottieAnimation = document.createElement("lottie-player");
  lottieAnimation.setAttribute("src", "/assets/ship.json");
  lottieAnimation.setAttribute("background", "transparent");
  lottieAnimation.setAttribute("speed", "1");
  lottieAnimation.setAttribute("style", "width: 100%; height: 100%;");
  lottieAnimation.setAttribute("loop", "");
  lottieAnimation.setAttribute("autoplay", "");

  lottieContainer.appendChild(lottieAnimation);

  // const closeLoadingOverlayBtn = document.getElementById(
  //   "closeLoadingOverlayBtn"
  // );
  // closeLoadingOverlayBtn.addEventListener("click", () => {
  //   hideLoader();
  //   socket.emit("abortWebsiteCreation", { roomId });
  // });
}

const hideLoader = () => {
  const loaderOverlay = document.getElementById("loaderOverlay");
  loaderOverlay.classList.add("hidden");
  generateButton.disabled = false;
  generateButton.innerHTML = `
                <span>Generate my website</span>
                <i data-lucide="rocket" class="w-6 h-6"></i>
            `;
  lucide.createIcons();
};

function showSuccessOverlay(websiteName, websiteUrl) {
  hideLoader();

  const successOverlay = document.getElementById("successOverlay");
  successOverlay.classList.remove("hidden");

  const successText = document.getElementById("successText");
  successText.textContent = `Your website "${websiteName}" has been deployed successfully!`;

  const confettiAnimation = document.createElement("lottie-player");
  confettiAnimation.setAttribute(
    "src",
    "https://assets9.lottiefiles.com/packages/lf20_u4yrau.json"
  );
  confettiAnimation.setAttribute("background", "transparent");
  confettiAnimation.setAttribute("speed", "1");
  confettiAnimation.setAttribute("autoplay", "");

  // Set the style to cover the full screen while maintaining aspect ratio
  confettiAnimation.style.position = "absolute";
  confettiAnimation.style.width = "100%";
  confettiAnimation.style.height = "100%";
  confettiAnimation.style.objectFit = "cover";
  confettiAnimation.style.objectPosition = "center";

  const confettiContainer = document.getElementById("confettiAnimation");
  confettiContainer.appendChild(confettiAnimation);

  const copyLinkBtn = document.getElementById("copyLinkBtn");
  copyLinkBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(websiteUrl).then(() => {
      const copyLinkText = document.getElementById("copyLinkText");
      copyLinkText.textContent = "Copied!";
      setTimeout(() => {
        const copyLinkText = document.getElementById("copyLinkText");
        copyLinkText.textContent = "Copy link";
      }, 4000);
    });
  });

  const visitNowBtn = document.getElementById("visitNowBtn");
  visitNowBtn.addEventListener("click", () => {
    window.open(websiteUrl, "_blank");
  });

  // const shipNewBtn = document.getElementById("shipNewBtn");
  // shipNewBtn.addEventListener("click", () => {
  //   hideSuccessOverlay();
  // });

  const closeOverlayBtn = document.getElementById("closeOverlayBtn");
  closeOverlayBtn.addEventListener("click", hideSuccessOverlay);
}

function hideSuccessOverlay() {
  const successOverlay = document.getElementById("successOverlay");
  successOverlay.classList.add("hidden");
  hideLoader();
  window.location.reload();
}
function generateWebsite() {
  const requirements = requirementsTextarea.value.trim();
  if (requirements) {
    if (window.availableShips > 0 || localStorage.getItem("userProvidedKey")) {
      startWebsiteGeneration(requirements);
      return;
    }
    togglePaymentOption(true);
  } else {
    showSnackbar("Please enter your website requirements :)", "error");
  }
}

function togglePaymentOption(show = true) {
  const optionsDialog = document.getElementById("optionsDialog");
  if (show) {
    optionsDialog.classList.remove("hidden");
    setupPaymentDialogHandlers();
  } else {
    optionsDialog.classList.add("hidden");
  }
}

function setupPaymentDialogHandlers() {
  const addKeyOption = document.getElementById("addKeyOption");
  const closeDialog = document.getElementById("closeDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  const optionsContainer = document.getElementById("optionsContainer");
  const inputContainer = document.getElementById("inputContainer");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const submitButton = document.getElementById("submitButton");
  const razorpayContainer = document.getElementById("razorpayContainer");

  function showInputs(title, showApiKey = false) {
    dialogTitle.textContent = title;
    optionsContainer.classList.add("hidden");
    inputContainer.classList.remove("hidden");
    apiKeyInput.classList.toggle("hidden", !showApiKey);
    razorpayContainer.classList.add("hidden");
  }

  function showOptionsModal() {
    dialogTitle.textContent = "Choose an Option";
    optionsContainer.classList.remove("hidden");
    inputContainer.classList.add("hidden");
    apiKeyInput.value = "";
    razorpayContainer.classList.remove("hidden");
  }

  addKeyOption.addEventListener("click", () => {
    showInputs("Add your own Anthropic key", true);
  });

  closeDialog.addEventListener("click", () => {
    if (inputContainer.classList.contains("hidden")) {
      togglePaymentOption(false);
    } else {
      showOptionsModal();
    }
  });

  submitButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value;
    if (apiKey) {
      console.log("Submitting API key:", apiKey);
      socket.emit("anthropicKey", apiKey);
    }
  });

  showOptionsModal();
  lucide.createIcons();
}

socket.on("apiKeyStatus", (response) => {
  if (response.success) {
    showSnackbar(response.message, "success");
    optionsDialog.classList.add("hidden");
    localStorage.setItem("anthropicKey", response.key);
    // todo do next stuff
  } else {
    showSnackbar(response.message, "error");
  }
});

function startWebsiteGeneration(requirements) {
  // Reset the conversation
  conversation = [];
  showLoader();
  generateButton.disabled = true;
  generateButton.innerHTML = `
    <svg class="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Starting website creation...
  `;

  sendMessage(requirements, "prompt");
}

generateButton.addEventListener("click", generateWebsite);

requirementsTextarea.addEventListener("input", function () {
  generateButton.disabled = this.value.trim().length === 0;
});
