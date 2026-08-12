const fs = require('fs');

function fix(filePath, isBot) {
    let file = fs.readFileSync(filePath, 'utf8');

    // 1. Add console.log to onSquareClick and simplify
    const oldClickSig = "function onSquareClick(square: string) {";
    if (file.includes(oldClickSig)) {
        file = file.replace(oldClickSig, "function onSquareClick(square: string) {\n    console.log('Pieza tocada en:', square);");
    }

    // 2. Fix the board container (z-index 100, pointer-events-auto)
    file = file.replace(
        /className=\{\`w-full max-w-\[500px\] aspect-square relative z-10/g,
        "className={`w-full max-w-[500px] aspect-square relative z-[100] pointer-events-auto"
    );

    // 3. Fix the chat container (z-index 1, position fixed at bottom or just relative z-1 depending on what fits, since we're using flex layout let's just make it z-1)
    file = file.replace(
        /className="w-full md:w-80 border-t md:border-t-0 border-l-0 md:border-l border-\[\#D4AF37\]\/20 bg-black\/40 flex-1 flex flex-col min-h-0 z-10"/g,
        'className="w-full md:w-80 border-t md:border-t-0 border-l-0 md:border-l border-[#D4AF37]/20 bg-black/40 flex-1 flex flex-col min-h-0 z-1 relative"'
    );

    fs.writeFileSync(filePath, file);
}

fix('src/components/ChessGameModal.tsx', false);
fix('src/components/ChessBotModal.tsx', true);
