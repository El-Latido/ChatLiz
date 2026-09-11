const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetContainer = /\{\/\* Chat Feed \*\/\}[\s]*<div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 space-y-1.5 scrollbar-thin">/;

const newContainer = `{/* Chat Feed */}
                <div id="chat-messages-container" className="chat-messages-container flex-1 overflow-y-auto px-2 md:px-4 py-2 space-y-1.5 scrollbar-thin transition-opacity duration-300 data-[paused=true]:opacity-30 data-[paused=true]:pointer-events-none">`;

if(targetContainer.test(code)) {
    code = code.replace(targetContainer, newContainer);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Updated chat container ID");
} else {
    console.log("Chat container regex failed");
}
