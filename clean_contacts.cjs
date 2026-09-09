const fs = require('fs');

const fileContent = fs.readFileSync('src/data/products.js', 'utf8');

// The file has `export const productsData = [ ... ];`
// Let's strip the export, evaluate it, filter it, and rewrite it.

const codeToEval = fileContent.replace('export const productsData =', 'global.productsData =');
eval(codeToEval);

const filtered = global.productsData.filter(p => p.type !== 'contacts');

const newContent = `export const productsData = ${JSON.stringify(filtered, null, 2)};\n`;

fs.writeFileSync('src/data/products.js', newContent);
console.log(`Removed ${global.productsData.length - filtered.length} contact lenses!`);
