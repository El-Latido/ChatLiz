const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex1 = /if\s*\(activeChat === 'cloud_admin'\)\s*\{\s*return <CloudAdminPanel onClose=\{.*?\} \/>;\s*\}/g;
content = content.replace(regex1, '');

const regex2 = /if\s*\(activeChat === 'builder'\)\s*\{\s*return\s*\(\s*<div[^>]*>\s*<Builder3D[^>]*\/>\s*<\/div>\s*\);\s*\}/g;
content = content.replace(regex2, '');

const regex3 = /\{user\?.username\?.toUpperCase\(\) === 'AXISS' && \(\s*<>\s*<button[^>]*setActiveChat\('cloud_admin'\)[^>]*>[\s\S]*?<\/button>\s*<button[^>]*setActiveChat\('cloud_admin'\)[^>]*>[\s\S]*?<\/button>\s*<button[^>]*setActiveChat\('builder'\)[^>]*>[\s\S]*?<\/button>\s*<button[^>]*setActiveChat\('builder'\)[^>]*>[\s\S]*?<\/button>\s*<\/>\s*\)\}/g;
content = content.replace(regex3, '');

const regex4 = /\{user\?.username\?.toUpperCase\(\) === 'AXISS' && \(\s*<button[^>]*setActiveChat\('cloud_admin'\)[^>]*>[\s\S]*?<\/button>\s*\)\}/g;
content = content.replace(regex4, '');

const regex5 = /\{user\?.username\?.toUpperCase\(\) === 'AXISS' && \(\s*<button[^>]*setActiveChat\('builder'\)[^>]*>[\s\S]*?<\/button>\s*\)\}/g;
content = content.replace(regex5, '');

fs.writeFileSync('src/App.tsx', content);
