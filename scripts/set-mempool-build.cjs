'use strict';
const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
const file = path.join(__dirname, '..', 'js', 'app-build.js');
let s = fs.readFileSync(file, 'utf8');
const val = mode === 'production' ? 'true' : 'false';
const next = s.replace(
  /var MEMPOOL_PRODUCTION_BUILTIN = (true|false);/,
  `var MEMPOOL_PRODUCTION_BUILTIN = ${val};`
);
if (next === s) {
  console.error('Could not update MEMPOOL_PRODUCTION_BUILTIN in js/app-build.js');
  process.exit(1);
}
fs.writeFileSync(file, next);
console.log(`js/app-build.js → MEMPOOL_PRODUCTION_BUILTIN = ${val}`);
