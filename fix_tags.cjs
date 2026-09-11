const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const danglingTags = `      )}
               )}
            </div>
          </div>
        </div>
      )}`;

const fix = `      )}`;

code = code.replace(danglingTags, fix);
fs.writeFileSync('src/App.tsx', code);
