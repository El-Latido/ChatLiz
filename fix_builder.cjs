const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/import\s*\{\s*Builder3D\s*\}\s*from\s*'.\/components\/Builder3D';\s*/g, '');
// Wait, Builder3D is used here:
// if (activeChat === 'builder') {
//    return (
//      <div className="...">
//        <Builder3D user={user!} onClose={() => setActiveChat('global')} />
//      </div>
//    );
// }
// Let's just remove the block for activeChat === 'builder'
const builderRegex = /if\s*\(activeChat === 'builder'\)\s*\{\s*return\s*\(\s*<div[^>]*>[\s\S]*?<Builder3D[^>]*\/>[\s\S]*?<\/div>\s*\);\s*\}/g;
content = content.replace(builderRegex, '');

fs.writeFileSync('src/App.tsx', content);
console.log('Removed Builder3D');
