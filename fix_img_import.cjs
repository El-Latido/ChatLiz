const fs = require('fs');
let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

// Add the import at the top
const importStmt = "import tableBg from '../assets/images/pool_layout_1787163922479.jpg';\n";
if (!code.includes('import tableBg')) {
    code = importStmt + code;
}

// Replace the img tag
code = code.replace(/<img\s+src="\/pool-bg\.jpg"/, '<img src={tableBg}');

fs.writeFileSync('src/components/PoolGameModal.tsx', code);
