const fs = require('fs');
let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

// Fix the stripe logic
const oldStripeLogic = /const isStripe = !isCue && i > 8; \/\/ Simplified logic just for visuals/;
const newStripeLogic = `const num = isCue ? 0 : parseInt(b.label.split('_')[1]);
                        const isStripe = num > 8;`;
code = code.replace(oldStripeLogic, newStripeLogic);

// Fix the number circle
const oldNumberCircle = /<span className="text-\[6px\] md:text-\[8px\] font-black text-black leading-none" style=\{\{transform: 'scale\(0\.8\)'\}\}>\{i\}<\/span>/;
const newNumberCircle = `<span className="text-[6px] md:text-[8px] font-black text-black leading-none" style={{transform: 'scale(0.8)'}}>{num}</span>`;
code = code.replace(oldNumberCircle, newNumberCircle);

// The power bar now says "h-[80%]" but might not have enough layout control. Let's make it more solid.
code = code.replace(/<div className="w-16 h-\[80%\] max-h-\[400px\] bg-\[#111\]/g, `<div className="w-12 md:w-16 h-[60vh] md:h-full max-h-[400px] bg-[#111]`);

fs.writeFileSync('src/components/PoolGameModal.tsx', code);
