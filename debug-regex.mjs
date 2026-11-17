import fs from 'fs';
import path from 'path';
import safeRegex from 'safe-regex';

const crashServicePath = path.resolve('apps/backend/src/services/crash/crash.service.ts');
const source = fs.readFileSync(crashServicePath, 'utf8');

function extractRegexes(code) {
  const regexes = [];
  const pattern = /\/(?:\\.|[^\\/])+\/[gimuy]*/g;
  let match;
  while ((match = pattern.exec(code)) !== null) {
    try {
      const literal = match[0];
      const lastSlash = literal.lastIndexOf('/');
      const rePattern = literal.slice(1, lastSlash);
      const flags = literal.slice(lastSlash + 1);
      regexes.push(new RegExp(rePattern, flags));
    } catch {
      // Skip invalid regexes
    }
  }
  return regexes;
}

const regexes = extractRegexes(source);
console.log(`Found ${regexes.length} regexes:`);
for (let i = 0; i < regexes.length; i++) {
  const re = regexes[i];
  const isSafe = safeRegex(re);
  console.log(`${i}: ${isSafe ? 'SAFE' : 'UNSAFE'}  ${re}`);
}