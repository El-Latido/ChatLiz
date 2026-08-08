const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const bgUploadRegex = /const reader = new FileReader\(\);\n                      reader\.onload = \(\) => setBackgroundBase64\(reader\.result as string\);\n                      reader\.readAsDataURL\(file\);/;

const newBgUpload = `const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          let width = img.width;
                          let height = img.height;
                          const MAX_SIZE = 800; // Resize to max 800px to save space in Firestore

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
                          setBackgroundBase64(dataUrl);
                        };
                        img.src = event.target?.result as string;
                      };
                      reader.readAsDataURL(file);`;

code = code.replace(bgUploadRegex, newBgUpload);
fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
