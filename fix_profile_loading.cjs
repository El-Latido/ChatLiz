const fs = require('fs');

function fix(filePaths) {
  filePaths.forEach(filePath => {
    let file = fs.readFileSync(filePath, 'utf8');
    
    file = file.replace(
      /socket\.emit\('update_profile', (\{[\s\S]*?\}), \(res: any\) => \{[\s\S]*?\}\);/m,
      `
      let callbackCalled = false;
      const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
              setSaveStatus("Guardado (Timeout servidor)");
              setTimeout(() => setSaveStatus(null), 3000);
          }
      }, 4000);

      socket.emit('update_profile', $1, (res: any) => {
         callbackCalled = true;
         clearTimeout(timeoutId);
         if (res.success || res.success === undefined) {
              setSaveStatus("Guardado correctamente");
              setTimeout(() => setSaveStatus(null), 3000);
         } else {
              setSaveStatus("Error servidor: " + res.error);
              setTimeout(() => setSaveStatus(null), 3000);
         }
      });`
    );
    
    fs.writeFileSync(filePath, file);
  });
}

fix(['src/components/ProfileConfigModal.tsx']);
