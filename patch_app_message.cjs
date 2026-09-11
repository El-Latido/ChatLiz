const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                                const nameColor = isElizabeth ? "text-pink-400" : "text-cyan-300";
                                const textColor = "text-white/90";
                                const timeColor = "text-white/40";`;

const replacement = `                                const nColor = senderInfo?.nameColor || (isElizabeth ? "#F472B6" : "#67E8F9");
                                const nNeon = senderInfo?.nameNeon || "none";
                                const nRainbow = senderInfo?.nameRainbow;
                                const nNeon1 = senderInfo?.nameNeonColor1 || "#00f3ff";
                                const nNeon2 = senderInfo?.nameNeonColor2 || "#ff00ff";
                                const nFont = senderInfo?.nameFont && senderInfo.nameFont !== 'default' ? senderInfo.nameFont : "inherit";
                                const cFont = senderInfo?.chatFont && senderInfo.chatFont !== 'default' ? senderInfo.chatFont : "inherit";
                                const cColorStyle = senderInfo?.chatColorStyle || "default";
                                
                                const textColor = cColorStyle === 'colorful' ? nColor : "rgba(255, 255, 255, 0.9)";
                                const timeColor = "rgba(255, 255, 255, 0.4)";
                                
                                let nameStyle: React.CSSProperties = { color: nColor, fontFamily: nFont };
                                if (nNeon !== 'none') {
                                    if (nRainbow) {
                                       nameStyle.textShadow = \`0 0 5px \${nNeon1}, 0 0 10px \${nNeon1}, 0 0 20px \${nNeon2}, 0 0 40px \${nNeon2}\`;
                                    } else {
                                       nameStyle.textShadow = \`0 0 5px \${nNeon1}, 0 0 10px \${nNeon1}, 0 0 20px \${nNeon1}\`;
                                    }
                                }`;

code = code.replace(target, replacement);

const target2 = `                                    {!isMe && (
                                      <span
                                        className={\`font-semibold \${nameColor} text-[13px] mb-0.5 cursor-pointer hover:text-white transition-colors tracking-wide\`}
                                        onClick={() => setInputValue((prev) => prev + \`@\${m.sender} \`)}
                                      >
                                        {m.sender}
                                      </span>
                                    )}`;

const replacement2 = `                                    {!isMe && (
                                      <span
                                        className={\`font-semibold text-[13px] mb-0.5 cursor-pointer hover:brightness-150 transition-all tracking-wide\`}
                                        style={nameStyle}
                                        onClick={() => setInputValue((prev) => prev + \`@\${m.sender} \`)}
                                      >
                                        {m.sender}
                                      </span>
                                    )}`;

const target3 = `                                        className={\`\${textColor} text-[14px] leading-snug flex-1 cursor-pointer hover:bg-black/5 rounded px-1 transition-colors\`}
                                        onClick={() => m.image ? setExpandedImage(m.image) : setReplyingTo(m)}
                                      >
                                        <TranslatedText originalText={m.text} senderLanguage={m.senderLanguage} userLanguage={user.pais_idioma || 'es'} />
                                      </span>`;
                                      
const replacement3 = `                                        className={\`text-[14px] leading-snug flex-1 cursor-pointer hover:bg-black/5 rounded px-1 transition-colors\`}
                                        style={{ color: textColor, fontFamily: cFont }}
                                        onClick={() => m.image ? setExpandedImage(m.image) : setReplyingTo(m)}
                                      >
                                        <TranslatedText originalText={m.text} senderLanguage={m.senderLanguage} userLanguage={user.pais_idioma || 'es'} />
                                      </span>`;

code = code.replace(target2, replacement2);
code = code.replace(target3, replacement3);

// In the reply SVG block: \${nameColor} -> \`\${nColor}\`
const target4 = `className={\`opacity-0 group-hover:opacity-100 transition-opacity \${nameColor} hover:opacity-80 p-1\`}`;
const replacement4 = `className={\`opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-80 p-1\`} style={{ color: nColor }}`;
code = code.replace(target4, replacement4);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx messages");
