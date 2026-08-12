const fs = require('fs');

function fix(filePath) {
    let file = fs.readFileSync(filePath, 'utf8');

    // Make modal full height on mobile and fixed
    file = file.replace(
        '<div className="bg-gradient-to-b from-[#0a0f1c] to-[#121B2A] border border-[#D4AF37]/30 rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">',
        '<div className="bg-gradient-to-b from-[#0a0f1c] to-[#121B2A] border border-[#D4AF37]/30 md:rounded-3xl w-full h-[100dvh] md:h-auto md:max-h-[95vh] max-w-6xl flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">'
    );
    
    // Wrapper for board to ensure it stays up top on mobile without scrolling
    file = file.replace(
        '<div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden">',
        '<div className="md:flex-1 p-2 md:p-6 shrink-0 flex flex-col items-center justify-center relative overflow-hidden">'
    );

    // Make Right Side chat use flex-1 properly
    file = file.replace(
        '<div className="w-full md:w-80 border-l border-[#D4AF37]/20 bg-black/40 flex flex-col z-10">',
        '<div className="w-full md:w-80 border-t md:border-t-0 border-l-0 md:border-l border-[#D4AF37]/20 bg-black/40 flex-1 flex flex-col min-h-0 z-10">'
    );

    // Flex-col-reverse for chat messages area
    file = file.replace(
        '<div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">',
        '<div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-3">'
    );

    // Map messages backwards
    file = file.replace(
        '{messages.map((m, i) => (',
        '{[...messages].reverse().map((m, i) => ('
    );
    
    // Change hover points to lime green as requested
    file = file.replace(
        "'radial-gradient(circle, rgba(0,0,0,.3) 25%, transparent 25%)'",
        "'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)'"
    );

    // Fix click selection indicator background (currently rgba(255, 255, 0, 0.4))
    file = file.replace(
        "background: 'rgba(255, 255, 0, 0.4)'",
        "background: 'rgba(255, 255, 0, 0.6)'"
    );

    // Also we need to make sure the modal wrapper doesn't have p-2 on mobile pushing it out of bounds
    file = file.replace(
        '<div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0B1220] p-2 sm:p-6 animate-in fade-in">',
        '<div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0B1220] md:p-6 animate-in fade-in">'
    );
    
    // Resize the opponent and user tags slightly on mobile so the board fits better
    file = file.replace(/w-12 h-12 rounded-full border-2/g, 'w-10 h-10 md:w-12 md:h-12 rounded-full border-2');
    file = file.replace(/mb-4 relative z-10/g, 'mb-2 md:mb-4 relative z-10');
    file = file.replace(/mt-4 relative z-10/g, 'mt-2 md:mt-4 relative z-10');

    fs.writeFileSync(filePath, file);
}

fix('src/components/ChessGameModal.tsx');
fix('src/components/ChessBotModal.tsx');
