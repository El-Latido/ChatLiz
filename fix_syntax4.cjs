const fs = require('fs');

function fixSyntax4() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // The very end of the file is missing a div. Let's fix lines 496-500
    const endRegex = /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/m;
    code = code.replace(endRegex, `</div>\n      </div>\n    </div>\n    </div>\n  );\n}`);

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
}
fixSyntax4();
