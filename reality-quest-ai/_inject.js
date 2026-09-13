const fs = require('fs');
const path = require('path');

const ENH_FILE = path.join(__dirname, '_levels_enhancement.css');
const enhance = fs.readFileSync(ENH_FILE, 'utf8');
console.log('[INFO] enhancement block length:', enhance.length, 'chars');

const files = [
  'gate.html',
  'ghost.html',
  'level1.html',
  'level2.html',
  'level3.html',
  'level4.html',
  'level5.html',
  'level6.html',
  'level7.html',
];

for (const f of files) {
  const fp = path.join(__dirname, f);
  if (!fs.existsSync(fp)) { console.log('[SKIP] missing:', f); continue; }

  let content = fs.readFileSync(fp, 'utf8');

  if (content.includes('LEVELS UI ENHANCEMENTS')) {
    console.log('[SKIP] already applied:', f);
    continue;
  }

  // Find the LAST </style> closing tag (case-insensitive)
  const lower = content.toLowerCase();
  const lastCloseIdx = lower.lastIndexOf('</style>');
  if (lastCloseIdx < 0) { console.log('[FAIL] no </style> found in:', f); continue; }

  // Also figure out the indent before </style> to match surrounding
  // Walk backwards to find start-of-line
  let indentStart = lastCloseIdx - 1;
  while (indentStart >= 0 && (content[indentStart] === ' ' || content[indentStart] === '\t')) indentStart--;
  if (indentStart >= 0 && content[indentStart] === '\n') indentStart++;
  const indentLen = lastCloseIdx - indentStart;
  const indent = content.slice(indentStart, lastCloseIdx);

  // Now insert: [enhance block] + [indent] + '</style>'
  // Replace the original '</style>' at lastCloseIdx with enhancement + '</style>'
  const before = content.slice(0, lastCloseIdx);
  const after  = content.slice(lastCloseIdx + '</style>'.length);

  // Ensure the enhancement block ends with a newline so '</style>' is on its own line
  let finalEnh = enhance;
  if (!finalEnh.endsWith('\n')) finalEnh += '\n';
  // Add matching indent to '</style>' via slice recovery

  const newContent = before + finalEnh + indent + '</style>' + after;
  fs.writeFileSync(fp, newContent, 'utf8');
  console.log('[ OK ] injected into:', f, 'at char', lastCloseIdx, 'indent=' + indentLen);
}

console.log('\nDone.');
