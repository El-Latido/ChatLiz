const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      {/* Chat Background Audio */}
      {chatBgAudio && (`;

const replacement = `      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <button 
              className="absolute -top-12 right-0 md:-right-12 text-white/50 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black transition-colors"
              onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
            >
              <X size={32} />
            </button>
            <img 
              referrerPolicy="no-referrer"
              src={expandedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      {/* Chat Background Audio */}
      {chatBgAudio && (`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched Expanded Image Modal");
