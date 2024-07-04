// Function to load HTML content
async function loadHTML(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Failed to load HTML from ${url}:`, error);
    return "<p>Error loading component</p>";
  }
}

// Header Component
class HeaderComponent extends HTMLElement {
  async connectedCallback() {
    const content = await loadHTML("components/app-header.html");
    this.innerHTML = content;
  }
}

// Card Container Component
class CardContainerComponent extends HTMLElement {
  async connectedCallback() {
    const content = await loadHTML("components/card-container-component.html");
    this.innerHTML = content;
  }
}

// Ship Form Component
class ShipFormComponent extends HTMLElement {
  async connectedCallback() {
    const content = await loadHTML("components/ship-form-component.html");
    this.innerHTML = content;
  }
}

// Recently Shipped Component
class RecentlyShippedComponent extends HTMLElement {
  async connectedCallback() {
    const content = await loadHTML(
      "components/recently-shipped-component.html"
    );
    this.innerHTML = content;
  }
}

// Footer Component
class FooterComponent extends HTMLElement {
  async connectedCallback() {
    const content = await loadHTML("components/app-footer.html");
    this.innerHTML = content;

    // Add event listener to the dropdown toggle
    const dropdownToggle = this.querySelector("#supportPoliciesToggle");
    const dropdownMenu = this.querySelector("#supportPoliciesMenu");

    if (dropdownToggle && dropdownMenu) {
      dropdownToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        dropdownMenu.classList.toggle("hidden");
        // Toggle the arrow direction
        const svg = dropdownToggle.querySelector("svg");
        svg.classList.toggle("rotate-180");
      });

      // Close the dropdown when clicking outside
      document.addEventListener("click", () => {
        dropdownMenu.classList.add("hidden");
        // Reset the arrow direction
        const svg = dropdownToggle.querySelector("svg");
        svg.classList.remove("rotate-180");
      });
    }

    // Add event listeners to the footer links
    const footerLinks = this.querySelectorAll("#supportPoliciesMenu a");
    footerLinks.forEach((link) => {
      link.addEventListener("click", this.handleFooterLinkClick.bind(this));
    });
  }

  handleFooterLinkClick(event) {
    // Don't prevent default behavior
    const href = event.target.getAttribute("href");
    console.log(`Opening page: ${href}`);

    // Hide the dropdown after clicking a link
    this.querySelector("#supportPoliciesMenu").classList.add("hidden");
    // Reset the arrow direction
    const svg = this.querySelector("#supportPoliciesToggle svg");
    svg.classList.remove("rotate-180");

    // If you want to ensure the link opens in a new tab, you can do:
    // window.open(href, '_blank');
  }
}

// Loader Overlay Component
class LoaderOverlayComponent extends HTMLElement {
  async connectedCallback() {
    const content = await loadHTML("components/loader-overlay-component.html");
    this.innerHTML = content;
  }
}

// Success Overlay Component
class SuccessOverlayComponent extends HTMLElement {
  async connectedCallback() {
    const content = await loadHTML("components/success-overlay-component.html");
    this.innerHTML = content;
  }
}

// Dialog Component
class DialogComponent extends HTMLElement {
  async connectedCallback() {
    const content = await loadHTML("components/dialog-component.html");
    this.innerHTML = content;
  }
}

// Login Form Container
class LoginFormContainer extends HTMLElement {
  async connectedCallback() {
    const content = await loadHTML("components/login-form-container.html");
    this.innerHTML = content;
  }
}

// Register custom elements
customElements.define("header-component", HeaderComponent);
customElements.define("card-container-component", CardContainerComponent);
customElements.define("ship-form-component", ShipFormComponent);
customElements.define("recently-shipped-component", RecentlyShippedComponent);
customElements.define("footer-component", FooterComponent);
customElements.define("loader-overlay-component", LoaderOverlayComponent);
customElements.define("success-overlay-component", SuccessOverlayComponent);
customElements.define("dialog-component", DialogComponent);
customElements.define("login-form-container", LoginFormContainer);

Promise.all([
  customElements.whenDefined("header-component"),
  customElements.whenDefined("card-container-component"),
  customElements.whenDefined("ship-form-component"),
  customElements.whenDefined("recently-shipped-component"),
  customElements.whenDefined("footer-component"),
  customElements.whenDefined("loader-overlay-component"),
  customElements.whenDefined("success-overlay-component"),
  customElements.whenDefined("dialog-component"),
  customElements.whenDefined("login-form-container"),
]).then(() => {
  // Load other scripts after components are defined
  const authScript = document.createElement("script");
  authScript.src = "scripts/auth.js";
  document.head.appendChild(authScript);

  const chatScript = document.createElement("script");
  chatScript.src = "scripts/chat.js";
  document.head.appendChild(chatScript);

  // Initialize Razorpay payment button
  const razorpayScript = document.createElement("script");
  razorpayScript.src = "https://checkout.razorpay.com/v1/payment-button.js";
  razorpayScript.setAttribute("data-payment_button_id", "pl_OTLsws336UXJ5J");
  razorpayScript.async = true;

  // Wait for the dialog component to be fully loaded
  customElements.whenDefined("dialog-component").then(() => {
    const observer = new MutationObserver((mutations, obs) => {
      const razorpayContainer = document.getElementById("razorpayContainer");
      if (razorpayContainer && razorpayContainer.offsetParent !== null) {
        const form = document.createElement("form");
        form.appendChild(razorpayScript);
        razorpayContainer.appendChild(form);
        obs.disconnect(); // Stop observing once we've added the script
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
});
