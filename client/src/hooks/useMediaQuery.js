import { useState, useEffect } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set the initial value
    setMatches(media.matches);

    // Define our event listener
    const listener = (e) => setMatches(e.matches);

    // Add the listener to begin watching for changes
    media.addEventListener("change", listener);

    // Remove the listener when the component unmounts
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
