const fs = require('fs');

let file = fs.readFileSync('server/firebaseLogic.ts', 'utf8');

file = file.replace(
`            const extension = profilePic.substring("data:image/".length, profilePic.indexOf(";base64"));
            const storageRef = ref(fStorage, \`profile_pics/\${username}.\${extension}\`);
            await uploadString(storageRef, profilePic, 'data_url');
            const downloadUrl = await getDownloadURL(storageRef);
            return downloadUrl;`,
`            const extension = profilePic.substring("data:image/".length, profilePic.indexOf(";base64"));
            const storageRef = ref(fStorage, \`profile_pics/\${username}.\${extension}\`);
            
            const uploadTask = async () => {
                await uploadString(storageRef, profilePic, 'data_url');
                return await getDownloadURL(storageRef);
            };
            
            const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout upload")), 3000));
            
            const downloadUrl = await Promise.race([uploadTask(), timeoutTask]);
            return downloadUrl;`
);

fs.writeFileSync('server/firebaseLogic.ts', file);
