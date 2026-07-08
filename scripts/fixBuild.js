const fs = require('fs');
let c = fs.readFileSync('scripts/buildActualResults.mjs', 'utf8');
c = c.replace('// TEMPORARY FIX: Control table is only updated up to Canada vs Morocco and Paraguay vs France', '');
c = c.replace('// so we must ignore the other R16 matches to match the control table scores', '');
c = c.replace(/if \(kr\.slotId\.startsWith\('R16'\) && kr\.slotId !== 'R16-01' && kr\.slotId !== 'R16-02'\) \{\s*continue;\s*\}/g, '');
c = c.replace('const matchObj = {', 'if (m.round === "R16" && m.slotId !== "R16-01" && m.slotId !== "R16-02") continue; const matchObj = {');
fs.writeFileSync('scripts/buildActualResults.mjs', c);
