import { useEffect } from "react";

const ChatWidget = ({ user, onClose }) => {
  useEffect(() => {
    // Define Chatwoot settings
    window.chatwootSettings = {
      hideMessageBubble: true, // Hide the default message bubble
      position: "right", // Position the widget on the right
      locale: "en", // Set the language to English
      type: "expanded_bubble", // Use the expanded bubble type
      showPopoutButton: false, // Disable the popout button
    };

    (function (d, t) {
      var BASE_URL = "https://chatwoot.badalhibadal.com";
      var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
      g.src = BASE_URL + "/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      s.parentNode.insertBefore(g, s);
      g.onload = function () {
        window.chatwootSDK.run({
          websiteToken: "fTtARiySzQBu1etch6QJnKDE",
          baseUrl: BASE_URL,
        });

        window.addEventListener("chatwoot:ready", function () {
          if (user) {
            window.$chatwoot.setUser(user.id, {
              email: user.email,
            });
          }

          window.$chatwoot.on("widget:closed", onClose);
        });
        // Open the widget immediately
        window.$chatwoot.toggle("open");
      };
    })(document, "script");

    return () => {
      onClose();
    };
  }, [user, onClose]);

  // This component doesn't render anything visible
  return null;
};

export default ChatWidget;
