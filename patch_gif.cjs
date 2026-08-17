const fs = require('fs');
let code = fs.readFileSync('src/components/EmojiGifPicker.tsx', 'utf8');

code = code.replace(
  `useEffect(() => {
    if (activeTab === 'gif' && gifQuery.trim()) {
      const delay = setTimeout(() => {
        searchGifs(gifQuery);
      }, 500);
      return () => clearTimeout(delay);
    } else if (activeTab === 'gif' && !gifQuery.trim()) {
      searchGifs('anime'); // Default search
    }
  }, [gifQuery, activeTab]);

  const searchGifs = async (q: string) => {
    setLoading(true);
    try {
      const apiKey = 'dc6zaTOxFJmzC'; // Public Giphy test key
      const res = await fetch(\`https://api.giphy.com/v1/gifs/search?api_key=\${apiKey}&q=\${encodeURIComponent(q)}&limit=15\`);
      const data = await res.json();
      if (data.data) {
        setGifs(data.data.map((g: any) => g.images.fixed_height.url));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };`,
  `useEffect(() => {
    const controller = new AbortController();
    
    if (activeTab === 'gif' && gifQuery.trim()) {
      const delay = setTimeout(() => {
        searchGifs(gifQuery, controller.signal);
      }, 500);
      return () => {
        clearTimeout(delay);
        controller.abort();
      };
    } else if (activeTab === 'gif' && !gifQuery.trim()) {
      searchGifs('anime', controller.signal); // Default search
      return () => controller.abort();
    }
    return () => controller.abort();
  }, [gifQuery, activeTab]);

  const searchGifs = async (q: string, signal: AbortSignal) => {
    setLoading(true);
    try {
      const apiKey = 'dc6zaTOxFJmzC'; // Public Giphy test key
      const res = await fetch(\`https://api.giphy.com/v1/gifs/search?api_key=\${apiKey}&q=\${encodeURIComponent(q)}&limit=15\`, { signal });
      const data = await res.json();
      if (data.data) {
        setGifs(data.data.map((g: any) => g.images.fixed_height.url));
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('Petición cancelada por el usuario o cambio de vista.');
        return;
      }
      console.error('Error real:', e);
    } finally {
      setLoading(false);
    }
  };`
);

fs.writeFileSync('src/components/EmojiGifPicker.tsx', code);
