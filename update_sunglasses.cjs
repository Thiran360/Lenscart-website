const fs = require('fs');

const path = './src/data/products.js';
let content = fs.readFileSync(path, 'utf8');

const sunglassImages = [
  "/sunglass1.png", "/sunglass2.png", "/sunglass3.png", "/sunglass4.png", 
  "/sunglass5.png", "/sunglass6.png", "/sunglass7.png", "/sunglass8.png", 
  "/sunglass9.png", "/sunglass10.png", "/sunglass11.png", "/sunglass12.png", 
  "/sunglass13.png", "/sunglass14.png"
];

let sunglassCount = 0;

// We need to replace the `image: "..."` property for the first 14 objects that have `type: "sunglasses"`
// This is a bit tricky with simple regex if we don't know where the `type` is relative to `image`
// Let's split by object.

let parts = content.split('  {');

for (let i = 1; i < parts.length; i++) {
  if (parts[i].includes('type: "sunglasses"')) {
    if (sunglassCount < 14) {
      parts[i] = parts[i].replace(/image:\s*".*?"/, `image: "${sunglassImages[sunglassCount]}"`);
      sunglassCount++;
    }
  }
}

content = parts.join('  {');
fs.writeFileSync(path, content);
console.log("Updated " + sunglassCount + " sunglasses images.");
