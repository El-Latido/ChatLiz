const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetBubble = `                      return (
                        <div
                          key={m.id || idx}
                          className="relative flex justify-start px-1 md:px-2 group"`;

const replacementBubble = `                      return (
                        <div
                          key={m.id || idx}
                          className={\`relative flex \${isMe ? 'justify-end' : 'justify-start'} px-1 md:px-2 group\`}
                          style={{ marginBottom: '8px' }}`;

code = code.replace(targetBubble, replacementBubble);


const targetInner = `                          <div className="flex gap-2 w-full mt-1.5 group">
                            <div
                              className="relative shrink-0 mt-1 cursor-pointer"`;

const replacementInner = `                          <div className={\`flex gap-3 max-w-[85%] mt-1.5 group \${isMe ? 'flex-row-reverse' : ''}\`}>
                            <div
                              className="relative shrink-0 mt-1 cursor-pointer"`;

code = code.replace(targetInner, replacementInner);


const targetColors = `                            {(() => {
                                const bColor = senderInfo?.bubbleColor || (m.sender === "Elizabeth" ? "transparent" : "#F2E3C6");
                                const bBorder = senderInfo?.bubbleBorder || (m.sender === "Elizabeth" ? "#D4AF3740" : "transparent");
                                const bShape = senderInfo?.bubbleShape || (m.sender === "Elizabeth" ? "rounded-2xl" : "rounded-2xl rounded-tr-sm");
                                const bTexture = senderInfo?.bubbleTexture || (m.sender === "Elizabeth" ? "none" : "none");
                                const isElizabeth = m.sender === "Elizabeth";`;

const replacementColors = `                            {(() => {
                                const defaultBubbleColor = isMe ? "#1E1F24" : "#151619";
                                const defaultTextColor = "#E0E2E5";
                                const defaultBorder = "rgba(255,255,255,0.05)";
                                const defaultShape = isMe ? "rounded-[20px] rounded-tr-[4px]" : "rounded-[20px] rounded-tl-[4px]";
                                
                                const bColor = senderInfo?.bubbleColor || (m.sender === "Elizabeth" ? "transparent" : defaultBubbleColor);
                                const bBorder = senderInfo?.bubbleBorder || (m.sender === "Elizabeth" ? "rgba(255,255,255,0.1)" : defaultBorder);
                                const bShape = senderInfo?.bubbleShape || (m.sender === "Elizabeth" ? "rounded-[20px]" : defaultShape);
                                const bTexture = senderInfo?.bubbleTexture || (m.sender === "Elizabeth" ? "none" : "none");
                                const isElizabeth = m.sender === "Elizabeth";`;

code = code.replace(targetColors, replacementColors);


const targetClasses = `                                const nameColor = isElizabeth ? "text-white/80" : "text-[#5A52A5]";
                                const textColor = (bColor === "transparent" || bColor.toLowerCase() === "#1a2035" || isElizabeth) ? "text-white" : "text-[#1A2035]";
                                const timeColor = isElizabeth ? "text-white/50" : "text-[#5A52A5]/70";

                                return (
                                  <div 
                                    className={\`\${shapeClasses} \${textureClasses} px-3.5 py-2 max-w-[85%] shadow-sm flex flex-col relative min-w-[150px] transition-all\`}
                                    style={{ 
                                        backgroundColor: bColor !== "transparent" ? bColor : undefined,
                                        borderWidth: (bBorder !== "transparent" || isElizabeth) ? (isElizabeth ? '0 0 0 3px' : '1px') : '0',
                                        borderColor: bBorder !== "transparent" ? bBorder : (isElizabeth ? '#D4AF3740' : 'transparent'),
                                        boxShadow: (bBorder !== "transparent" && !isElizabeth) ? \`0 0 8px \${bBorder}80\` : undefined,
                                    }}
                                  >
                                    <span
                                      className={\`font-bold \${nameColor} text-[13px] mb-1 cursor-pointer hover:underline uppercase\`}
                                      onClick={() => setInputValue((prev) => prev + \`@\${m.sender} \`)}
                                    >
                                      {m.sender}
                                    </span>`;

const replacementClasses = `                                const nameColor = isElizabeth ? "text-white/80" : "text-white/60";
                                const textColor = "text-white/90";
                                const timeColor = "text-white/40";

                                return (
                                  <div 
                                    className={\`\${shapeClasses} \${textureClasses} px-4 py-2.5 shadow-sm flex flex-col relative min-w-[120px] transition-all\`}
                                    style={{ 
                                        backgroundColor: bColor !== "transparent" ? bColor : undefined,
                                        borderWidth: '1px',
                                        borderColor: bBorder !== "transparent" ? bBorder : defaultBorder,
                                        boxShadow: bTexture === "glow" ? \`0 0 15px rgba(255,255,255,0.1)\` : '0 2px 10px rgba(0,0,0,0.1)',
                                    }}
                                  >
                                    {!isMe && (
                                      <span
                                        className={\`font-semibold \${nameColor} text-[13px] mb-0.5 cursor-pointer hover:text-white transition-colors tracking-wide\`}
                                        onClick={() => setInputValue((prev) => prev + \`@\${m.sender} \`)}
                                      >
                                        {m.sender}
                                      </span>
                                    )}`;

code = code.replace(targetClasses, replacementClasses);


fs.writeFileSync('src/App.tsx', code);
console.log("Patched chat bubbles");
