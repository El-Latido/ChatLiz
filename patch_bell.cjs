const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('const [notifications')) {
    content = content.replace(/const \[messages, setMessages\] = useState<any\[\]>\(\[\]\);/, 
    "const [messages, setMessages] = useState<any[]>([]);\n  const [notifications, setNotifications] = useState<any[]>([]);\n  const [showNotifications, setShowNotifications] = useState(false);");
}

if (!content.includes('Bell')) {
    content = content.replace(/AlertCircle\n\} from 'lucide-react';/, "AlertCircle, Bell\n} from 'lucide-react';");
}

// Add the socket listener inside the useEffect around line 290
const socketListener = `
    socket.on('dj_request_status', (req: { id: string, status: string, title: string }) => {
        setNotifications(prev => [
            {
                id: Date.now().toString(),
                text: req.status === 'accepted' ? \`Tu canción "\${req.title}" ha sido aceptada y está en cola.\` : \`Tu canción "\${req.title}" no cumple con las normas (contenido inapropiado/fuera de contexto).\`,
                read: false,
                type: req.status
            },
            ...prev
        ]);
    });
`;
if (!content.includes('dj_request_status')) {
    content = content.replace(/socket\.on\('receive_global',/m, socketListener + "\n    socket.on('receive_global',");
}

// Add the UI for the bell
const bellUI = `
             <div className="relative">
                 <button onClick={() => setShowNotifications(!showNotifications)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#D4AF37] hover:text-[#E8D9B0] hover:bg-white/5 transition-colors relative">
                    <Bell size={18} strokeWidth={1.5} />
                    {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                 </button>
                 {showNotifications && (
                     <div className="absolute right-0 mt-2 w-64 bg-[#121B2A] border border-[#D4AF37]/30 rounded-xl shadow-2xl overflow-hidden z-50">
                         <div className="p-3 border-b border-[#D4AF37]/20 flex justify-between items-center bg-black/20">
                             <span className="text-[#E8D9B0] font-semibold text-sm">Notificaciones</span>
                             <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-xs text-[#D4AF37] hover:text-white">Marcar leídas</button>
                         </div>
                         <div className="max-h-64 overflow-y-auto scrollbar-thin">
                             {notifications.length === 0 ? (
                                 <div className="p-4 text-center text-[#8B98B0] text-xs">No hay notificaciones</div>
                             ) : (
                                 notifications.map(n => (
                                     <div key={n.id} className={\`p-3 border-b border-white/5 text-xs \${!n.read ? 'bg-white/5' : ''}\`}>
                                         <div className={\`\${n.type === 'accepted' ? 'text-green-400' : 'text-red-400'} font-medium\`}>{n.text}</div>
                                     </div>
                                 ))
                             )}
                         </div>
                     </div>
                 )}
             </div>
             <button
                 onClick={() => { closeAllModals(); setIsConfigOpen(true); }}
`;
content = content.replace(/<button\s*onClick=\{\(\) => \{ closeAllModals\(\); setIsConfigOpen\(true\); \}\}/m, bellUI);

fs.writeFileSync('src/App.tsx', content);
