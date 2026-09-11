const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetHeaderBtn = /<button[\s]*onClick=\{\(\) => setActiveChat\("global"\)\}[\s]*className="text-sm font-bold text-white\/80 hover:text-white bg-white\/5 hover:bg-white\/10 p-2 rounded-xl transition-colors border border-white\/20 flex items-center justify-center"[\s]*title="Chat Global"[\s]*>[\s]*<Globe size=\{20\} \/>[\s]*<\/button>/;

const newHeaderBtn = `<div className="flex items-center gap-2">
                        {!aiChar && isOnline && (
                          <button
                            onClick={() => {
                               socket.emit("start_call", activeChat);
                               setOutgoingCall({ username: activeChat, profilePic: avatarUrl });
                            }}
                            className="p-2 rounded-xl transition-colors border border-green-500/20 text-green-400 bg-green-500/10 hover:bg-green-500/20"
                            title="Llamar"
                          >
                            <PhoneCall size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => setActiveChat("global")}
                          className="text-sm font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors border border-white/20 flex items-center justify-center"
                          title="Chat Global"
                        >
                          <Globe size={20} />
                        </button>
                      </div>`;

if(targetHeaderBtn.test(code)) {
    code = code.replace(targetHeaderBtn, newHeaderBtn);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Updated Call Button");
} else {
    console.log("Call Button regex failed");
}
