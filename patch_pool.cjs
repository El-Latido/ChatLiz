const fs = require('fs');
let content = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

// Fix type of ballPositions
content = content.replace(
    /setBallPositions\] = useState<\{ id: number; x: number; y: number; color: string; label: string \}\[\]>/,
    'setBallPositions] = useState<{ id: number; x: number; y: number; color: string; label: string; angle?: number }[]>'
);

// Add angle to sync
content = content.replace(
    /label: b\.label\s*\}\)\);/,
    'label: b.label,\n            angle: b.angle\n        }));'
);

fs.writeFileSync('src/components/PoolGameModal.tsx', content);
