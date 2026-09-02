import React, { useState, useEffect, useRef, ErrorInfo, Component } from 'react';
import {  
  Send, User, MessageCircle, Settings, Bot, 
  Image as ImageIcon, Mic, StopCircle, 
  Trash2, Menu, X, Hash, MessageSquare, LogOut, Search, Gamepad2, Music, Youtube,  Paperclip, Smile, Globe, Box, Users, UserPlus, AlertCircle, Bell, PhoneCall, Heart, Home
} from 'lucide-react';
import {  collection, onSnapshot, query, doc, orderBy, limitToLast, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {  db, auth } from './firebaseConfig';
import {  socket } from './socket';
import {  UserObj, MessageObj } from './types';
import {  Login } from './components/Login';
import {  RecoveryModal } from './components/RecoveryModal';
import {  ProfileConfigModal } from './components/ProfileConfigModal';
import {  AdminConfigAiModal } from './components/AdminConfigAiModal';
import {  GamesMenuModal } from './components/GamesMenuModal';
import {  EmojiGifPicker } from './components/EmojiGifPicker';

import {  StoreModal } from './components/StoreModal';
import { CallModal } from './components/CallModal';
import { ActiveCallModal } from './components/ActiveCallModal';
import { ChessGameModal } from './components/ChessGameModal';
import {  ChessBotModal } from './components/ChessBotModal';
import {  PremiumAudioPlayer } from './components/PremiumAudioPlayer';
import {  PremiumAudioVisualizer } from './components/PremiumAudioVisualizer';
import {  InlineRadio } from './components/InlineRadio';
import {  SongRequestModal } from './components/SongRequestModal';
import {  DjControlPanelModal } from './components/DjControlPanelModal';
import { AiSelectorModal } from './components/AiSelectorModal';
import { SocialFeed } from './components/social/SocialFeed';
const DECORATIONS = [
  // Ajedrez (Themes & Efectos)
  { id: 'chess_theme_wood', type: 'basic', category: 'ajedrez', price: 100, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=wood' },
  { id: 'chess_theme_neon', type: 'intermediate', category: 'ajedrez', price: 500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=neon' },
  { id: 'chess_theme_gold', type: 'premium', category: 'ajedrez', price: 1500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=gold' },
  // Marcos
  { id: 'dec_b1', type: 'basic', category: 'marcos', price: 500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=flower1' },
  { id: 'dec_b2', type: 'basic', category: 'marcos', price: 500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=star' },
  { id: 'dec_i1', type: 'intermediate', category: 'marcos', price: 1200, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cat' },
  { id: 'dec_p1', type: 'premium', category: 'marcos', price: 2500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=crown' },
  // Emblemas
  { id: 'dec_b3', type: 'basic', category: 'emblemas', price: 500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=heart' },
  { id: 'dec_i2', type: 'intermediate', category: 'emblemas', price: 1200, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=dog' },
  { id: 'dec_p2', type: 'premium', category: 'emblemas', price: 2500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=diamond' },
  // Mascotas
  { id: 'dec_b4', type: 'basic', category: 'mascotas', price: 500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=leaf' },
  { id: 'dec_i3', type: 'intermediate', category: 'mascotas', price: 1200, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=rabbit' },
  { id: 'dec_i4', type: 'intermediate', category: 'mascotas', price: 1200, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=bird' },
  { id: 'dec_p3', type: 'premium', category: 'mascotas', price: 2500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=dragon' },
  // Efectos
  { id: 'dec_b5', type: 'basic', category: 'efectos', price: 500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cloud' },
  { id: 'dec_i5', type: 'intermediate', category: 'efectos', price: 1200, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=fish' },
  { id: 'dec_p4', type: 'premium', category: 'efectos', price: 2500, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=unicorn' },
];

let currentVersion: string | null = null;

let versionController: AbortController | null = null;
function checkVersion() {
    if (versionController) {
        versionController.abort();
    }
    versionController = new AbortController();
    fetch('/version', { signal: versionController.signal })
        .then(response => response.json())
        .then(data => {
            if (currentVersion === null) {
                currentVersion = data.version;
            } else if (data.version !== currentVersion) {
                // Se detectó una nueva versión, recargar solo si no hay mensaje en progreso
                console.log("Nueva actualización detectada. Recargando...");
                window.location.reload();
            }
        })
        .catch(err => {
            if (err.name === 'AbortError') return;
            console.error("Error verificando versión:", err);
        });
}

// Verificar cada 15 segundos
setInterval(checkVersion, 15000);


export const notifyOwner = async (profileUid: string, actionType: string, visitorName: string, extraData?: any) => {
  console.log("Intentando enviar notificación a:", profileUid);
  try {
    // using imports from top of file
    const docRef = await addDoc(collection(db, "notifications"), {
      recipientUid: profileUid,
      senderUid: visitorName,
      senderName: visitorName,
      type: actionType,
      frData: extraData?.frData || null,
      message: `Has recibido un ${actionType} de ${visitorName}`,
      isRead: false,
      createdAt: serverTimestamp()
    });
    console.log("Notificación creada con ID:", docRef.id);
  } catch (error) {
    console.error("Error al escribir en Firestore:", error);
  }
};

export const sendNotification = async (recipientUid: string, type: string, senderData: any) => {
  try {
    // using imports from top of file
    await addDoc(collection(db, "notifications"), {
      recipientUid: recipientUid,
      senderUid: senderData.uid,
      senderName: senderData.displayName || "Usuario",
      type: type,
      isRead: false,
      frData: senderData.frData || null,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
  }
};

function MainApp() {

  const playNotifySound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch(e) { console.error("Sound error", e); }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserObj & {password?: string, securityEmail?: string}>({ username: '', password: '', countryLanguage: 'es', securityEmail: '' });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAiSelectorOpen, setIsAiSelectorOpen] = useState(false);
  const [selectedUserModal, setSelectedUserModal] = useState<UserObj | null>(null);
  const [adminConfigAiOpen, setAdminConfigAiOpen] = useState(false);
  const [currentAdminAi, setCurrentAdminAi] = useState('Elizabeth');
  const [aiProfileForm, setAiProfileForm] = useState({ profilePic: '', statusMessage: 'Administradora', systemInstruction: '' });
  
    const [incomingCall, setIncomingCall] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState("global");
  const activeChatRef = useRef(activeChat);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  

  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  
  const [usersOnline, setUsersOnline] = useState<UserObj[]>([{ username: 'Elizabeth', statusMessage: 'Administradora', role: 'admin' }]); 
  const [userCache, setUserCache] = useState<Record<string, UserObj>>({});

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFriendsSidebarOpen, setIsFriendsSidebarOpen] = useState(false);
  const [unreadPMs, setUnreadPMs] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<any[]>([]);
  const [chatList, setChatList] = useState<any[]>([]);

  useEffect(() => {
      if (toasts.length > 0) {
          const timer = setTimeout(() => setToasts(prev => prev.slice(1)), 5000);
          return () => clearTimeout(timer);
      }
  }, [toasts]);

  
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false);
  const isGamesMenuOpenRef = useRef(false);
  useEffect(() => { isGamesMenuOpenRef.current = isGamesMenuOpen; }, [isGamesMenuOpen]);
  const [chessBet, setChessBet] = useState(10);
  const [activeChessGame, setActiveChessGame] = useState<any>(null);
  const activeChessGameRef = useRef<any>(null);
  useEffect(() => { activeChessGameRef.current = activeChessGame; }, [activeChessGame]);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
     const interval = setInterval(() => setNow(Date.now()), 1000);
     return () => clearInterval(interval);
  }, []);
  const [hallOfFame, setHallOfFame] = useState<any[]>([]);
  
  let chatBg = null;
  try {
    chatBg = localStorage.getItem('chatBg');
  } catch (e) {
    console.warn("localStorage is blocked");
  }


  // Recovery States
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCodeStr, setRecoveryCodeStr] = useState('');
  const [inputRecoveryCode, setInputRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
    const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [storeCategory, setStoreCategory] = useState<string | undefined>(undefined);
  const [isSongRequestOpen, setIsSongRequestOpen] = useState(false);
  const [isDjPanelOpen, setIsDjPanelOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const micTimeoutRef = useRef<any>(null);
  const [isMicHeld, setIsMicHeld] = useState(false);

  const toggleRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isMusicPlaying) audio.play().catch(e => console.log("Autoplay prevented:", e));
      else audio.pause();
    }
  }, [isMusicPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
       setMessages(prev => {
          const twelveMinAgo = Date.now() - 12 * 60 * 1000;
          const filtered = prev.filter(m => {
             const time = m.timestamp?.seconds ? m.timestamp.seconds * 1000 : (m.createdAt?.seconds ? m.createdAt.seconds * 1000 : (typeof m.timestamp === 'number' ? m.timestamp : (typeof m.createdAt === 'number' ? m.createdAt : Date.now())));
             return time > twelveMinAgo;
          });
          return filtered.length !== prev.length ? filtered : prev;
       });
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    socket.emit("typing", { username: user.username, chat: activeChat });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { username: user.username, chat: activeChat });
    }, 2000);
  };

  
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const payload = {
         email: googleUser.email,
         displayName: googleUser.displayName,
         photoURL: googleUser.photoURL,
         googleUid: googleUser.uid,
         timezone
      };
      
      socket.emit('google_login', payload, (res: any) => {
         if (res.success) {
            setUser({
               ...user,
               username: res.username,
               profilePic: res.profilePic,
               statusMessage: res.statusMessage,
               role: res.role,
               countryLanguage: res.countryLanguage || user.countryLanguage,
               timezone,
               is_friends_public: res.is_friends_public,
               friends_list: res.friends_list || [],
               blocked_list: res.blocked_list || []
            });
            setIsLoggedIn(true);
         } else {
            alert(res.error || 'Error al iniciar sesión con Google');
         }
      });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
         // do nothing
      } else if (error.message && error.message.includes('Cross-Origin')) {
         alert("La ventana de Google está bloqueada por el navegador dentro de esta vista previa. Para usar Google Login, por favor abre la aplicación en una nueva pestaña (haciendo clic en la flecha de la esquina superior derecha).");
      } else {
         alert("Error al autenticar con Google. Si estás en la vista previa, intenta abrir la app en una pestaña nueva.\nDetalle: " + error.message);
      }
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user.username || !user.password) return;
    
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const loginPayload = { ...user, timezone };

    socket.emit('register_or_login', loginPayload, (res: any) => {
      if (res.success) {
        setUser({ 
           ...user, 
           profilePic: res.profilePic, 
           statusMessage: res.statusMessage, 
           role: res.role, 
           countryLanguage: res.countryLanguage || user.countryLanguage, 
           timezone,
           is_friends_public: res.is_friends_public,
           friends_list: res.friends_list || [],
           blocked_list: res.blocked_list || []
        });
        setIsLoggedIn(true);
      } else {
        alert(res.error || 'Error al iniciar sesión');
      }
    });
  };

  


  useEffect(() => {
    if (!isLoggedIn) return;

    const handleReconnect = () => {
        if (user.username) {
            // If they have a googleUid, use google_login, else register_or_login
            if (user.googleUid) {
                socket.emit('google_login', {
                    email: user.securityEmail,
                    displayName: user.username,
                    photoURL: user.profilePic,
                    googleUid: user.googleUid,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }, () => {});
            } else {
                // We don't have the password in memory, but we can emit a special reconnect event 
                // Or since we don't have the password, we can emit a new 'reconnect_user' event
                socket.emit('reconnect_user', { username: user.username });
            }
        }
    };
    socket.on('connect', handleReconnect);

    let unsubMessages: any = null;
    
    setMessages([]);
    if (activeChat === 'global') {
        const q = query(collection(db, 'global_chat'), orderBy('timestamp', 'asc'), limitToLast(30));
        unsubMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, id: data.id || doc.id };
            });
            const filteredMsgs = msgs.filter((m: any) => {
                if (m.sender === 'Elizabeth' && (isGamesMenuOpenRef.current || activeChessGameRef.current)) {
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
        socket.off('connect', handleReconnect);
        if (unsubMessages) unsubMessages();
    };
  }, [isLoggedIn, activeChat, user.username]);

  useEffect(() => {
    if (!isLoggedIn) return;
    

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
      // If we are not in global chat, we shouldn't append it to the current messages view
      if (activeChatRef.current !== 'global') {
          return;
      }
      
      if (msg.sender !== user.username || msg.sender === 'Elizabeth' || msg.isAi) {
          setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    socket.on('receive_private', (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChatRef.current !== fromUser) {
        setUnreadPMs(prev => ({ ...prev, [fromUser]: true }));
        setToasts(prev => [...prev, { id: Date.now(), type: 'PM', sender: fromUser, text: msg.text || 'Nuevo audio/imagen' }]);
      } else {
        setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });



    socket.emit('get_hall_of_fame', (data: any[]) => {
      setHallOfFame(data);
    });

    socket.emit('request_initial_state');

    socket.on('llamada_entrante', (caller: string) => {
      setIncomingCall(caller);
    });

    socket.on('respuesta_llamada', (data: { responder: string, accepted: boolean }) => {
      if (data.accepted) {
          setActiveCall(data.responder);
          showToast(`Llamada conectada con ${data.responder}`, 'success');
      } else {
          showToast(`${data.responder} rechazó la llamada`, 'error');
      }
    });

    socket.on('active_users', (usersList: UserObj[]) => {
      socket.emit('check_pending_calls');
      const aiIds = ['Elizabeth', 'Sensei', 'Shadow', 'Neko'];
      const ais = usersList.filter(u => aiIds.includes(u.username)).map(u => ({...u, isAi: true}));
      const others = usersList.filter(u => !aiIds.includes(u.username) && u.username !== user.username);
      setUsersOnline([...ais, ...others]);
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
    let unsubChats: any = null;
    const setupListeners = () => {
        if (unsubChats) unsubChats();
        if (unsubUser) unsubUser();
        if (unsubscribe) unsubscribe();
        if (unsubNotif) unsubNotif();
        
        const qChats = query(collection(db, "userChats", user.username, "chats"), orderBy("updatedAt", "desc"));
        unsubChats = onSnapshot(qChats, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setChatList(list);
        });
        
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
       if (!authUser) {
           signInAnonymously(auth).catch(e => console.warn(e));
       }
    });
    if (user.username) {
        setupListeners();
    }

    return () => {
      socket.off('receive_global');
            socket.off('receive_private');
      socket.off('active_users');
      if (unsubscribe) unsubscribe();
      if (unsubUser) unsubUser();
      if (typeof unsubNotif === 'function') unsubNotif();
      if (typeof unsubChats === 'function') unsubChats();
      authUnsubscribe();
    };
  }, [isLoggedIn, user.username]);

  
  const closeAllModals = () => { setShowNotifications(false);
    setIsSidebarOpen(false);
    setIsFriendsSidebarOpen(false);
    setIsConfigOpen(false);
    setIsAiSelectorOpen(false);
    setSelectedUserModal(null);
    setAdminConfigAiOpen(false);
    setIsGamesMenuOpen(false);
    setIsStoreOpen(false);
    setIsSongRequestOpen(false); setIsDjPanelOpen(false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() && !selectedImage && !audioUrl && !selectedGif) return;
    
    const msgId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const payload: any = { text: inputValue, id: msgId };
    if (selectedImage) payload.image = selectedImage;
    if (selectedGif) payload.image = selectedGif;
    if (audioUrl) payload.audio = audioUrl;

    const msgData = { ...payload, sender: user.username, senderId: user.username, timestamp: Date.now(), createdAt: Date.now() };
    if (activeChat === 'global') {
      setMessages(prev => [...prev, msgData]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      socket.emit('send_global', payload);
    } else {
      // Use the server to send private messages so moderation, bots, and socket events work properly.
      // Optimistic UI for private messages
      setMessages(prev => [...prev, msgData]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      socket.emit('send_private', payload, activeChat, (res: any) => {
          if (res && !res.success) {
              alert(res.error || "Error al enviar el mensaje.");
          } else {
              notifyOwner(activeChat, 'MESSAGE', user.username);
          }
      });
    }
    
    socket.emit("stop_typing", { username: user.username, chat: activeChat });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Destrucción total del bucle y limpieza drástica
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null; // Remove the listener
      mediaRecorderRef.current.stop();
    }
    if (recordingStream) {
      recordingStream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
    setRecordingStream(null);

    // Limpieza inmediata del input para evitar sensación de "congelamiento"
    setInputValue('');
    setSelectedImage(null);
    setSelectedGif(null);
    setAudioUrl(null);
    setShowEmojiPicker(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1000;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setSelectedImage(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      const options = {
        audioBitsPerSecond: 128000,
      };
      
      let mimeType = 'audio/webm;codecs=opus';
      if (MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2')) {
         mimeType = 'audio/mp4;codecs=mp4a.40.2';
      } else if (!MediaRecorder.isTypeSupported(mimeType) && MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
         mimeType = 'audio/ogg;codecs=opus';
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType, ...options });
      setRecordingStream(stream);
      audioChunks.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
           setAudioUrl(reader.result as string);
        };
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Error al acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingStream) {
      recordingStream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
    setRecordingStream(null);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Login handleGoogleLogin={handleGoogleLogin} 
          user={user} 
          setUser={setUser} 
          handleLogin={handleLogin} 
          setRecoveryModalOpen={setRecoveryModalOpen} 
        />
        {recoveryModalOpen && (
          <RecoveryModal
            recoveryStep={recoveryStep}
            recoveryEmail={recoveryEmail}
            setRecoveryEmail={setRecoveryEmail}
            setRecoveryStep={setRecoveryStep}
            recoveryUsername={recoveryUsername}
            setRecoveryUsername={setRecoveryUsername}
            recoveryCodeStr={recoveryCodeStr}
            setRecoveryCodeStr={setRecoveryCodeStr}
            inputRecoveryCode={inputRecoveryCode}
            setInputRecoveryCode={setInputRecoveryCode}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            setRecoveryModalOpen={setRecoveryModalOpen}
          />
        )}
      </>
    );
  }


  


  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }} className="bg-gradient-to-br from-[#0B1220] via-[#121B2A] to-[#0A101C] text-gray-200 flex flex-col font-sans">
            
      {/* Top Navigation Bar (Floating/Overlay style) */}
      <nav className="flex items-center justify-between px-4 py-3 shrink-0 z-[100] relative w-full">
         <div className="flex-1 flex items-center justify-start">
             <button onClick={() => { closeAllModals(); setIsSidebarOpen(!isSidebarOpen); }} className="md:hidden text-[#D4AF37] hover:text-[#E8D9B0] p-2 rounded-full hover:bg-white/5 transition-colors">
                 <Menu size={24} strokeWidth={1.5} />
             </button>
         </div>

         {/* Center: Chat-Liz pill */}
         <div className="flex-1 flex justify-center">
             <div className="bg-[#121B2A]/60 backdrop-blur-md border border-[#D4AF37]/30 rounded-full px-6 py-1.5 shadow-[0_0_15px_rgba(212,175,55,0.1)] flex items-center justify-center">
                 <h1 className="text-[16px] font-bold text-[#E8D9B0] tracking-wide">Chat-Liz</h1>
             </div>
         </div>

         {/* Right: Avatar, Name, Settings */}
         <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
             <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-3 py-1 rounded-full cursor-pointer hover:bg-amber-500/30 transition-colors" onClick={() => { closeAllModals(); setStoreCategory(undefined); setIsStoreOpen(true); }}>
                 <span className="text-amber-400 font-bold text-sm">{user.lizCoins || 0}</span>
                 <span className="text-xs text-amber-200">LM</span>
             </div>
             
             <button onClick={() => { closeAllModals(); setIsGamesMenuOpen(true); }} className="hidden sm:flex items-center gap-1.5 bg-[#121B2A]/60 border border-[#D4AF37]/30 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors group">
                 <Gamepad2 size={18} className="text-[#D4AF37] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                 <span className="font-bold text-[#E8D9B0] text-sm">Juegos</span>
             </button>
             
             <div className="relative group cursor-pointer" onClick={() => { closeAllModals(); setIsConfigOpen(true); }}>
                 <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.3)] group-hover:border-[#D4AF37] transition-all">
                     <img referrerPolicy="no-referrer" src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} className="w-full h-full object-cover" />
                 </div>
                 {user.activeDecoration && (
                     <div className="absolute inset-0 pointer-events-none scale-125 z-10 flex items-center justify-center">
                         <img referrerPolicy="no-referrer" src={user.activeDecoration} alt="marco" className="w-full h-full object-contain" />
                     </div>
                 )}
                 <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0B1220]"></div>
             </div>
         </div>
      </nav>

      <div className="flex flex-1 h-0 relative">
         {/* Sidebar Principal */}
         <aside className={`w-[280px] shrink-0 border-r border-[#D4AF37]/30 bg-[#121B2A]/95 backdrop-blur-xl absolute md:relative z-40 h-full flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
             <div className="p-4 flex flex-col items-center border-b border-[#D4AF37]/30">
                 <div className="relative mb-3 group cursor-pointer" onClick={() => { closeAllModals(); setIsConfigOpen(true); }}>
                     <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                         <img referrerPolicy="no-referrer" src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} className="w-full h-full object-cover" />
                     </div>
                     {user.activeDecoration && (
                         <div className="absolute inset-0 pointer-events-none scale-125 z-10 flex items-center justify-center">
                             <img referrerPolicy="no-referrer" src={user.activeDecoration} alt="marco" className="w-full h-full object-contain" />
                         </div>
                     )}
                     <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-[3px] border-[#121B2A]"></div>
                 </div>
                 <h2 className="text-[#E8D9B0] font-bold text-lg flex items-center gap-1.5">{user.username} {user?.username?.toUpperCase() === 'AXISS' && <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>}</h2>
                 <p className="text-[#8B98B0] text-xs">Conectado(a)</p>
             </div>

             <div className="px-4 mt-4 grid grid-cols-2 gap-2">
                     <button className={`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border ${activeChat === 'lizgram' ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm`} onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat('lizgram'); }}>
                        <ImageIcon size={16} strokeWidth={1.5} />
                        LizGram
                     </button>
                     <button className={`${user?.username?.toUpperCase() === 'AXISS' ? 'col-span-2' : 'col-span-1'} flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border ${isFriendsSidebarOpen ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm`} onClick={() => { closeAllModals(); setIsFriendsSidebarOpen(!isFriendsSidebarOpen); }}>
                        <Users size={16} strokeWidth={1.5} />
                        Inbox / Amigos
                        {Object.values(unreadPMs).some(v => v) && (
                           <div className="w-2 h-2 bg-cyan-500 rounded-full ml-1"></div>
                        )}
                     </button>
                 </div>
              
              <div className="w-full h-px bg-white/5 my-2"></div>

                          {/* AI Characters Button */}
             <div className="px-4 py-2">
                 <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-3 py-2.5 rounded-xl font-bold shadow-lg transition-transform active:scale-95" onClick={() => { closeAllModals(); setIsAiSelectorOpen(true); }}>
                    <Bot size={18} />
                    Personajes IA
                 </button>
             </div>
             {/* User Search */}
              <div className="px-4 py-2">
                 <form onSubmit={(e) => {
                     e.preventDefault();
                     const q = (e.target as any).elements.searchQuery.value.trim();
                     if(q) {
                         socket.emit('search_user', q, (res: any) => {
                             if(res.success) {
                                 setSelectedUserModal(res.user);
                             } else {
                                 alert('Usuario no encontrado');
                             }
                         });
                     }
                 }} className="relative">
                     <input 
                         name="searchQuery"
                         type="text" 
                         placeholder="Buscar por UID o Nombre..." 
                         className="w-full bg-[#12141c] text-sm text-white px-3 py-2 pl-8 rounded-xl border border-white/10 focus:border-[#D4AF37] focus:outline-none placeholder-gray-500"
                     />
                     <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                 </form>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin">
                 {usersOnline.map(u => {
                    if (['Elizabeth', 'Sensei', 'Shadow', 'Neko'].includes(u.username)) return null;
                    return (
                        <div key={u.username} className="bg-[#1A2639]/80 border border-[#D4AF37]/30 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat(u.username); }}>
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/50 relative flex-shrink-0">
                                   <img referrerPolicy="no-referrer" src={u.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.username} className="w-full h-full object-cover" />
                                   {u.activeDecoration && (
                                       <div className="absolute inset-0 pointer-events-none scale-125 z-10 flex items-center justify-center">
                                           <img referrerPolicy="no-referrer" src={u.activeDecoration} alt="marco" className="w-full h-full object-contain" />
                                       </div>
                                   )}
                               </div>
                               <div className="flex-1 min-w-0">
                                   <p className="text-[#E8D9B0] font-bold text-sm truncate flex items-center gap-1.5">{u.username} {u.username.toUpperCase() === 'AXISS' && <span className="bg-red-500/20 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>}</p>
                                   <p className="text-[#8B98B0] text-xs truncate">En línea</p>
                               </div>
                           </div>
                        </div>
                    );
                 })}
              </div>
          </aside>

          {/* Main Chat Container */}
          <main className="flex-1 min-w-0 min-h-0 relative flex flex-col bg-transparent overflow-hidden"
                style={{ background: chatBg ? `url(${chatBg}) center/cover no-repeat` : undefined }}>
              
              {/* Chat Content Wrapper */}
              <div className="flex-1 min-h-0 min-w-0 flex flex-col relative z-0">
                  <div className="hidden"></div>

                  {activeChat === 'lizgram' ? (
                     <SocialFeed user={user} onClose={() => setActiveChat('global')} />
                  ) : (
                <>
                  {activeChat !== 'global' && (() => {
                      
                      const aiChar = ['Elizabeth', 'Sensei', 'Shadow', 'Neko'].includes(activeChat) ? {
                          username: activeChat,
                          profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat}`,
                          statusMessage: 'Inteligencia Artificial',
                          isAi: true
                      } : null;
                      const targetUser = aiChar || usersOnline.find(u => u.username === activeChat) || userCache[activeChat];

                      const isOnline = !!aiChar || !!usersOnline.find(u => u.username === activeChat);
                      const avatarUrl = targetUser?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat}`;
                      
                      return (
                      <div className="bg-[#121B2A]/95 backdrop-blur-md border-b border-[#D4AF37]/30 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-lg">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#1A2639] border border-[#D4AF37]/50 flex items-center justify-center overflow-hidden shadow-sm relative">
                                 <img referrerPolicy="no-referrer" src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                 <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1A2639] ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[#E8D9B0] font-bold text-lg leading-tight flex items-center gap-1.5">
                                     {activeChat} <span className="text-[10px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/30 uppercase tracking-wider">Privado</span>
                                 </span>
                                 <span className="text-[#8B98B0] text-xs font-medium">
                                    {isOnline ? <span className="text-green-400">En línea</span> : 'Desconectado'} • Solo tú y {activeChat} pueden ver este chat
                                 </span>
                              </div>
                          </div>
                          <button onClick={() => setActiveChat('global')} className="text-sm font-bold text-[#D4AF37] hover:text-[#E8D9B0] bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors border border-[#D4AF37]/20 flex items-center gap-2">
                              <Globe size={16} /> Volver al Mundo
                          </button>
                      </div>
                      );
                  })()}
              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 space-y-1.5 scrollbar-thin">
                  {messages.filter(m => m && m.sender).filter(m => {
                      if (user.blocked_list?.includes(m.sender)) return false;
                      const senderInfo = usersOnline.find(u => u.username === m.sender);
                      if (senderInfo?.blocked_list?.includes(user.username)) return false;
                      return true;
                  }).map((m, idx) => {
                     const isLiz = m.sender === 'Elizabeth' || m.isAi;
                     const isMe = m.sender === user.username;
                     let date = new Date();
                                        if (m.timestamp || m.createdAt) {
                                            const t = m.timestamp || m.createdAt;
                                            if (typeof t === 'number') date = new Date(t);
                                            else if (t.seconds) date = new Date(t.seconds * 1000);
                                            else if (typeof t.toDate === 'function') date = t.toDate();
                                            else date = new Date(t);
                                        }
                     const timeStr = isNaN(date.getTime()) ? `10:0${idx % 10}` : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                     const senderInfo = isMe ? user : (usersOnline.find(u => u.username === m.sender) || userCache[m.sender]);
                     const decId = senderInfo?.activeDecoration;
                     const decUrl = decId ? DECORATIONS.find(d => d.id === decId)?.url : null;
                     const avatarUrl = senderInfo?.profilePic || m.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.sender}`;

                     return (
                         <div key={m.id || idx} className="flex justify-start px-1 md:px-2">
                             {isLiz ? (
                                 <div className="flex gap-2 w-full max-w-[98%] mt-1 group">
                                     <div className="relative shrink-0 mt-1">
                                        <img referrerPolicy="no-referrer" src={avatarUrl} className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]/50" alt={m.sender} />
                                        {decUrl && (
                                            <div className="absolute -inset-3 pointer-events-none z-10 flex items-center justify-center">
                                                <img referrerPolicy="no-referrer" src={decUrl} className="w-[130%] h-[130%] object-contain filter drop-shadow-sm" style={{ imageRendering: 'pixelated' }} alt="" />
                                            </div>
                                        )}
                                     </div>
                                     <div className="flex flex-col border-l-[3px] border-[#D4AF37]/20 pl-2.5 ml-1 flex-1 min-w-[200px]">
                                         <div className="flex flex-col w-full relative">
                                             <span className="font-bold text-[#D4AF37] text-[13px] relative z-20 mb-1">ELIZABETH {m.isAi && '(IA Administradora Gemini ✨)'}</span>
                                             <div className="flex flex-wrap items-end justify-between gap-2">
                                                <span className="text-[#E8D9B0] text-[14px] leading-snug flex-1">{m.text}</span>
                                                <span className="text-[#8B98B0] text-[11px] font-mono shrink-0 ml-auto pl-2">{timeStr}</span>
                                             </div>
                                         </div>
                                         {m.image && <div className="mt-1.5"><img referrerPolicy="no-referrer" src={m.image} className="rounded-xl border border-white/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}
                                         {(m.type === 'audio' || m.audio) && <div className="mt-1.5"><PremiumAudioPlayer src={m.audio} /></div>}
                                     </div>
                                 </div>
                             ) : (
                                 <div className="flex gap-2 w-full mt-1.5 group">
                                     <div className="relative shrink-0 mt-1">
                                        <img referrerPolicy="no-referrer" src={avatarUrl} className="w-8 h-8 rounded-full object-cover border border-[#5A52A5]/30 shadow-sm bg-white/5" alt={m.sender} />
                                        {decUrl && (
                                            <div className="absolute -inset-3 pointer-events-none z-10 flex items-center justify-center">
                                                <img referrerPolicy="no-referrer" src={decUrl} className="w-[130%] h-[130%] object-contain filter drop-shadow-sm opacity-80 mix-blend-multiply" style={{ imageRendering: 'pixelated' }} alt="" />
                                            </div>
                                        )}
                                     </div>
                                     <div className="bg-[#F2E3C6] rounded-[20px] rounded-tl-sm px-3.5 py-2 max-w-[85%] shadow-sm flex flex-col relative min-w-[150px]">
                                         <span className="font-bold text-[#5A52A5] text-[13px] mb-1">{m.sender}</span>
                                         <div className="flex flex-wrap items-end justify-between gap-2">
                                             <span className="text-[#1A2035] text-[14px] leading-snug flex-1">{m.text}</span>
                                             <span className="text-[#8B98B0] text-[11px] font-mono shrink-0 ml-auto pl-2 pt-1">{timeStr}</span>
                                         </div>
                                         

                                         {m.type === 'chess_invite' && m.inviteData && (
                                             <button 
                                                disabled={m.sender === user.username}
                                                onClick={() => {
                                                 if (m.sender === user.username) return; // Can't accept own invite
                                                 if ((user.lizCoins || 0) < m.inviteData!.bet) {
                                                     alert("No tienes suficientes Liz-Moneditas.");
                                                     return;
                                                 }
                                                 socket.emit('accept_chess_invite', m.inviteData, (res: any) => {
                                                     if (res.success) {
                                                         setActiveChessGame({ id: m.inviteData!.gameId, opponent: usersOnline.find(u => u.username === m.sender) || {username: m.sender}, bet: m.inviteData!.bet, isHost: false });
                                                     } else {
                                                         alert(res.error || "Error al aceptar el reto.");
                                                     }
                                                 });
                                             }} className={`w-full mt-2 py-1.5 ${m.sender === user.username ? 'bg-indigo-800/50 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md'} text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2`}>
                                                 <Gamepad2 size={16} /> {m.sender === user.username ? 'Esperando rival...' : '[Jugar Ajedrez]'}
                                             </button>
                                         )}

                                         {m.image && <div className="w-full mt-1.5"><img referrerPolicy="no-referrer" src={m.image} className="rounded-xl border border-black/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}
                                         {(m.type === 'audio' || m.audio) && <div className="w-full mt-1.5"><PremiumAudioPlayer src={m.audio} /></div>}
                                     </div>
                                 </div>
                             )}
                         </div>
                     );
                  })}

                  {/* Typing Indicator */}
                  {typingUsers[activeChat] && typingUsers[activeChat].length > 0 && (
                     <div className="flex flex-col gap-1 mb-4 px-2 md:px-6">
                        {typingUsers[activeChat].includes("Elizabeth") && (
                           <div className="text-[#D4AF37] text-sm font-medium italic flex items-center">
                              ELIZABETH está escribiendo<span className="ml-1 flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.4s'}}>.</span></span>
                           </div>
                        )}
                        {typingUsers[activeChat].filter(u => u !== "Elizabeth").length > 0 && (
                           <div className="text-[#8B98B0] text-sm font-medium italic">
                              {typingUsers[activeChat].filter(u => u !== "Elizabeth").join(", ")} {typingUsers[activeChat].filter(u => u !== "Elizabeth").length > 1 ? 'están' : 'está'} escribiendo...
                           </div>
                        )}
                     </div>
                  )}

                  <div ref={bottomRef} className="h-2" />
              </div>

              {/* Input Area */}
              <div className="px-2 pb-2 pt-1 shrink-0 bg-transparent relative z-10 max-w-5xl w-full mx-auto">
                  {(selectedImage || audioUrl || selectedGif) && (
                    <div className="flex gap-4 mb-3">
                      {selectedImage && (
                        <div className="relative inline-block animate-in fade-in slide-in-from-bottom-2">
                           <img referrerPolicy="no-referrer" src={selectedImage} alt="Preview" className="h-16 w-16 rounded-xl border-2 border-[#D4AF37] object-cover shadow-lg" />
                           <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-full p-1.5 shadow-xl"><X size={14} /></button>
                        </div>
                      )}
                      {selectedGif && (
                        <div className="relative inline-block animate-in fade-in slide-in-from-bottom-2">
                           <img referrerPolicy="no-referrer" src={selectedGif} alt="GIF Preview" className="h-16 w-16 rounded-xl border-2 border-[#D4AF37] object-cover shadow-lg" />
                           <button onClick={() => setSelectedGif(null)} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-full p-1.5 shadow-xl"><X size={14} /></button>
                        </div>
                      )}
                      {audioUrl && (
                        <div className="relative inline-block animate-in fade-in slide-in-from-bottom-2">
                           <PremiumAudioPlayer src={audioUrl} />
                           <button onClick={() => setAudioUrl(null)} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-full p-1.5 shadow-xl"><X size={14} /></button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 relative">
                      <InlineRadio />
      {user.role === 'dj' && (
         <button 
            onClick={() => { closeAllModals(); setIsDjPanelOpen(true); }}
            className="fixed bottom-36 left-4 z-[105] bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 text-[#D4AF37] p-3 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
            title="Panel de DJ"
         >
            <Mic size={20} />
         </button>
      )}
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                      <div className="flex-1 bg-[#121B2A]/60 border border-[#D4AF37]/50 rounded-[24px] flex items-center px-3 relative shadow-[0_0_15px_rgba(212,175,55,0.05)] focus-within:border-[#D4AF37] focus-within:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all overflow-hidden h-[46px]">
                          {isRecording ? (
                              <div className="w-full h-full"><PremiumAudioVisualizer stream={recordingStream} /></div>
                          ) : (
                              <>
                                  <input 
                                     value={inputValue}
                                     onChange={handleInputChange}
                                     onKeyDown={e => {
                                        if (e.key === 'Enter') handleSendMessage();
                                     }}
                                     className="flex-1 min-w-0 py-2 h-full bg-transparent outline-none text-[#E8D9B0] placeholder-[#D4AF37]/60 text-[14px]" 
                                     placeholder="Escribe tu mensaje... @Elizabeth"
                                  />
                                  <div className="flex items-center gap-0.5 text-[#D4AF37]/80 shrink-0 ml-1">
                                      <div className="relative flex items-center justify-center">
                                          <button onClick={() => { closeAllModals(); setIsSongRequestOpen(true); }} className="flex items-center justify-center hover:text-pink-400 p-1 transition-colors" title="Pedir Canción"><Music size={18} strokeWidth={1.5} /></button>
                                      </div>
                                      <div className="relative flex items-center justify-center">
                                          <button onClick={() => { closeAllModals(); setIsGamesMenuOpen(true); }} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors" title="Juegos"><Gamepad2 size={18} strokeWidth={1.5} /></button>
                                      </div>
                                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors"><Smile size={18} strokeWidth={1.5} /></button>
                                      <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors"><Paperclip size={18} strokeWidth={1.5} /></button>
                                  </div>
                              </>
                          )}
                      </div>
                      
                      {showEmojiPicker && (
                         <EmojiGifPicker 
                           onSelect={(type, val) => {
                              if (type === 'emoji') setInputValue(prev => prev + val);
                              if (type === 'gif') setSelectedGif(val);
                           }} 
                           onClose={() => setShowEmojiPicker(false)} 
                         />
                      )}

                      <div className="flex items-center gap-1">
                          <button 
                            onClick={toggleRecording}
                            className={`w-[46px] h-[46px] flex items-center justify-center rounded-[16px] transition-colors shrink-0 ${isRecording ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-[#121B2A]/80 border border-[#D4AF37]/50 text-[#D4AF37] hover:text-[#E8D9B0] hover:bg-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]'}`}>
                             {isRecording ? <StopCircle size={20} strokeWidth={1.5} /> : <Mic size={20} strokeWidth={1.5} />}
                          </button>
                          <button 
                            onClick={handleSendMessage} 
                            disabled={!inputValue.trim() && !selectedImage && !audioUrl && !selectedGif}
                            className="w-[46px] h-[46px] rounded-[16px] bg-[#121B2A]/80 backdrop-blur-md border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] hover:text-[#E8D9B0] hover:bg-[#D4AF37]/20 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] shrink-0 disabled:opacity-50 disabled:shadow-none"
                          >
                            <Send size={20} className="ml-0.5" strokeWidth={1.5} />
                          </button>
                      </div>
                  </div>
              </div>
              </>
                  )}
              </div>
          </main>
      </div>

      {activeChessGame && activeChessGame.isBot && (
          <ChessBotModal
              onClose={() => setActiveChessGame(null)}
              user={user}
              gameId={activeChessGame.gameId}
              opponent={activeChessGame.opponent}
              bet={activeChessGame.bet}
              isHost={activeChessGame.isHost}
          />
      )}
      

      {activeChessGame && !activeChessGame.isBot && (
          <ChessGameModal
              onClose={() => setActiveChessGame(null)}
              user={user}
              gameId={activeChessGame.gameId || activeChessGame.id}
              opponent={activeChessGame.opponent}
              bet={activeChessGame.bet}
              isHost={activeChessGame.isHost}
          />
      )}

      {isConfigOpen && (
        <ProfileConfigModal
          user={user}
          setUser={setUser}
          setIsConfigOpen={setIsConfigOpen}
          setAdminConfigAiOpen={setAdminConfigAiOpen}
          usersOnline={usersOnline}
          setAiProfileForm={setAiProfileForm}
        />
      )}

      {adminConfigAiOpen && (
        <AdminConfigAiModal
          aiUsername={currentAdminAi}
          setAdminConfigAiOpen={setAdminConfigAiOpen}
          aiProfileForm={aiProfileForm}
          setAiProfileForm={setAiProfileForm}
        />
      )}

      
       {/* Toasts Notifications */}
       <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
           {toasts.map(toast => {
               const senderInfo = usersOnline.find(u => u.username === toast.sender) || userCache[toast.sender];
               const senderPic = senderInfo?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${toast.sender}`;
               return (
                   <div key={toast.id} onClick={() => {
                       setIsSidebarOpen(false);
                       setIsFriendsSidebarOpen(false);
                       setActiveChat(toast.sender);
                       setToasts(prev => prev.filter(t => t.id !== toast.id));
                   }} className="pointer-events-auto cursor-pointer bg-[#0f111a]/95 backdrop-blur-xl border border-[#D4AF37]/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] rounded-2xl p-3 flex items-center gap-3 w-72 animate-in fade-in slide-in-from-top-4 transition-all hover:bg-white/5">
                       <img referrerPolicy="no-referrer" src={senderPic} alt={toast.sender} className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/30" />
                       <div className="flex flex-col flex-1 min-w-0">
                           <span className="text-[#E8D9B0] font-bold text-sm truncate">{toast.sender}</span>
                           <span className="text-gray-400 text-xs truncate">{toast.text}</span>
                       </div>
                   </div>
               );
           })}
       </div>

      {/* Selected User Info Modal */}
       
            {incomingCall && (
        <CallModal 
            caller={incomingCall}
            onAccept={() => {
                socket.emit('responder_llamada', { targetUser: incomingCall, accepted: true });
                setActiveCall(incomingCall);
                setIncomingCall(null);
            }}
            onReject={() => {
                socket.emit('responder_llamada', { targetUser: incomingCall, accepted: false });
                setIncomingCall(null);
            }}
        />
      )}

      {activeCall && (
        <ActiveCallModal 
            partner={activeCall}
            onEndCall={() => {
                setActiveCall(null);
            }}
        />
      )}
      {isAiSelectorOpen && (
        <AiSelectorModal usersOnline={usersOnline}
          onClose={() => setIsAiSelectorOpen(false)}
          userCoins={user.lizCoins || 0}
          socket={socket}
          onSelect={(id) => {
            setIsAiSelectorOpen(false);
            setIsSidebarOpen(false);
            setActiveChat(id);
          }}
        />
      )}

      {selectedUserModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4" onClick={() => setSelectedUserModal(null)}>
           <div className="bg-[#12141c] p-8 rounded-3xl w-full max-w-sm shadow-2xl relative border border-white/10 text-center" onClick={e => e.stopPropagation()}>
             <button onClick={() => setSelectedUserModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={20} />
             </button>
             <div 
                className={`w-24 h-24 mx-auto mb-4 rounded-full border border-white/10 overflow-visible relative ${selectedUserModal.isAi && user.username.trim() === 'Axiss' ? 'cursor-pointer group' : ''}`}
                onClick={() => {
                    if (selectedUserModal.isAi && user.username.trim() === 'Axiss') {
                        setAiProfileForm({ profilePic: selectedUserModal.profilePic || '', statusMessage: selectedUserModal.statusMessage || 'Inteligencia Artificial', systemInstruction: selectedUserModal.systemInstruction || '' });
                        setCurrentAdminAi(selectedUserModal.username);
                        setSelectedUserModal(null);
                        closeAllModals(); setAdminConfigAiOpen(true);
                    }
                }}
             >
                {selectedUserModal.activeDecoration && (
                    <div className="absolute -inset-4 pointer-events-none z-10 flex items-center justify-center">
                        <img referrerPolicy="no-referrer" src={DECORATIONS.find(d => d.id === selectedUserModal.activeDecoration)?.url} className="w-full h-full object-contain filter drop-shadow-lg" style={{ imageRendering: 'pixelated' }} alt="" />
                    </div>
                )}
                <div className="w-full h-full rounded-full overflow-hidden relative z-0">
                    <img referrerPolicy="no-referrer" src={selectedUserModal.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserModal.username}`} className="w-full h-full object-cover" alt="Avatar" />
                    {selectedUserModal.isAi && user.username.trim() === 'Axiss' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-white uppercase text-center px-1">Cambiar Foto</span>
                        </div>
                    )}
                </div>
             </div>
             <h3 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                {selectedUserModal.username}
                {Array.isArray(selectedUserModal.awards) && selectedUserModal.awards.map((award, idx) => (
                    <span key={idx} className="text-xl" title="Galardón: Pluma Infinita">{award}</span>
                ))}
                {selectedUserModal.role === 'admin' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">Admin</span>}
             </h3>
             <div className="flex justify-center items-center gap-3 mb-4">
                 <p className="text-cyan-400 text-sm">Online</p>
                 <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                     <span className="text-amber-500 font-bold text-xs">{selectedUserModal.lizCoins || 0}</span>
                     <span className="text-[10px] text-amber-500/70">Liz-Moneditas</span>
                 </div>
             </div>
             
             <div className="bg-[#0a0a16] border border-white/5 p-4 rounded-2xl relative mb-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#12141c] px-2 text-xs text-gray-500 font-semibold uppercase">Estado</div>
                <p className="text-gray-300 italic text-sm">
                   "{selectedUserModal.statusMessage || 'Disponible'}"
                </p>
             </div>
             
             {/* Friends Banner */}
             <div className="bg-[#0a0a16] border border-cyan-500/20 p-4 rounded-2xl relative mb-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#12141c] px-2 text-xs text-cyan-400 font-semibold uppercase flex items-center gap-1">
                   <Users size={12} /> Amigos
                </div>
                {selectedUserModal.username === user.username || selectedUserModal.is_friends_public ? (
                   <p className="text-gray-300 text-sm">
                      {(selectedUserModal.username === user.username ? user.friends_list : selectedUserModal.friends_list)?.length ? 
                        (selectedUserModal.username === user.username ? user.friends_list : selectedUserModal.friends_list)?.join(', ')
                        : 'No hay amigos para mostrar.'}
                   </p>
                ) : (
                   <p className="text-gray-500 text-sm italic">
                      La lista de amigos de este usuario es privada.
                   </p>
                )}
             </div>
             
             {selectedUserModal.username !== user.username && (
               <div className="flex flex-col gap-2 mt-6">
                   <div className="flex gap-2">
                       <button 
                         onClick={() => { 
    window.history.pushState({}, '', '/chat/' + encodeURIComponent(selectedUserModal.username));
    setActiveChat(selectedUserModal.username); 
    setActiveChat(selectedUserModal.username);
                             setSelectedUserModal(null);
                             setIsSidebarOpen(false);
                             notifyOwner(selectedUserModal.username, 'CHAT', user.username);
}}
                         className="flex-1 flex items-center justify-center gap-2 text-white bg-white/5 hover:bg-white/10 p-3 rounded-xl font-medium transition-colors border border-white/10"
                       >
                         <MessageCircle size={18} />
                         Chat Privado
                       </button>
                       <button 
                         onClick={() => {
                             socket.emit('like_user', selectedUserModal.username);
                             setSelectedUserModal(prev => prev ? { ...prev, profileLikes: (prev.profileLikes || 0) + 1 } : null);
                             notifyOwner(selectedUserModal.username, 'LIKE', user.username);
                         }}
                         className="flex-1 flex items-center justify-center gap-2 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 p-3 rounded-xl font-medium transition-colors border border-pink-500/20"
                       >
                         <Heart size={18} />
                         Dar Like
                       </button>
                   </div>
                   {selectedUserModal.username !== 'Elizabeth' && (
                     <div className="flex gap-2">
                         <button 
                             onClick={() => {
                                 if (user.friends_list?.includes(selectedUserModal.username)) {
                                     import('firebase/firestore').then(({ doc, updateDoc, arrayRemove }) => {
                                         updateDoc(doc(db, 'users', user.username), { friends_list: arrayRemove(selectedUserModal.username) });
                                         updateDoc(doc(db, 'users', selectedUserModal.username), { friends_list: arrayRemove(user.username) });
                                     });
                                     setUser(prev => ({ ...prev, friends_list: prev.friends_list?.filter(f => f !== selectedUserModal.username) }));
                                     setSelectedUserModal(null);
                                 } else {
                                     import('firebase/firestore').then(({ addDoc, collection }) => {
                                         addDoc(collection(db, 'friendRequests'), { from: user.username, to: selectedUserModal.username, status: 'pending', timestamp: Date.now(), createdAt: Date.now() }).then(docRef => {
                                              notifyOwner(selectedUserModal.username, 'REQUEST', user.username, { frData: { from: user.username, docId: docRef.id } });
                                         });
                                     });
                                     setSelectedUserModal(null);
                                     alert("Solicitud enviada");
                                 }
                             }}
                             className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border ${user.friends_list?.includes(selectedUserModal.username) ? 'text-green-400 bg-green-500/10 border-green-500/20 hover:bg-green-500/20' : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20'}`}
                         >
                             <UserPlus size={18} />
                             {user.friends_list?.includes(selectedUserModal.username) ? 'Quitar Amigo' : 'Enviar Solicitud'}
                         </button>
                         {selectedUserModal.role !== 'admin' && (
                             <button 
                                 onClick={() => {
                                     socket.emit('iniciar_llamada', selectedUserModal.username);
                                     setSelectedUserModal(null);
                                 }}
                                 className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20"
                             >
                                 <PhoneCall size={18} />
                                 Llamar
                             </button>
                         )}
                     </div>
                   )}
               </div>
             )}
           </div>
         </div>
       )}

       
       {/* Friends Sidebar (Inbox) */}
       {isFriendsSidebarOpen && (
           <div className="fixed inset-y-0 right-0 w-80 bg-[#0f111a] backdrop-blur-xl border-l border-white/10 shadow-2xl z-[105] flex flex-col transform transition-transform animate-in slide-in-from-right">
               <div className="p-6 border-b border-white/5 flex items-center justify-between">
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                       <MessageSquare size={24} className="text-cyan-400" />
                       Buzón de Mensajes
                   </h2>
                   <button onClick={() => setIsFriendsSidebarOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                       <X size={20} />
                   </button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-2">
                   {chatList.length === 0 ? (
                       <p className="text-gray-500 text-center text-sm mt-10">Tu buzón está vacío. ¡Empieza a chatear!</p>
                   ) : (
                       chatList.map(chatInfo => {
                           const friendUsername = chatInfo.withUser;
                           const isOnline = usersOnline.some(u => u.username === friendUsername);
                           const friendInfo = usersOnline.find(u => u.username === friendUsername) || userCache[friendUsername];
                           
                           return (
                               <div key={friendUsername} className="flex items-center gap-2 group p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                   <div 
                                       onClick={() => { setActiveChat(friendUsername); setUnreadPMs(prev => ({...prev, [friendUsername]: false})); setIsFriendsSidebarOpen(false); }}
                                       className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                                   >
                                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 overflow-hidden relative flex-shrink-0">
                                           <img referrerPolicy="no-referrer" src={friendInfo?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendUsername}`} className="w-full h-full object-cover" />
                                           <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f111a] ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                       </div>
                                       <div className="flex-1 min-w-0">
                                           <div className="flex justify-between items-center">
                                               <p className="text-white font-medium text-sm truncate">{friendUsername}</p>
                                               {unreadPMs[friendUsername] && <div className="w-2 h-2 rounded-full bg-cyan-500 ml-2"></div>}
                                           </div>
                                           <p className="text-xs text-gray-500 truncate">{chatInfo.lastMessage || 'Conversación'}</p>
                                       </div>
                                   </div>
                                   <button 
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           if(window.confirm('¿Eliminar esta conversación de tu buzón?')) {
                                               import('firebase/firestore').then(({ deleteDoc, doc }) => {
                                                   deleteDoc(doc(db, "userChats", user.username, "chats", friendUsername));
                                               });
                                           }
                                       }}
                                       className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                       title="Eliminar del buzón"
                                   >
                                       <Trash2 size={16} />
                                   </button>
                               </div>
                           );
                       })
                   )}
               </div>
           </div>
       )}
       {/* Games Menu Modal */}
      {isGamesMenuOpen && (
          <GamesMenuModal
              onClose={() => setIsGamesMenuOpen(false)}
              user={user}
              onSelectGame={(gameId) => {
                  if (gameId.startsWith('chess_')) {
                       const parsedBet = parseInt(gameId.split('_')[1], 10);
                      const bet = isNaN(parsedBet) ? 10 : parsedBet;
                       if ((user.lizCoins || 0) < bet) {
                           alert("No tienes suficientes Liz-Moneditas.");
                           return;
                       }
                       const msgData = {
                           id: Date.now().toString(),
                           text: bet > 0 ? `¡Reto de Ajedrez por ${bet * 2} LM!` : `¡Reto de Ajedrez Amistoso!`,
                           type: 'chess_invite',
                           sender: user.username,
                           senderId: user.username,
                           avatar: user.profilePic,
                           inviteData: { gameId: `chess_${Date.now()}_${user.username}`, bet: bet, host: user.username, gameType: 'chess' }
                       };
                       socket.emit('send_global', msgData);
                       setActiveChat('global');
                       setMessages(prev => [...prev, msgData]);
                       setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

                  
                  
                  
                  } else if (gameId.startsWith('chessbot_')) {
                      const parsedBet = parseInt(gameId.split('_')[1], 10);
                      const bet = isNaN(parsedBet) ? 10 : parsedBet;
                      if ((user.lizCoins || 0) < bet) {
                          alert("No tienes suficientes Liz-Moneditas.");
                          return;
                      }
                      // Ask server to start bot game and deduct bet
                      socket.emit('start_chess_bot', { bet }, (res: any) => {
                          if (res.success) {
                              setActiveChessGame({
                                  gameId: res.gameId,
                                  opponent: { username: 'Elizabeth_Bot', elo: 800, profilePic: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elizabeth' } as any,
                                  bet: bet,
                                  isHost: true,
                                  isBot: true
                              });
                          } else {
                              alert(res.error || 'Error al iniciar vs Bot');
                          }
                      });
                  }
              }}
          />
      )}

      {/* Store Modal */}
       {isSongRequestOpen && (
          <SongRequestModal
              onClose={() => setIsSongRequestOpen(false)}
              onSubmit={(title, url, dedication) => {
                  socket.emit('song_request', { title, url, dedication });
                  setIsSongRequestOpen(false); setIsDjPanelOpen(false);
              }}
          />
      )}

      {isStoreOpen && (
           <StoreModal 
               onClose={() => setIsStoreOpen(false)} 
               user={user} 
               decorations={DECORATIONS}
               initialCategory={storeCategory}
               onSelectGame={(gameId) => {
                   if (gameId.startsWith('chess_')) {
                       const parsedBet = parseInt(gameId.split('_')[1], 10);
                      const bet = isNaN(parsedBet) ? 10 : parsedBet;
                       if ((user.lizCoins || 0) < bet) {
                           alert("No tienes suficientes Liz-Moneditas.");
                           return;
                       }
                       const msgData = {
                           id: Date.now().toString(),
                           text: bet > 0 ? `¡Reto de Ajedrez por ${bet * 2} LM!` : `¡Reto de Ajedrez Amistoso!`,
                           type: 'chess_invite',
                           sender: user.username,
                           senderId: user.username,
                           avatar: user.profilePic,
                           inviteData: { gameId: `chess_${Date.now()}_${user.username}`, bet: bet, host: user.username, gameType: 'chess' }
                       };
                       socket.emit('send_global', msgData);
                       setActiveChat('global');
                       setMessages(prev => [...prev, msgData]);
                       setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

                   
                  
                  } else if (gameId.startsWith('chessbot_')) {
                      const parsedBet = parseInt(gameId.split('_')[1], 10);
                      const bet = isNaN(parsedBet) ? 10 : parsedBet;
                      if ((user.lizCoins || 0) < bet) {
                          alert("No tienes suficientes Liz-Moneditas.");
                          return;
                      }
                      socket.emit('start_chess_bot', { bet }, (res: any) => {
                          if (res.success) {
                              setActiveChessGame({
                                  gameId: res.gameId,
                                  opponent: { username: 'Elizabeth_Bot', elo: 800, profilePic: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elizabeth' } as any,
                                  bet: bet,
                                  isHost: true,
                                  isBot: true
                              });
                          } else {
                              alert(res.error || 'Error al iniciar vs Bot');
                          }
                      });
                   }
               }}
           />
       )}

    </div>
  );
}




export default function App() {
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #07090e;
          color: #e2e8f0;
          margin: 0;
          overflow: hidden;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
      <MainApp />
    </>
  );
}
