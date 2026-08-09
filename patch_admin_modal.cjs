const fs = require('fs');
let code = fs.readFileSync('src/components/AdminConfigLizModal.tsx', 'utf8');

const regex = /const reader = new FileReader\(\);\n                        reader\.onload = \(\) => setAiProfileForm\(\{\.\.\.aiProfileForm, systemInstruction: aiProfileForm\.systemInstruction \|\| '', profilePic: reader\.result as string\}\);\n                        reader\.readAsDataURL\(file\);/;

const newUpload = `const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            const MAX_SIZE = 400;

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
                            setAiProfileForm({...aiProfileForm, systemInstruction: aiProfileForm.systemInstruction || '', profilePic: dataUrl});
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);`;

code = code.replace(regex, newUpload);
fs.writeFileSync('src/components/AdminConfigLizModal.tsx', code);
