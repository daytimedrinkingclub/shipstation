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
        return '<p>Error loading component</p>';
    }
}

// Header Component
class HeaderComponent extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/header-component.html');
        this.innerHTML = content;
    }
}

// Ship Background Component
class ShipBackgroundComponent extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/ship-background-component.html');
        this.innerHTML = content;
    }
}

// Card Container Component
class CardContainerComponent extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/card-container-component.html');
        this.innerHTML = content;
    }
}

// Ship Form Component
class ShipFormComponent extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/ship-form-component.html');
        this.innerHTML = content;
    }
}

// Recently Shipped Component
class RecentlyShippedComponent extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/recently-shipped-component.html');
        this.innerHTML = content;
    }
}

// Footer Component
class FooterComponent extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/footer-component.html');
        this.innerHTML = content;
    }
}

// Loader Overlay Component
class LoaderOverlayComponent extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/loader-overlay-component.html');
        this.innerHTML = content;
    }
}

// Success Overlay Component
class SuccessOverlayComponent extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/success-overlay-component.html');
        this.innerHTML = content;
    }
}

// Register custom elements
customElements.define('header-component', HeaderComponent);
customElements.define('ship-background-component', ShipBackgroundComponent);
customElements.define('card-container-component', CardContainerComponent);
customElements.define('ship-form-component', ShipFormComponent);
customElements.define('recently-shipped-component', RecentlyShippedComponent);
customElements.define('footer-component', FooterComponent);
customElements.define('loader-overlay-component', LoaderOverlayComponent);
customElements.define('success-overlay-component', SuccessOverlayComponent);