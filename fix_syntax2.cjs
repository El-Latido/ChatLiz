const fs = require('fs');

function fixSyntax2() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // The layout container lacks a closing div due to previous replacements. Let's fix lines 496-500
    const endRegex = /<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/m;
    code = code.replace(endRegex, `</div>\n          </div>\n      </div>\n    </div>\n  );\n}`);

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
}
fixSyntax2();
