const fs = require('fs');
const path = require('path');

const directory = '/Users/jovannybarronmata/Documents/GitHub/Romdeau/proyecto_integrador/frontend/src/app/components';

function recursiveReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      recursiveReplace(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('var(--sidebar-width,20rem)')) {
        content = content.replace(/var\(--sidebar-width,20rem\)/g, 'var(--content-padding,20rem)');
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed ${fullPath}`);
      }
    }
  }
}

recursiveReplace(directory);
