import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, MessageSquare, Settings, 
  Image as ImageIcon, Mic, StopCircle, 
  ArrowLeft, Users, X, LogOut, Check
} from 'lucide-react';
import { socket } from './socket';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userCredentials, setUserCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeChat, setActiveChat] = useState('global');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const [isPrivatePanelOpen, setIsPrivatePanelOpen] = useState(false);
  const [usersOnline, setUsersOnline] = useState<string[]>(['Elizabeth']); 

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Authenticate
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCredentials.username || !userCredentials.password || loggingIn) return;
    
    setLoggingIn(true);
    socket.emit('register_or_login', userCredentials, (res: any) => {
      setLoggingIn(false);
      if (res.success) {
        setCurrentUser(userCredentials.username);
      } else {
        setLoginError(res.error || 'Error al iniciar sesión');
      }
    });
  };

  // Socket sync
  useEffect(() => {
    if (!currentUser) return;
    
    socket.emit('get_history', activeChat === 'global' ? undefined : activeChat);
    
    socket.on('history', (historyMsgs: any[]) => {
      setMessages(historyMsgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    socket.on('message', (msg: any) => {
      if (activeChat === 'global') {
          setMessages(prev => [...prev, msg]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    socket.on('private_message', (msg: any) => {
      const isRelevant = 
         (msg.sender === activeChat && msg.to === currentUser) || 
         (msg.sender === currentUser && msg.to === activeChat);
         
      if (isRelevant && activeChat !== 'global') {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    socket.on('users_update', (users: string[]) => {
      // Filtrar a Elizabeth que la controlamos virtualmente en backend.
      const cleaned = users.filter(u => u !== 'Elizabeth');
      cleaned.unshift('Elizabeth'); // Always show Elizabeth at top
      setUsersOnline(cleaned);
    });

    return () => {
      socket.off('history');
      socket.off('message');
      socket.off('private_message');
      socket.off('users_update');
    };
  }, [currentUser, activeChat]);

  // Request history on chat switch
  useEffect(() => {
    if (currentUser) {
      socket.emit('get_history', activeChat === 'global' ? undefined : activeChat);
    }
  }, [activeChat, currentUser]);

  const handleSendMessage = () => {
    if (!inputValue.trim() && !selectedImage && !audioUrl) return;
    
    const payload: any = { text: inputValue };
    if (selectedImage) payload.image = selectedImage;
    if (audioUrl) payload.audio = audioUrl;
    if (activeChat !== 'global') {
       payload.to = activeChat;
    }

    socket.emit('sendMessage', payload);
    
    setInputValue('');
    setSelectedImage(null);
    setAudioUrl(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => setAudioUrl(reader.result as string);
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const updateAccount = () => {
    socket.emit('update_account', { newUsername: userCredentials.username, newPassword: userCredentials.password }, (res: any) => {
      if (res.success) {
        setIsConfigOpen(false);
        socket.emit('logout'); // Re-login to apply properly
        setCurrentUser(null);
      } else {
        alert(res.error || "No se pudo actualizar");
      }
    });
  };

  if (!currentUser) {
    return (
      <div className="h-[100dvh] bg-black text-white flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm bg-gray-950 p-8 rounded-3xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
          <h2 className="text-3xl font-bold mb-6 text-center text-purple-400">Chat-Liz</h2>
          <form onSubmit={handleLogin}>
            <input 
              className="w-full bg-gray-900 p-4 rounded-xl mb-4 border border-gray-800 outline-none focus:border-purple-500 text-white placeholder-gray-500" 
              placeholder="Nombre" 
              value={userCredentials.username}
              onChange={e => setUserCredentials({...userCredentials, username: e.target.value})} 
              maxLength={20}
            />
            <input 
              className="w-full bg-gray-900 p-4 rounded-xl mb-6 border border-gray-800 outline-none focus:border-purple-500 text-white placeholder-gray-500" 
              type="password" 
              placeholder="Contraseña" 
              value={userCredentials.password}
              onChange={e => setUserCredentials({...userCredentials, password: e.target.value})} 
            />
            {loginError && <p className="text-red-400 text-sm mb-4 text-center px-2">{loginError}</p>}
            <button 
              type="submit" 
              disabled={loggingIn || !userCredentials.username || !userCredentials.password}
              className="w-full bg-purple-600 p-4 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loggingIn ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-black text-white flex flex-col font-sans overflow-hidden relative">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-10 transition-colors">
        <div className="flex items-center gap-3">
          {activeChat !== 'global' && <ArrowLeft onClick={() => setActiveChat('global')} className="cursor-pointer text-purple-400 hover:text-purple-300" />}
          <h2 className="font-bold text-lg tracking-wide">{activeChat === 'global' ? 'Chat-Liz' : activeChat}</h2>
        </div>
        <div className="flex gap-4">
          <MessageSquare onClick={() => setIsPrivatePanelOpen(!isPrivatePanelOpen)} className="text-purple-400 cursor-pointer hover:text-purple-300" size={24} />
          <Settings onClick={() => setIsConfigOpen(true)} className="cursor-pointer text-gray-400 hover:text-white" />
        </div>
      </header>

      {isPrivatePanelOpen && (
        <div className="absolute inset-0 z-50 bg-black/95 p-6 flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Chats Privados</h2>
            <X onClick={() => setIsPrivatePanelOpen(false)} className="cursor-pointer text-gray-400 hover:text-white" size={28} />
          </div>
          <div className="space-y-4 overflow-y-auto flex-1">
            {usersOnline.map(u => (
              <div 
                key={u} 
                onClick={() => { 
                  if (u !== currentUser) {
                     setActiveChat(u); 
                     setIsPrivatePanelOpen(false);
                  }
                }} 
                className="p-4 bg-gray-900 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-800 transition shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-900/50 text-purple-300 flex items-center justify-center font-bold">
                    {u.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-lg">{u} {u === currentUser && '(Tú)'}</span>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {isConfigOpen && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-gray-950 p-8 rounded-3xl border border-purple-500/50 w-full max-w-sm flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Configuración</h3>
              <X onClick={() => setIsConfigOpen(false)} className="cursor-pointer text-gray-400 hover:text-white" size={24} />
            </div>
            
            <div className="mb-6">
              <input 
                 className="w-full bg-gray-900 p-4 rounded-xl mb-4 border border-gray-800 outline-none focus:border-purple-500 text-white placeholder-gray-500" 
                 value={userCredentials.username} 
                 onChange={e => setUserCredentials({...userCredentials, username: e.target.value})} 
                 placeholder="Cambiar nombre" 
              />
              <input 
                 className="w-full bg-gray-900 p-4 rounded-xl mb-4 border border-gray-800 outline-none focus:border-purple-500 text-white placeholder-gray-500" 
                 type="password" 
                 value={userCredentials.password} 
                 onChange={e => setUserCredentials({...userCredentials, password: e.target.value})} 
                 placeholder="Nueva contraseña" 
              />
              <button 
                 onClick={updateAccount} 
                 className="w-full bg-purple-600 p-4 rounded-xl font-bold hover:bg-purple-700 transition"
              >
                 Guardar Cambios
              </button>
            </div>

            <div className="border-t border-gray-800 pt-6 mt-2">
              <button 
                onClick={() => {
                  socket.emit('logout');
                  setCurrentUser(null);
                  setIsConfigOpen(false);
                }} 
                className="w-full bg-red-600/10 text-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600/20 transition"
              >
                <LogOut size={20} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 md:p-6 pb-2">
        {activeChat !== 'global' && (
            <div onClick={() => setActiveChat('global')} className="text-purple-400 text-sm font-medium text-center cursor-pointer mb-6 hover:text-purple-300 transition flex items-center justify-center gap-1 opacity-80 decoration-purple-400 hover:underline">
                <ArrowLeft size={16} /> Volver al chat general
            </div>
        )}
        
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10 text-sm">
            No hay mensajes aún. ¡Sé el primero en escribir!
          </div>
        )}

        {messages.map((m, i) => {
          const isMe = m.sender === currentUser;
          const isAi = m.sender === 'Elizabeth';
          
          return (
            <div key={m.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-3 rounded-3xl max-w-[85%] sm:max-w-[75%] ${isAi ? 'bg-purple-900/40 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)] rounded-tl-sm' : isMe ? 'bg-purple-600 rounded-tr-sm' : 'bg-gray-800 rounded-tl-sm'}`}>
                {!isMe && (
                  <p className={`text-[11px] mb-1 font-bold tracking-wide ${isAi ? 'text-purple-300 uppercase' : 'text-gray-400'}`}>
                    {isAi ? '✨ ELIZABETH' : m.sender}
                  </p>
                )}
                {m.image && <img src={m.image} className="rounded-xl mt-1 mb-2 max-w-full sm:max-w-sm object-cover" alt="adjunto"/>}
                {m.audio && <audio src={m.audio} controls className="h-10 w-full sm:w-60 outline-none mt-1 mb-1" />}
                {m.text && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.text}</p>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} className="pb-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-950 border-t border-gray-800 flex-shrink-0 z-10 w-full">
        <div className="max-w-5xl mx-auto w-full">
          {selectedImage && (
            <div className="relative inline-block mb-3">
               <img src={selectedImage} alt="Preview" className="h-20 rounded-lg border border-purple-500 object-cover shadow-lg" />
               <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform"><X size={14} /></button>
            </div>
          )}
          {audioUrl && (
            <div className="relative inline-block mb-3 flex items-center gap-3 bg-gray-900 p-2 pr-4 rounded-xl border border-gray-800">
               <audio src={audioUrl} controls className="h-8 w-48" />
               <button onClick={() => setAudioUrl(null)} className="bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform"><X size={14} /></button>
            </div>
          )}
          
          <div className="flex gap-2 sm:gap-3 items-center">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
            
            <button onClick={() => fileInputRef.current?.click()} className="p-2 sm:p-2.5 text-purple-400 hover:bg-gray-900 rounded-full transition-colors flex-shrink-0">
               <ImageIcon size={22} className="sm:w-6 sm:h-6" />
            </button>
            
            <button 
               onPointerDown={startRecording}
               onPointerUp={stopRecording}
               onPointerLeave={stopRecording}
               className={`p-2 sm:p-2.5 transition-colors rounded-full flex-shrink-0 ${isRecording ? 'text-red-500 bg-red-500/20 animate-pulse' : 'text-purple-400 hover:bg-gray-900'}`}
            >
               {isRecording ? <StopCircle size={22} className="sm:w-6 sm:h-6" /> : <Mic size={22} className="sm:w-6 sm:h-6" />}
            </button>
            
            <div className="flex-1 flex bg-gray-900 rounded-3xl border border-gray-800 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
              <input 
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-transparent px-4 py-3 sm:py-3.5 outline-none text-white text-[15px] placeholder-gray-500 w-full" 
                placeholder={activeChat === 'global' ? "Habla..." : `Mensaje a ${activeChat}...`} 
              />
            </div>
            
            <button 
               onClick={handleSendMessage} 
               disabled={(!inputValue.trim() && !selectedImage && !audioUrl) || isRecording}
               className="p-3 sm:p-3.5 bg-purple-600 text-white rounded-full hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-all flex-shrink-0 shadow-md"
            >
               <Send size={20} className="sm:w-5 sm:h-5 ml-0.5 mt-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
