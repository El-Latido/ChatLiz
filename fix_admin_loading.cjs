const fs = require('fs');

let file = fs.readFileSync('src/components/AdminConfigLizModal.tsx', 'utf8');

file = file.replace(
/socket\.emit\('update_ai_config', \{[\s\S]*?\}, \(res: any\) => \{[\s\S]*?\}\);/m,
`
      let callbackCalled = false;
      const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
              setSuccessMsg('Guardado localmente (Timeout del servidor)');
          }
      }, 4000);

      socket.emit('update_ai_config', { profilePic: aiProfileForm.profilePic, statusMessage: aiProfileForm.statusMessage, systemInstruction: aiProfileForm.systemInstruction }, (res: any) => {
          callbackCalled = true;
          clearTimeout(timeoutId);
          if (res.success || res.success === undefined) {
              setSuccessMsg('¡Perfil de ELIZABETH actualizado con éxito!');
          } else {
              alert("Error: " + res.error);
          }
      });`
);

fs.writeFileSync('src/components/AdminConfigLizModal.tsx', file);
