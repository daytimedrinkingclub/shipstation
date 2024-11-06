const cheerio = require("cheerio");

class HTMLRefiner {
  constructor(html) {
    this.$ = cheerio.load(html, {
      xmlMode: false,
      decodeEntities: false,
    });
    this.originalHtml = html;
  }

  async applyChange(modification) {
    const { type, selector, content, position, attributes } = modification;

    switch (type) {
      case "add":
        this.addContent(selector, content, position);
        break;

      case "update":
        this.updateContent(selector, content);
        break;

      case "remove":
        this.removeContent(selector);
        break;

      case "style":
        this.updateStyles(selector, attributes);
        break;

      default:
        throw new Error(`Unknown modification type: ${type}`);
    }
  }

  addContent(selector, content, position = "after") {
    const element = this.$(selector);
    if (!element.length) {
      throw new Error(`Selector not found: ${selector}`);
    }

    switch (position) {
      case "before":
        element.before(content);
        break;
      case "after":
        element.after(content);
        break;
      case "append":
        element.append(content);
        break;
      case "prepend":
        element.prepend(content);
        break;
      case "replace":
        element.replaceWith(content);
        break;
      default:
        throw new Error(`Invalid position: ${position}`);
    }
  }

  updateContent(selector, content) {
    const element = this.$(selector);
    if (!element.length) {
      throw new Error(`Selector not found: ${selector}`);
    }
    element.html(content);
  }

  removeContent(selector) {
    const element = this.$(selector);
    if (!element.length) {
      throw new Error(`Selector not found: ${selector}`);
    }
    element.remove();
  }

  updateStyles(selector, attributes) {
    const element = this.$(selector);
    if (!element.length) {
      throw new Error(`Selector not found: ${selector}`);
    }

    if (attributes.class) {
      const { add = [], remove = [] } = attributes.class;

      // Remove classes
      remove.forEach((className) => {
        element.removeClass(className);
      });

      // Add classes
      add.forEach((className) => {
        element.addClass(className);
      });
    }

    // Handle other attributes
    Object.entries(attributes).forEach(([attr, value]) => {
      if (attr !== "class") {
        element.attr(attr, value);
      }
    });
  }

  getHTML() {
    return this.$.html();
  }

  validateSelector(selector) {
    try {
      const element = this.$(selector);
      return element.length > 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = HTMLRefiner;
