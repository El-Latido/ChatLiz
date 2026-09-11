const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetBubbleCode = /const defaultBubbleColor = isMe \? "rgba\(6, 182, 212, 0\.15\)" : "rgba\(255, 255, 255, 0\.05\)";[\s\S]*?\{m\.sender\}[\s\S]*?<\/span>[\s\S]*?\{m\.replyTo && \([\s\S]*?\}\)[\s\S]*?<TranslatedText originalText=\{m\.text\}/;

const newBubbleCode = `const defaultBubbleColor = isMe ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.05)";
                                const defaultTextColor = "#E0E2E5";
                                const defaultBorder = isMe ? "rgba(6, 182, 212, 0.3)" : "rgba(255, 255, 255, 0.1)";
                                const defaultShape = isMe ? "rounded-[20px] rounded-tr-[4px]" : "rounded-[20px] rounded-tl-[4px]";
                                
                                const bColor = senderInfo?.bubbleColor || (m.sender === "Elizabeth" ? "transparent" : defaultBubbleColor);
                                const bBorder = senderInfo?.bubbleBorder || (m.sender === "Elizabeth" ? "rgba(255,255,255,0.1)" : defaultBorder);
                                const bShape = senderInfo?.bubbleShape || (m.sender === "Elizabeth" ? "rounded-[20px]" : defaultShape);
                                const bTexture = senderInfo?.bubbleTexture || (m.sender === "Elizabeth" ? "none" : "none");
                                const nameFontClass = senderInfo?.nameFont || "font-sans";
                                const chatFontClass = senderInfo?.chatFont || "font-sans";
                                const nameColorVal = senderInfo?.nameColor || (m.sender === "Elizabeth" ? "#f472b6" : "#67e8f9");
                                const nameNeonVal = senderInfo?.nameNeon || "";
                                
                                const isElizabeth = m.sender === "Elizabeth";
                                let shapeClasses = bShape;
                                let textureClasses = "";
                                let extraStyles: React.CSSProperties = {
                                     backgroundColor: bTexture === 'glass' ? 'rgba(255,255,255,0.1)' : 
                                                      bTexture === 'none' ? bColor :
                                                      bTexture === 'glow' ? bColor :
                                                      bTexture === 'cyberpunk' ? '#000000' :
                                                      bTexture === 'matrix' ? '#001a00' :
                                                      bTexture === 'holo' ? 'rgba(0, 255, 255, 0.2)' :
                                                      bTexture === 'pixel' ? '#0000ff' :
                                                      bTexture === 'kawaii' ? '#ffb6c1' :
                                                      bTexture === 'fire' ? '#ff4500' :
                                                      bTexture === 'ice' ? '#e0ffff' :
                                                      bTexture === 'gold' ? '#ffd700' :
                                                      bTexture === 'rainbow' ? 'transparent' : bColor,
                                     backdropFilter: bTexture === 'glass' || bTexture === 'holo' ? 'blur(10px)' : 'blur(10px)',
                                     boxShadow: bTexture === 'glow' ? \`0 0 15px \${bColor}, inset 0 0 10px \${bColor}\` : 
                                                bTexture === 'cyberpunk' ? '3px 3px 0 #00ffff, -3px -3px 0 #ff00ff' : 
                                                bTexture === 'matrix' ? '0 0 10px #00ff00' : 
                                                (isMe ? "0 4px 20px rgba(6,182,212,0.15)" : "0 4px 20px rgba(0,0,0,0.2)"),
                                     color: bTexture === 'kawaii' || bTexture === 'ice' || bTexture === 'gold' ? 'black' : 
                                            bTexture === 'matrix' ? '#00ff00' : 'white',
                                     backgroundImage: bTexture === 'rainbow' ? 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)' : 'none',
                                     fontFamily: bTexture === 'pixel' ? '"Courier New", monospace' : undefined,
                                     borderWidth: bTexture === 'pixel' ? '4px' : '1px',
                                     borderColor: bTexture === 'pixel' ? 'black' : (bBorder !== "transparent" ? (bBorder.includes('border-') ? undefined : bBorder) : defaultBorder)
                                };
                                
                                if (bTexture === "glass") textureClasses = "backdrop-blur-md bg-opacity-30 border-white/20";
                                if (bTexture === "glow") textureClasses = "shadow-[0_0_15px_rgba(255,255,255,0.2)]";
                                
                                const timeColor = (bTexture === 'kawaii' || bTexture === 'ice' || bTexture === 'gold') ? "text-black/50" : "text-white/40";
                                
                                return (
                                  <div 
                                     className={\`\${shapeClasses} \${textureClasses} \${bBorder.includes('border-') ? bBorder : ''} px-4 py-2.5 shadow-sm flex flex-col relative min-w-[120px] transition-all\`}
                                    style={extraStyles}
                                  >
                                    {!isMe && (
                                      <span
                                        className={\`font-bold text-[13px] mb-0.5 cursor-pointer hover:opacity-80 transition-opacity tracking-wide \${nameFontClass} \${nameNeonVal === 'rainbow' ? 'animate-rainbow-text' : ''}\`}
                                        style={{
                                           color: nameNeonVal === 'rainbow' ? 'transparent' : nameColorVal,
                                           backgroundClip: nameNeonVal === 'rainbow' ? 'text' : 'initial',
                                           WebkitBackgroundClip: nameNeonVal === 'rainbow' ? 'text' : 'initial',
                                           backgroundImage: nameNeonVal === 'rainbow' ? 'linear-gradient(to right, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #800080)' : 'none',
                                           textShadow: nameNeonVal && nameNeonVal !== 'rainbow' ? \`0 0 10px \${nameNeonVal}, 0 0 20px \${nameNeonVal}\` : 'none'
                                        }}
                                        onClick={() => setInputValue((prev) => prev + \`@\${m.sender} \`)}
                                      >
                                        {m.sender}
                                      </span>
                                    )}
                                    {m.replyTo && (
                                      <div className={\`bg-black/10 border-l-2 border-[#5A52A5]/50 px-2 py-1 mb-1 rounded text-xs italic flex flex-col \${timeColor}\`}>
                                        <span className="font-bold opacity-80">{m.replyTo.sender}</span>
                                        <span className="truncate opacity-70"><TranslatedText originalText={m.replyTo.text} senderLanguage={m.replyTo.senderLanguage} userLanguage={user.pais_idioma || 'es'} /></span>
                                      </div>
                                    )}
                                    <div className="flex flex-wrap items-end justify-between gap-2">
                                      <span 
                                        className={\`text-[14px] leading-snug flex-1 cursor-pointer hover:bg-black/5 rounded px-1 transition-colors \${chatFontClass}\`}
                                        style={{ color: extraStyles.color }}
                                        onClick={() => m.image ? setExpandedImage(m.image) : setReplyingTo(m)}
                                      >
                                        <TranslatedText originalText={m.text}`;

code = code.replace(targetBubbleCode, newBubbleCode);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx Bubbles");
