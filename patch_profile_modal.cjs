const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const catchRegex = /\} catch \(error\) \{\n      setSaveStatus\("Error al guardar"\);\n      setTimeout\(\(\) => setSaveStatus\(null\), 3000\);\n      alert\("Error: " \+ \(error as Error\)\.message\);\n    \}/;

const newCatch = `} catch (error: any) {
      console.error("Error guardando perfil:", error);
      let errorMsg = error.message || "Error desconocido";
      if (error.code === 'permission-denied') {
          errorMsg = "Permisos insuficientes. Asegúrate de estar autenticado.";
      } else if (error.code === 'resource-exhausted') {
          errorMsg = "La imagen es demasiado grande. Intenta con una más pequeña.";
      }
      setSaveStatus("Error: " + errorMsg);
      setTimeout(() => setSaveStatus(null), 5000);
    }`;

code = code.replace(catchRegex, newCatch);

// Also resize image before converting to base64 if it's too large to prevent size issues
const fileUploadRegex = /const reader = new FileReader\(\);\n                    reader\.onload = \(\) => setFotoURL\(reader\.result as string\);\n                    reader\.readAsDataURL\(file\);/;

const newFileUpload = `const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const MAX_SIZE = 400; // Resize to max 400px to save space in Firestore

                        if (width > height) {
                          if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                          }
                        } else {
                          if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                          }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        setFotoURL(dataUrl);
                      };
                      img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);`;

code = code.replace(fileUploadRegex, newFileUpload);

fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
