const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/apiError\.status === 429 \|\| apiError\.message\?\.includes\("429"\)/g, `apiError.status === 429 || apiError.message?.includes("429") || apiError.message?.includes("resource_exhausted") || apiError.message?.includes("quota")`);

code = code.replace(/e\?\.status === 429 \|\| e\?\.status === 503 \|\| e\?\.message\?\.includes\('429'\) \|\| e\?\.message\?\.includes\('503'\)/g, `e?.status === 429 || e?.status === 503 || e?.message?.includes('429') || e?.message?.includes('503') || e?.message?.includes("resource_exhausted") || e?.message?.includes("quota")`);

fs.writeFileSync('server.ts', code);
console.log("Replaced error handlers");
