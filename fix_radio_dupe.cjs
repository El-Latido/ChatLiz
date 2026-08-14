const fs = require('fs');
let file = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

// 1. Remove the duplicate current song header
const duplicateHeaderBlock = `           {!currentLiveDJ && (currentRequestedSong || currentSong) && (
               <div className="flex flex-col mb-1 pb-2 border-b border-[#D4AF37]/20">
                   <span className="text-[12px] font-bold text-white truncate text-center w-full">
                       {currentRequestedSong ? currentRequestedSong.title : (currentSong?.title || 'Cargando...')}
                   </span>
               </div>
           )}`;
file = file.replace(duplicateHeaderBlock, '');

// 2. Fix the scroll container to be more touch-friendly with Tailwind and remove strict borders
const targetSidebar = `<div className="radio-sidebar" style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #333', padding: '10px' }}>`;
const replaceSidebar = `<div className="radio-sidebar max-h-[220px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#D4AF37]/50 scrollbar-track-transparent pr-1 touch-pan-y">`;
file = file.replace(targetSidebar, replaceSidebar);

// Also remove style={{ marginBottom: '8px' }} from the list items and use Tailwind gap properly
const targetListItem = `style={{ marginBottom: '8px' }}`;
file = file.replace(new RegExp(targetListItem, 'g'), '');

fs.writeFileSync('src/components/InlineRadio.tsx', file);
