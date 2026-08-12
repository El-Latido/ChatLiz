const fs = require('fs');

let file = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

file = file.replace(
`    const handleQueueUpdate = (data: { queue: any[], current: any }) => {
       setSongQueue(data.queue);
       setCurrentRequestedSong(data.current);
    };`,
`    const handleQueueUpdate = (data: { queue: any[], current: any, history?: any[] }) => {
       setSongQueue(data.queue);
       setCurrentRequestedSong(data.current);
       if (data.history) setSongHistory(data.history);
    };`
);

// We need to add socket.on('radio_history_update') as well
file = file.replace(
`    socket.on('queue_update', handleQueueUpdate);
    socket.on('radio_state_update', handleRadioState);`,
`    socket.on('queue_update', handleQueueUpdate);
    socket.on('radio_history_update', (history: any[]) => setSongHistory(history));
    socket.on('radio_state_update', handleRadioState);`
);

file = file.replace(
`       socket.off('queue_update', handleQueueUpdate);
       socket.off('radio_state_update', handleRadioState);`,
`       socket.off('queue_update', handleQueueUpdate);
       socket.off('radio_history_update');
       socket.off('radio_state_update', handleRadioState);`
);

// Fix UI to map the new history correctly and allow up to 30 items
// Right now it checks !currentRequestedSong, we should always show it if requested
file = file.replace(
`{!currentRequestedSong && songHistory && songHistory.length > 0 && (`,
`{songHistory && songHistory.length > 0 && (`
);

file = file.replace(
`{songHistory.slice(0, 4).map((s:any, idx:number) => (
                          <div key={idx} className="flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                              <span className="text-[12px] font-medium text-gray-200 truncate">{s.title}</span>
                              <span className="text-[10px] text-gray-400 truncate">{s.artists?.map((a:any) => a.name).join(", ")}</span>
                          </div>
                      ))}`,
`{songHistory.map((s:any, idx:number) => (
                          <div key={idx} className="flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                              <span className="text-[12px] font-medium text-gray-200 truncate">{s.title || 'Canción Desconocida'}</span>
                              <span className="text-[10px] text-gray-400 truncate">{s.artists ? s.artists.map((a:any) => a.name).join(", ") : (s.requester ? \`Añadida por: \${s.requester}\` : '')}</span>
                          </div>
                      ))}`
);

fs.writeFileSync('src/components/InlineRadio.tsx', file);
