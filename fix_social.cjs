const fs = require('fs');
let content = fs.readFileSync('src/components/social/SocialFeed.tsx', 'utf8');

content = content.replace(/interface SocialFeedProps \{\n  user: UserObj;\n\}\n\ninterface SocialFeedProps \{\n  user: UserObj;\n  onClose\?: \(\) => void;\n\}/g, 'interface SocialFeedProps {\n  user: UserObj;\n  onClose?: () => void;\n}');

// Add the back button to header
const headerTarget = '<h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-[InstaFont,sans-serif]">\n          LizGram\n        </h1>';

const headerReplacement = `<div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
          )}
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-[InstaFont,sans-serif]">
            LizGram
          </h1>
        </div>`;
content = content.replace(headerTarget, headerReplacement);

fs.writeFileSync('src/components/social/SocialFeed.tsx', content);
