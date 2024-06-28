let conversation = [];
let roomId = null; // Store room ID

const socket = io(); // Connect to the server

const requirementsTextarea = document.getElementById("user-input");
const generateButton = document.getElementById("generateButton");

socket.on("connect", () => {
  if (!roomId) {
    roomId = "room_" + Math.random().toString(36).substr(2, 9); // Generate a random room ID only once
    socket.emit("joinRoom", roomId);
  }
});

function sendMessage(message) {
  conversation.push({ role: "user", content: message });

  socket.emit("sendMessage", { conversation, roomId, message });

  socket.on("newMessage", ({ conversation: messages }) => {
    if (messages) {
      conversation = messages;
    }
  });

  socket.on("websiteDeployed", ({ data: { deployedUrl, websiteName } }) => {
    showSuccessOverlay(websiteName, deployedUrl);
  });

  socket.on("progress", ({ data: { message } }) => {
    document.getElementById("loaderText").innerHTML = message;
  });
}

function showLoader() {
  const loaderOverlay = document.getElementById("loaderOverlay");
  loaderOverlay.classList.remove("hidden");

  const lottieAnimation = document.createElement("lottie-player");
  lottieAnimation.setAttribute("src", "/assets/ship.json");
  lottieAnimation.setAttribute("background", "transparent");
  lottieAnimation.setAttribute("speed", "1");
  lottieAnimation.setAttribute("style", "width: 100%; height: 100%;");
  lottieAnimation.setAttribute("loop", "");
  lottieAnimation.setAttribute("autoplay", "");

  const lottieContainer = document.getElementById("lottieAnimation");
  lottieContainer.appendChild(lottieAnimation);
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
      alert("Link copied to clipboard!");
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
  document.getElementById("user-input").value = "";
  hideLoader();
  window.location.reload();
}
function generateWebsite() {
  const requirements = requirementsTextarea.value.trim();
  if (requirements) {
    showLoader();
    generateButton.disabled = true;
    generateButton.innerHTML = `
              <svg class="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Starting website creation...
          `;

    sendMessage(requirements);
  } else {
    alert("Please enter your website requirements first.");
  }
}

generateButton.addEventListener("click", generateWebsite);

requirementsTextarea.addEventListener("input", function () {
  generateButton.disabled = this.value.trim().length === 0;
});
