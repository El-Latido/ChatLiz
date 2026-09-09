const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add expandedImage state
code = code.replace(
  /const \[replyingTo, setReplyingTo\] = useState<any>\(null\);/,
  `const [replyingTo, setReplyingTo] = useState<any>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);`
);

// 2. Change image click handler
code = code.replace(
  /onClick=\{\(\) => setReplyingTo\(m\)\}\s*alt="adjunto"/g,
  `onClick={() => setExpandedImage(m.image)}\n                                          alt="adjunto"`
);

code = code.replace(
  /onClick=\{\(\) => setReplyingTo\(msg\)\}\s*alt="adjunto"/g,
  `onClick={() => setExpandedImage(msg.image)}\n                                          alt="adjunto"`
);

// Add it for Global Chat too! 
// Let's replace all onClick={() => setReplyingTo(m)} inside m.image rendering
code = code.replace(
    /onClick=\{\(\) => setReplyingTo\(m\)\}/g,
    `onClick={() => m.image ? setExpandedImage(m.image) : setReplyingTo(m)}`
);

// 3. Render Image Modal at the end of the return
const modalMarkup = `
      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[99999] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setExpandedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 p-3 rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
          >
            <X size={24} />
          </button>
          <img 
            src={expandedImage} 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm" 
            onClick={(e) => e.stopPropagation()}
            alt="expanded"
          />
        </div>
      )}
    </div>
  );
}

export default App;
`;

code = code.replace(/    <\/div>\n  \);\n\}\n\nexport default App;/g, modalMarkup);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for Expanded Images");
