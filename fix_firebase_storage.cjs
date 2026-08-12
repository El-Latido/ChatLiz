const fs = require('fs');
let file = fs.readFileSync('server/firebaseLogic.ts', 'utf8');

// Remove uploadProfilePicIfBase64 logic completely
file = file.replace(/const uploadProfilePicIfBase64 = async \([^]*?return profilePic;\n\};\n/m, '');

file = file.replace(/if \(data\.profilePic\) \{\s*data\.profilePic = await uploadProfilePicIfBase64\(newUsername, data\.profilePic\);\s*\}/g, '');
file = file.replace(/if \(data\.profilePic\) \{\s*data\.profilePic = await uploadProfilePicIfBase64\(aiUsername, data\.profilePic\);\s*\}/g, '');

fs.writeFileSync('server/firebaseLogic.ts', file);
