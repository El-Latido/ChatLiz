const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove CloudAdminPanel import
content = content.replace(/import\s*\{\s*CloudAdminPanel\s*\}\s*from\s*'.\/components\/CloudAdminPanel';\s*/g, '');
content = content.replace(/import\s*\{\s*MainIsland\s*\}\s*from\s*'.\/components\/MainIsland';\s*/g, '');

// 2. Remove CloudAdminPanel block
content = content.replace(/if\s*\(activeChat === 'cloud_admin'\)\s*\{\s*return <CloudAdminPanel[^\>]*\/\>;\s*\}/g, '');

// 3. Remove AXISS header buttons (Panel Cloud and Creador 3D)
const headerAxissRegex = /\{user\?.username\?.toUpperCase\(\) === 'AXISS' && \(\s*<>\s*<button[^>]*setActiveChat\('cloud_admin'\)[^>]*>[\s\S]*?<\/button>\s*<button[^>]*setActiveChat\('cloud_admin'\)[^>]*>[\s\S]*?<\/button>\s*<button[^>]*setActiveChat\('builder'\)[^>]*>[\s\S]*?<\/button>\s*<button[^>]*setActiveChat\('builder'\)[^>]*>[\s\S]*?<\/button>\s*<\/>\s*\)\}/g;
content = content.replace(headerAxissRegex, '');

// 4. Remove AXISS sidebar buttons
content = content.replace(/\{user\?.username\?.toUpperCase\(\) === 'AXISS' && \(\s*<button[^>]*setActiveChat\('cloud_admin'\)[^>]*>[\s\S]*?<\/button>\s*\)\}/g, '');
content = content.replace(/\{user\?.username\?.toUpperCase\(\) === 'AXISS' && \(\s*<button[^>]*setActiveChat\('builder'\)[^>]*>[\s\S]*?<\/button>\s*\)\}/g, '');

// 5. Remove Creador 3D floating button
content = content.replace(/\{user\?.username\?.toUpperCase\(\) === 'AXISS' && \(\s*<button[^>]*setActiveChat\('builder'\)[^>]*>[\s\S]*?<\/button>\s*\)\}/g, '');

// 6. Fix the extra </div> on line 895 (or wherever it is)
content = content.replace(/<div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin"><\/div>\s*\{usersOnline.map/g, '<div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin">\n                 {usersOnline.map');

// 7. Remove any other builder chat handler
content = content.replace(/if\s*\(activeChat === 'builder'\)\s*\{\s*return\s*<MainIsland\s*onClose=\{\(\) => setActiveChat\('global'\)\}\s*\/>;\s*\}/g, '');


fs.writeFileSync('src/App.tsx', content);
console.log('Fixed syntax and removed admin code.');
