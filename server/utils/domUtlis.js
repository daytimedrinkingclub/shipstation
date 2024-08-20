const { JSDOM } = require("jsdom");
const fs = require("fs").promises;
const path = require("path");

const serializeDom = async (filePath, baseUrl) => {
  const indexHtml = await fs.readFile(filePath, "utf-8");
  const dom = new JSDOM(indexHtml, {
    url: baseUrl,
    runScripts: "dangerously",
    resources: "usable",
  });

  const document = dom.window.document;

  // Load and execute all scripts
  const scripts = document.getElementsByTagName("script");
  for (let script of scripts) {
    if (script.src) {
      const scriptContent = await fs.readFile(
        path.join(path.dirname(filePath), new URL(script.src).pathname),
        "utf-8"
      );
      dom.window.eval(scriptContent);
    } else {
      dom.window.eval(script.textContent);
    }
  }

  // Wait for custom elements to be defined and their content to be loaded
  await Promise.all(
    Array.from(document.body.getElementsByTagName("*"))
      .filter((el) => el.tagName.includes("-"))
      .map(async (el) => {
        await customElements.whenDefined(el.tagName.toLowerCase());
        const component = dom.window.document.createElement(el.tagName);
        await new Promise((resolve) => {
          component.addEventListener("load", resolve, { once: true });
          setTimeout(resolve, 1000); // Timeout in case the load event doesn't fire
        });
      })
  );

  return dom.serialize();
};

module.exports = {
  serializeDom,
};
