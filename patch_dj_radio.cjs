const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const oldState = `  const [songQueue, setSongQueue] = useState<any[]>([]);
  const [currentRequestedSong, setCurrentRequestedSong] = useState<any>(null);`;

const newState = `  const [songQueue, setSongQueue] = useState<any[]>([]);
  const [currentRequestedSong, setCurrentRequestedSong] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState("https://listen.moe/stream");
  const [currentLiveDJ, setCurrentLiveDJ] = useState<string | null>(null);
  const [djQueue, setDjQueue] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);`;

code = code.replace(oldState, newState);

const oldStreamUrl = `  const wsRef = useRef<WebSocket | null>(null);
  const streamUrl = "https://listen.moe/stream";

  useEffect(() => {`;

const newStreamUrl = `  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {`;

code = code.replace(oldStreamUrl, newStreamUrl);

const oldQueueUpdate = `  useEffect(() => {
    const handleQueueUpdate = (data: { queue: any[], current: any }) => {
       setSongQueue(data.queue);
       setCurrentRequestedSong(data.current);
    };
    socket.on('queue_update', handleQueueUpdate);
    return () => {
       socket.off('queue_update', handleQueueUpdate);
    };
  }, []);`;

const newQueueUpdate = `  useEffect(() => {
    const handleQueueUpdate = (data: { queue: any[], current: any }) => {
       setSongQueue(data.queue);
       setCurrentRequestedSong(data.current);
    };
    const handleRadioState = (data: { currentLiveDJ: string | null, streamUrl: string }) => {
       setCurrentLiveDJ(data.currentLiveDJ);
       setStreamUrl(data.streamUrl);
    };
    const handleDjQueueUpdate = (queue: any[]) => {
       setDjQueue(queue);
    };
    const handleDjRequestStatus = (req: { id: string, status: string, title: string }) => {
       setMyRequests(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(r => r.id === req.id);
          if (idx !== -1) {
              updated[idx] = req;
          } else {
              updated.push(req);
          }
          return updated;
       });
    };
    
    socket.on('queue_update', handleQueueUpdate);
    socket.on('radio_state_update', handleRadioState);
    socket.on('dj_queue_update', handleDjQueueUpdate);
    socket.on('dj_request_status', handleDjRequestStatus);
    
    return () => {
       socket.off('queue_update', handleQueueUpdate);
       socket.off('radio_state_update', handleRadioState);
       socket.off('dj_queue_update', handleDjQueueUpdate);
       socket.off('dj_request_status', handleDjRequestStatus);
    };
  }, []);`;

code = code.replace(oldQueueUpdate, newQueueUpdate);

const oldAlAire = `              <h3 className="text-[#E8D9B0] font-bold text-sm flex items-center gap-1.5">
                 <Radio size={14} className="text-pink-400" />
                 Al Aire
              </h3>`;

const newAlAire = `              <h3 className="text-[#E8D9B0] font-bold text-sm flex items-center gap-1.5">
                 <Radio size={14} className="text-pink-400" />
                 {currentLiveDJ ? \`Live: DJ \${currentLiveDJ}\` : 'Al Aire'}
              </h3>`;

code = code.replace(oldAlAire, newAlAire);

const oldRequestedSong = `           {currentRequestedSong ? (`;
const newRequestedSong = `           {myRequests.length > 0 && (
               <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ListMusic size={12}/> Mis Pedidos DJ</span>
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                      {myRequests.map((req:any, idx:number) => (
                          <div key={idx} className="flex flex-col bg-white/5 p-1.5 rounded">
                              <span className="text-[11px] font-medium text-gray-200 truncate">{req.title}</span>
                              <span className={\`text-[10px] font-bold \${req.status === 'accepted' ? 'text-green-400' : req.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}\`}>
                                  {req.status === 'accepted' ? '✔ Aceptado' : req.status === 'rejected' ? '❌ Rechazado' : '⏳ Pendiente'}
                              </span>
                          </div>
                      ))}
                  </div>
               </div>
           )}
           {currentRequestedSong && !currentLiveDJ ? (`;
code = code.replace(oldRequestedSong, newRequestedSong);

fs.writeFileSync('src/components/InlineRadio.tsx', code);
