const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const rejectOld = `if (docSnap.exists()) {
                let requests = docSnap.data().friend_requests || [];
                requests = requests.filter((r: string) => r !== targetUser);
                await updateDoc(uRef, { friend_requests: requests });
            }`;
const rejectNew = `if (docSnap.exists()) {
                let requests = docSnap.data().friend_requests || [];
                requests = requests.filter((r: string) => r !== targetUser);
                try { await updateDoc(uRef, { friend_requests: requests }); } catch(e){}
            }`;
code = code.replace(rejectOld, rejectNew);

const removeOld = `            if (docSnap.exists()) {
                let friends = docSnap.data().friends_list || [];
                friends = friends.filter((f: string) => f !== targetUser);
                await updateDoc(uRef, { friends_list: friends });
            }
            const tRef = doc(fdb, 'users', targetUser);
            const tSnap = await getDoc(tRef);
            if (tSnap.exists()) {
                let tFriends = tSnap.data().friends_list || [];
                tFriends = tFriends.filter((f: string) => f !== currentUsername);
                await updateDoc(tRef, { friends_list: tFriends });
            }`;
            
const removeNew = `            if (docSnap.exists()) {
                let friends = docSnap.data().friends_list || [];
                friends = friends.filter((f: string) => f !== targetUser);
                try { await updateDoc(uRef, { friends_list: friends }); } catch(e){}
            }
            const tRef = doc(fdb, 'users', targetUser);
            const tSnap = await getDoc(tRef);
            if (tSnap.exists()) {
                let tFriends = tSnap.data().friends_list || [];
                tFriends = tFriends.filter((f: string) => f !== currentUsername);
                try { await updateDoc(tRef, { friends_list: tFriends }); } catch(e){}
            }`;
code = code.replace(removeOld, removeNew);

const acceptOld = `            if (docSnap.exists()) {
                let requests = docSnap.data().friend_requests || [];
                let friends = docSnap.data().friends_list || [];
                requests = requests.filter((r: string) => r !== targetUser);
                if (!friends.includes(targetUser)) friends.push(targetUser);
                await updateDoc(uRef, { friend_requests: requests, friends_list: friends });
            }
            // Update target user
            const tRef = doc(fdb, 'users', targetUser);
            const tSnap = await getDoc(tRef);
            if (tSnap.exists()) {
                let tFriends = tSnap.data().friends_list || [];
                if (!tFriends.includes(currentUsername)) tFriends.push(currentUsername);
                await updateDoc(tRef, { friends_list: tFriends });
            }`;
            
const acceptNew = `            if (docSnap.exists()) {
                let requests = docSnap.data().friend_requests || [];
                let friends = docSnap.data().friends_list || [];
                requests = requests.filter((r: string) => r !== targetUser);
                if (!friends.includes(targetUser)) friends.push(targetUser);
                try { await updateDoc(uRef, { friend_requests: requests, friends_list: friends }); } catch(e){}
            }
            // Update target user
            const tRef = doc(fdb, 'users', targetUser);
            const tSnap = await getDoc(tRef);
            if (tSnap.exists()) {
                let tFriends = tSnap.data().friends_list || [];
                if (!tFriends.includes(currentUsername)) tFriends.push(currentUsername);
                try { await updateDoc(tRef, { friends_list: tFriends }); } catch(e){}
            }`;

code = code.replace(acceptOld, acceptNew);

const sendReqOld = `            if (tSnap.exists()) {
                let requests = tSnap.data().friend_requests || [];
                if (!requests.includes(currentUsername)) {
                    requests.push(currentUsername);
                    await updateDoc(uRef, { friend_requests: requests });
                }
            }`;
const sendReqNew = `            if (tSnap.exists()) {
                let requests = tSnap.data().friend_requests || [];
                if (!requests.includes(currentUsername)) {
                    requests.push(currentUsername);
                    try { await updateDoc(uRef, { friend_requests: requests }); } catch(e){}
                }
            }`;
code = code.replace(sendReqOld, sendReqNew);

const blockOld = `                if (blocked.includes(targetUser)) {
                    blocked = blocked.filter((b: string) => b !== targetUser);
                } else {
                    blocked.push(targetUser);
                    isBanned = true;
                }
                await updateDoc(uRef, { blocked_list: blocked });`;
const blockNew = `                if (blocked.includes(targetUser)) {
                    blocked = blocked.filter((b: string) => b !== targetUser);
                } else {
                    blocked.push(targetUser);
                    isBanned = true;
                }
                try { await updateDoc(uRef, { blocked_list: blocked }); } catch(e){}`;
code = code.replace(blockOld, blockNew);

fs.writeFileSync('server.ts', code);
