const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const file = path.join('src','pages','TransfersPage.tsx');
const text = fs.readFileSync(file,'utf8');
const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const diags = sf.parseDiagnostics;
console.log('DIAGS', diags.length);
diags.forEach(d => {
  const pos = sf.getLineAndCharacterOfPosition(d.start);
  console.log('---');
  console.log(pos.line+1, pos.character+1, ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  console.log(text.split(/\r?\n/)[pos.line]);
});
