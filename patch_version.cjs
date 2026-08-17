const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `function checkVersion() {
    fetch('/version')
        .then(response => response.json())
        .then(data => {`,
  `let versionController: AbortController | null = null;
function checkVersion() {
    if (versionController) {
        versionController.abort();
    }
    versionController = new AbortController();
    fetch('/version', { signal: versionController.signal })
        .then(response => response.json())
        .then(data => {`
);

code = code.replace(
  `.catch(err => console.error("Error verificando versión:", err));
}`,
  `.catch(err => {
            if (err.name === 'AbortError') return;
            console.error("Error verificando versión:", err);
        });
}`
);

fs.writeFileSync('src/App.tsx', code);
