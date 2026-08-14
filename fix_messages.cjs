const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

if (!file.includes('addDoc')) {
    file = file.replace(/import {([^}]*)collection, onSnapshot, query, doc, orderBy, limitToLast([^}]*)} from 'firebase\/firestore';/, "import { $1collection, onSnapshot, query, doc, orderBy, limitToLast, addDoc, serverTimestamp$2} from 'firebase/firestore';");
} else {
    file = file.replace("limitToLast } from 'firebase/firestore'", "limitToLast, addDoc, serverTimestamp } from 'firebase/firestore'");
}

const targetSendMessage = `    if (activeChat === 'global' || activeChat === 'tutifrutti') {
      const optimisticMsg = { ...payload, sender: user.username, senderId: user.username, timestamp: Date.now(), createdAt: Date.now() };
      setMessages(prev => [...prev, optimisticMsg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      socket.emit('send_global', payload);
    } else {
      const optimisticMsg = { ...payload, sender: user.username, senderId: user.username, timestamp: Date.now(), createdAt: Date.now() };
      setMessages(prev => [...prev, optimisticMsg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      
      socket.emit('send_private', payload, activeChat, (res: any) => {
         if (!res.success) {
            // Remove optimistic message if failed
            setMessages(prev => prev.filter(m => m.id !== msgId));
            alert(res.error || "No se pudo enviar");
         } else {
            // Replace optimistic with real msg to get accurate timestamp and properties
            setMessages(prev => prev.map(m => m.id === msgId ? res.msg : m));
         }
      });
    }`;

const replaceSendMessage = `    const msgData = { ...payload, sender: user.username, senderId: user.username, timestamp: Date.now(), createdAt: Date.now() };
    if (activeChat === 'global' || activeChat === 'tutifrutti') {
      // Backend handles global chat moderation via socket, but we can also use addDoc if requested.
      // The prompt asks to use addDoc for private chats. We'll use socket for global to keep moderation, 
      // or addDoc for both to ensure real-time as requested.
      // Let's use addDoc for global too if they want instant sync, but wait, the prompt says "en la colección específica del chat privado".
      socket.emit('send_global', payload);
    } else {
      const participants = [user.username, activeChat].sort();
      const convoId = participants.join("_");
      // Create document in 'chats' collection as requested: "colección en Firestore llamada chats con un ID compuesto por uid1_uid2"
      addDoc(collection(db, 'chats', convoId, 'messages'), msgData)
        .then(() => {
             // Let socket also know for other features, but don't depend on it for messages
             socket.emit('send_private_event', msgData, activeChat);
        })
        .catch(err => {
             console.error("Error sending message", err);
             alert("Error al enviar el mensaje.");
        });
    }`;
file = file.replace(targetSendMessage, replaceSendMessage);

// Also need to fix onSnapshot for private messages to listen to 'chats' instead of 'private_messages'
const targetOnSnapshotPrivate = `        const q = query(collection(db, 'private_messages', convoId, 'messages'), orderBy('timestamp', 'asc'), limitToLast(30));`;
const replaceOnSnapshotPrivate = `        const q = query(collection(db, 'chats', convoId, 'messages'), orderBy('timestamp', 'asc'), limitToLast(30));`;
file = file.replace(targetOnSnapshotPrivate, replaceOnSnapshotPrivate);

fs.writeFileSync('src/App.tsx', file);
