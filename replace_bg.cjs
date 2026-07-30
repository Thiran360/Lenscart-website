const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.css')) {
            results.push(file);
        }
    });
    return results;
}
const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Replace light grays and whites used in background
    let newContent = content.replace(/background(-color)?\s*:\s*#([fF][0-9a-fA-F]{2,5}|[eE][0-9a-fA-F]{2,5}|[cC][0-9a-fA-F]{2,5})\b/g, 'background$1: #F6F1E8');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated: ' + file);
    }
})
