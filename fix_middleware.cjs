const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

const oldMid = `  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && 'body' in err) {
      console.error('Error de sintaxis JSON detectado en el body:', err.message);
      return res.status(400).json({ error: 'Formato JSON inválido recibido en el servidor.' });
    }
    next();
  });`;

const newMid = `  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError) {
      console.error("Petición con JSON inválido bloqueada para evitar crash.");
      return res.status(400).json({ error: "Invalid JSON format" });
    }
    next();
  });`;

if (file.includes(oldMid)) {
    file = file.replace(oldMid, newMid);
    fs.writeFileSync('server.ts', file);
    console.log("Replaced middleware");
} else {
    console.log("Could not find old middleware");
}
