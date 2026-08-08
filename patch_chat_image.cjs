const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const imageUploadRegex = /const reader = new FileReader\(\);\n      reader\.onload = \(\) => setSelectedImage\(reader\.result as string\);\n      reader\.readAsDataURL\(file\);/;

const newImageUpload = `const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1000;

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
          setSelectedImage(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);`;

code = code.replace(imageUploadRegex, newImageUpload);
fs.writeFileSync('src/App.tsx', code);
