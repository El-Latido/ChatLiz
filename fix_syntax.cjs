const fs = require('fs');

function fixSyntax() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // Remove the bad fragment from line 331-334
    const badFragment = /<\/div>\s*<\/div>\s*<\/div>;\s*\}\)}\s*<\/div>\s*<\/div>/m;
    code = code.replace(badFragment, `</div>\n                </div>\n            </div>`);

    // Fix Unterminated regular expression line 500
    const badRegex2 = /<\/div><\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/m;
    code = code.replace(badRegex2, `</div>\n      </div>\n    </div>\n  );\n}`);

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
}
fixSyntax();
