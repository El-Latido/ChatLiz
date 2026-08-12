const fs = require('fs');

function fix(filePath) {
    let file = fs.readFileSync(filePath, 'utf8');

    file = file.replace(
        "'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)',",
        "'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)',\n          zIndex: 10,"
    );
    file = file.replace(
        "'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)'",
        "'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)',\n          zIndex: 10"
    );

    fs.writeFileSync(filePath, file);
}

fix('src/components/ChessGameModal.tsx');
fix('src/components/ChessBotModal.tsx');
