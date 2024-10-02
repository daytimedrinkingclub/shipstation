// fake loader for next/image
export default function imageLoader({ src, width, quality }) {
  return `${src}?w=${width}&q=${quality || 75}`;
}
