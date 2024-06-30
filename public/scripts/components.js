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
    const content = await loadHTML("components/footer-component.html");
    this.innerHTML = content;
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
});
