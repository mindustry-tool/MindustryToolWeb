const fs = require('fs');
const path = require('path');
const { parseDependencyTree, parseCircular, prettyCircular } = require('dpdm');

function collectFiles(dir, ignorePatterns = ['node_modules', '.next', '.vinext', '.turbo', 'dist', '.wrangler']) {
  const files = [];
  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (ignorePatterns.includes(entry.name)) continue;
      const full = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (
        (full.endsWith('.ts') || full.endsWith('.tsx')) &&
        !full.endsWith('.test.ts') &&
        !full.endsWith('.test.tsx') &&
        !full.endsWith('.spec.ts') &&
        !full.endsWith('.spec.tsx') &&
        !full.endsWith('.d.ts')
      ) {
        files.push(full);
      }
    }
  }
  walk(dir);
  return files;
}

async function checkTarget(targetDir, name) {
  const files = collectFiles(targetDir);
  console.log(`Running dpdm on ${name}: scanned ${files.length} files...`);

  const tree = await parseDependencyTree(files, {
    transform: true,
  });

  const circulars = parseCircular(tree);

  if (circulars.length > 0) {
    console.error(`  ❌ Found ${circulars.length} circular dependencies in ${name}:`);
    console.error(prettyCircular(circulars));
    return false;
  }

  console.log(`  ✅ 0 circular dependencies in ${name}`);
  return true;
}

async function main() {
  let ok = true;

  const apiOk = await checkTarget('packages/api/src', 'packages/api/src');
  if (!apiOk) ok = false;

  const frontendOk = await checkTarget('apps/frontend', 'apps/frontend');
  if (!frontendOk) ok = false;

  if (!ok) {
    console.error('\nCircular dependency check failed!');
    process.exit(1);
  }

  console.log('\nAll targets verified with dpdm: ZERO circular dependencies found!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
