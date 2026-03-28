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
      if (content.includes('lg:pl-80')) {
        // Replace with CSS var and add transition classes. We assume it's part of a className string
        content = content.replace(/lg:pl-80/g, 'transition-[padding] duration-300 lg:pl-[var(--sidebar-width,20rem)]');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

recursiveReplace(directory);
