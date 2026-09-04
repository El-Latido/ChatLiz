const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const find = `{Object.entries(
                                        Object.values(m.reactions).reduce(
                                          (acc, val) => {
                                            acc[val] = (acc[val] || 0) + 1;
                                            return acc;
                                          },
                                          {} as any,
                                        ),
                                      ).map(([emoji, count]: any) => (
                                        <div
                                          key={emoji}
                                          className="bg-[#1A2035]/80 border border-[#D4AF37]/30 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                                        >
                                          <span>{emoji}</span>
                                          <span className="text-white/70 font-medium">
                                            {count}
                                          </span>
                                        </div>
                                      ))}`;

const replace = `{Object.entries(m.reactions).map(([emoji, count]: any) => (
                                        <div
                                          key={emoji}
                                          className="bg-[#1A2035]/80 border border-[#D4AF37]/30 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                                        >
                                          <span>{emoji}</span>
                                          <span className="text-white/70 font-medium">
                                            {count}
                                          </span>
                                        </div>
                                      ))}`;

if (code.includes(find)) {
    fs.writeFileSync('src/App.tsx', code.replace(find, replace));
    console.log("Replaced 1");
} else {
    console.log("Find 1 not found");
}

const find2 = `{Object.entries(
                                            Object.values(m.reactions).reduce(
                                              (acc, val) => {
                                                acc[val] = (acc[val] || 0) + 1;
                                                return acc;
                                              },
                                              {} as any,
                                            ),
                                          ).map(([emoji, count]: any) => (
                                            <div
                                              key={emoji}
                                              className="bg-[#1A2035]/80 border border-[#D4AF37]/30 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                                            >
                                              <span>{emoji}</span>
                                              <span className="text-white/70 font-medium">
                                                {count}
                                              </span>
                                            </div>
                                          ))}`;

const replace2 = `{Object.entries(m.reactions).map(([emoji, count]: any) => (
                                            <div
                                              key={emoji}
                                              className="bg-[#1A2035]/80 border border-[#D4AF37]/30 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                                            >
                                              <span>{emoji}</span>
                                              <span className="text-white/70 font-medium">
                                                {count}
                                              </span>
                                            </div>
                                          ))}`;

if (code.includes(find2)) {
    fs.writeFileSync('src/App.tsx', code.replace(find2, replace2));
    console.log("Replaced 2");
}

