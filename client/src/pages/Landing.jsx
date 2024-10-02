import { useEffect, useState } from 'react';

const Landing = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/landing.html')
      .then(response => response.text())
      .then(html => setContent(html));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

export default Landing;