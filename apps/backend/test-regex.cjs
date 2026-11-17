const safeRegex = require('safe-regex');
const hotPathRegexes = [
  /:\d+/g,
  /\(.*\)/g,
  /\$(?:mindustrytool|betamindy|newhorizon|[a-z0-9_-]+)$/i,
  /lambda\$([a-zA-Z0-9_$]+?)\$\d+/g,
  /lambda\$\d+/g,
  /\(declaration of '[^']+' appears in [^)]+\)/g,
  /\/data\/app\/[^\s)]+/g,
  /[a-zA-Z]:\\[^\s)]+/g,
  /.*/g,
  /^([\w.$]+)(?:: (.*))?/,
  /Caused by:\s+([\w.$]+)(?:: (.*))?/,
  /The mod\s+'(?<modName>.+)'\s+\((?<modId>[^)]+)\).+\r?\n(?<message>[\s\S]*?)(?:\r?\n){2,}(?<stacktrace>[\s\S]+$)/,
];
hotPathRegexes.forEach((re, i) => console.log(i, safeRegex(re) ? 'SAFE' : 'UNSAFE', re));