const fs = require('fs');
const paths = [
  'components.json',
  'src/components',
  'src/lib/utils.ts',
  'src/index.css',
  'tailwind.config.js',
  'postcss.config.js'
];

paths.forEach(p => {
  console.log(`${p}:`, fs.existsSync(p) ? '✅ exists' : '❌ MISSING');
});