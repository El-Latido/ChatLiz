    socket.on("react_to_message", async ({ messageId, emoji, chatContext, toUser }, callback) => {
      if (!currentUsername) return;
      try {
        io.emit("message_reaction", { messageId, emoji, username: currentUsername, chatContext, toUser });
        if (fdb) {
           const collectionName = chatContext === "global" ? "global_chat" : "private_chats";
           const q = chatContext === "global" 
             ? query(collection(fdb, "global_chat"), where("id", "==", messageId))
             : query(collection(fdb, "private_chats"), where("id", "==", messageId));
           
           const snap = await getDocs(q);
           if (!snap.empty) {
             const docRef = snap.docs[0].ref;
             const data = snap.docs[0].data();
             let reactions = data.reactions || {};
             if (!reactions[emoji]) reactions[emoji] = [];
             if (reactions[emoji].includes(currentUsername)) {
               reactions[emoji] = reactions[emoji].filter((u:string) => u !== currentUsername);
             } else {
               reactions[emoji].push(currentUsername);
             }
             await updateDoc(docRef, { reactions });
           }
        }
        if (callback) callback({ success: true });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });
