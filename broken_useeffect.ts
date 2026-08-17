  useEffect(() => {
    if (!isLoggedIn) return;
    
    
  useEffect(() => {
    if (!isLoggedIn) return;
    let unsubMessages: any = null;
    
    if (activeChat === 'global' || activeChat === 'tutifrutti') {
        const q = query(collection(db, 'global_chat'), orderBy('timestamp', 'asc'), limitToLast(30));
        unsubMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, id: data.id || doc.id };
            });
            const filteredMsgs = msgs.filter((m: any) => {
                if (m.sender === 'Elizabeth' && (isGamesMenuOpenRef.current || activeChessGameRef.current || tutiFruttiStateRef.current?.isActive)) {
                    return false;
                }
                return true;
            });
            setMessages(filteredMsgs);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
    } else {
        const participants = [user.username, activeChat].sort();
        const convoId = participants.join("_");
        const q = query(collection(db, 'chats', convoId, 'messages'), orderBy('timestamp', 'asc'), limitToLast(30));
        unsubMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, id: data.id || doc.id };
            });
            setMessages(msgs);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
    }
    
    return () => {
            };
  }, [isLoggedIn, activeChat, user.username]);

  socket.on('dj_request_status', (req: { id: string, status: string, title: string }) => {
        setNotifications(prev => [
            {
                id: Date.now().toString(),
                text: req.status === 'accepted' ? `Tu canción "${req.title}" ha sido aceptada y está en cola.` : `Tu canción "${req.title}" no cumple con las normas (contenido inapropiado/fuera de contexto).`,
                read: false,
                type: req.status
            },
            ...prev
        ]);
    });

    socket.on('receive_global', (msg: any) => {
      if (msg.sender === 'Elizabeth' || msg.isAi) {
          setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    socket.on('receive_private', (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChat !== fromUser) {
        setUnreadPMs(prev => ({ ...prev, [fromUser]: true }));
      } else {
        setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    socket.on('tutifrutti_state', (state: any) => {
      setTutiFruttiState(state);
    });

    socket.on('request_tutifrutti_answers', () => {
      socket.emit('submit_tutifrutti', tfAnswersRef.current);
    });

    socket.emit('get_hall_of_fame', (data: any[]) => {
      setHallOfFame(data);
    });

    socket.on('active_users', (usersList: UserObj[]) => {
      const cleaned = usersList.filter(u => u.username !== 'Elizabeth' && u.username !== user.username);
      const elizabeth = usersList.find(u => u.username === 'Elizabeth') || { username: 'Elizabeth', statusMessage: 'Administradora', role: 'admin' };
      cleaned.unshift(elizabeth); 
      setUsersOnline(cleaned);
      setUserCache(prev => {
          const newCache = { ...prev };
          usersList.forEach(u => {
              newCache[u.username] = u;
          });
          return newCache;
      });
      const me = usersList.find(u => u.username === user.username);
      if (me) {
          setUser(prev => ({ ...prev, ...me }));
      }
    });

    socket.on('chess_invite_accepted', (data: { gameId: string, opponent: string, bet: number }) => {
        // Find the user object in usersOnline ref or just pass username
        setUsersOnline(prev => {
            const oppObj = prev.find(u => u.username === data.opponent) || {username: data.opponent, elo: 0};
            setActiveChessGame({ 
                id: data.gameId, 
                opponent: oppObj, 
                bet: data.bet, 
                isHost: true 
            });
            return prev;
        });
    });

    socket.on('typing', (data: { username: string, chat: string }) => {
       const targetChat = data.chat === user.username ? data.username : data.chat;
       setTypingUsers(prev => {
          const chatTyping = prev[targetChat] || [];
          if (!chatTyping.includes(data.username)) {
             return { ...prev, [targetChat]: [...chatTyping, data.username] };
          }
          return prev;
       });
       setTimeout(() => {
          setTypingUsers(prev => {
             const chatTyping = prev[targetChat] || [];
             if (chatTyping.includes(data.username)) {
                return { ...prev, [targetChat]: chatTyping.filter(u => u !== data.username) };
             }
             return prev;
          });
       }, 4000);
    });

    socket.on('stop_typing', (data: { username: string, chat: string }) => {
       const targetChat = data.chat === user.username ? data.username : data.chat;
       setTypingUsers(prev => {
          const chatTyping = prev[targetChat] || [];
          return { ...prev, [targetChat]: chatTyping.filter(u => u !== data.username) };
       });
    });
    
    let unsubUser: any = null;
    let unsubscribe: any = null;
    
    // Ensure user is authenticated before setting up listeners
    let unsubNotif: any = null;
    const setupListeners = () => {
        if (unsubUser) unsubUser();
        if (unsubscribe) unsubscribe();
        if (unsubNotif) unsubNotif();
        
        const qNotif = query(
            collection(db, "notifications"), 
            where("recipientUid", "==", user.username)
        );
        unsubNotif = onSnapshot(qNotif, (snapshot) => {
            const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Notificaciones recibidas:", rawData);
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                let text = data.message || data.text || '';
                if (!text) {
                    if (data.type === 'LIKE' || data.type === 'like') text = `${data.senderName} le ha dado Like a tu perfil.`;
                    else if (data.type === 'REQUEST' || data.type === 'friend_request') text = `${data.senderName} te ha enviado una solicitud de amistad.`;
                    else if (data.type === 'MESSAGE') text = `Nuevo mensaje de ${data.senderName}.`;
                    else text = `Notificación de ${data.senderName}`;
                }
                return { ...data, id: doc.id, text, read: data.isRead, type: data.type === 'LIKE' ? 'like' : (data.type === 'REQUEST' ? 'friend_request' : data.type) };
            });
            setNotifications(prev => {
                if (msgs.filter(m => !m.read).length > prev.filter(p => !p.read).length) playNotifySound();
                const localNotifs = prev.filter(p => !p.recipientUid); // Keep local socket notifications
                return [...msgs.filter(m => !m.read), ...localNotifs];
            });
        });
        
        unsubUser = onSnapshot(doc(db, "users", user.username!), (docSnap) => {
            if (docSnap.exists()) {
                const updatedUser = docSnap.data() as UserObj;
                setUser(prev => ({ ...prev, ...updatedUser }));
                
                setUsersOnline(prevOnline => {
                    const exists = prevOnline.find(u => u.username === user.username);
                    if (exists) {
                        return prevOnline.map(u => u.username === user.username ? { ...u, ...updatedUser } : u);
                    }
                    return prevOnline;
                });
            }
        }, (error: any) => {
            console.error("onSnapshot unsubUser error:", error);
            if (error?.code !== 'permission-denied') {
                setTimeout(setupListeners, 3000);
            }
        });

        unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const cacheUpdates: Record<string, UserObj> = {};
            let hasOnlineUpdates = false;

            snapshot.docChanges().forEach((change) => {
                if (change.type === "modified" || change.type === "added") {
                    const updatedUser = change.doc.data() as UserObj;
                    const uName = updatedUser.username || change.doc.id;
                    cacheUpdates[uName] = { ...updatedUser, username: uName };
                    hasOnlineUpdates = true;
                }
            });

            if (Object.keys(cacheUpdates).length > 0) {
                setUserCache(prev => ({ ...prev, ...cacheUpdates }));
                setUsersOnline(prevOnline => {
                    let newOnline = [...prevOnline];
                    let changed = false;
                    for (const username in cacheUpdates) {
                        const updatedUser = cacheUpdates[username];
                        const index = newOnline.findIndex(u => u.username === username);
                        if (index !== -1) {
                            newOnline[index] = { ...newOnline[index], ...updatedUser };
                            changed = true;
                        }
                    }
                    return changed ? newOnline : prevOnline;
                });
            }
        }, (error: any) => {
            console.error("onSnapshot unsubscribe error:", error);
            if (error?.code !== 'permission-denied') {
                setTimeout(setupListeners, 3000);
            }
        });
    };
        const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
            if (user.username) {
                setupListeners();
            }
        } else {
            signInAnonymously(auth).catch((error) => {
               console.error("Error signing in anonymously to Firebase:", error);
            });
        }
    });

    return () => {
      socket.off('receive_global');
            socket.off('receive_private');
      socket.off('active_users');
      if (unsubscribe) unsubscribe();
      if (unsubUser) unsubUser();
      if (typeof unsubNotif === 'function') unsubNotif();
      authUnsubscribe();
    };
  }, [isLoggedIn, user.username]);
