const fs = require('fs');

function fixSyntax3() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // lines 324-329 are messed up
    const badRegex = /<div className="w-\[50%\] h-\[120%\] bg-white rounded-full flex items-center justify-center">[\s\S]*?\}\)}\s*<\/div>\s*<\/div>\s*<\/div>/m;
    const replacement = `<div className="w-[50%] h-[120%] bg-white rounded-full flex items-center justify-center">
                                            <span className="text-[5px] md:text-[6px] font-black text-black leading-none">{i}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>`;
    code = code.replace(badRegex, replacement);

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
}
fixSyntax3();
