const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const fileNames = ['client-api-types.dts', 'server-api-types.dts'];

fileNames.forEach(fileName => {
  const filePath = path.resolve(__dirname, '../dts/', fileName);
  let data = fs.readFileSync(filePath, 'utf8');
  const source = ts.createSourceFile(filePath, data, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  // Monaco needs global declarations. Remove actual export statements rather
  // than assuming Rollup always writes exactly two lines at the end.
  const exports = source.statements.filter(node => ts.isExportDeclaration(node) || ts.isExportAssignment(node));
  for (const node of exports.reverse()) data = data.slice(0, node.getFullStart()) + data.slice(node.end);
  fs.writeFileSync(filePath, data.replace(/[\t ]+$/gm, '').trimEnd() + '\n');
});
