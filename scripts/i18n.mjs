#!/usr/bin/env node

/**
 * Git-Native Two-Way Translation Synchronization Engine
 * 
 * Synchronizes translation files between:
 * - Private App Repository (MindustryToolWeb): `apps/frontend/app/i18n/locales/`
 * - Public Translation Repository (MindustryToolWebTranslation): `locales/`
 * 
 * Uses standard Git plumbing commands (fetch, rev-parse, ls-tree, mktree, commit-tree, merge-file)
 * to ensure sub-second execution, leak prevention, and native 3-way conflict resolution.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
	remoteName: process.env.I18N_REMOTE || 'i18n-remote',
	remoteUrl: process.env.I18N_REMOTE_URL || 'https://github.com/MindustryTool/MindustryToolWebTranslation.git',
	remoteBranch: process.env.I18N_BRANCH || 'main',
	localLocalesRelPath: 'apps/frontend/app/i18n/locales',
	remoteLocalesRelPath: 'locales',
	syncRef: 'refs/sync/i18n',
};

const LOCAL_LOCALES_DIR = path.resolve(REPO_ROOT, CONFIG.localLocalesRelPath);

// ANSI Color Helpers
const c = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
};

function log(msg = '') {
	console.log(msg);
}

function success(msg) {
	console.log(`${c.green}✔ ${msg}${c.reset}`);
}

function info(msg) {
	console.log(`${c.cyan}ℹ ${msg}${c.reset}`);
}

function warn(msg) {
	console.log(`${c.yellow}⚠ ${msg}${c.reset}`);
}

function error(msg) {
	console.error(`${c.red}✖ ${msg}${c.reset}`);
}

/**
 * Run git command and return stdout as string.
 */
function git(args, options = {}) {
	try {
		return execFileSync('git', args, {
			cwd: REPO_ROOT,
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'pipe'],
			...options,
		}).trim();
	} catch (err) {
		if (options.ignoreError) return null;
		const stderr = err.stderr ? err.stderr.toString().trim() : err.message;
		const e = new Error(`git ${args.join(' ')} failed: ${stderr}`);
		e.stderr = stderr;
		e.exitCode = err.status;
		throw e;
	}
}

/**
 * Run git command with input piped into stdin.
 */
function gitWithInput(args, input) {
	return execFileSync('git', args, {
		cwd: REPO_ROOT,
		input,
		encoding: 'utf-8',
		stdio: ['pipe', 'pipe', 'pipe'],
	}).trim();
}

/**
 * Ensure the remote repository is configured in git remotes.
 */
function ensureRemote() {
	const remotes = git(['remote']).split('\n').map((r) => r.trim()).filter(Boolean);
	if (!remotes.includes(CONFIG.remoteName)) {
		info(`Remote '${CONFIG.remoteName}' not found. Adding remote '${CONFIG.remoteName}' -> ${CONFIG.remoteUrl}`);
		git(['remote', 'add', CONFIG.remoteName, CONFIG.remoteUrl]);
	}
}

/**
 * Fetch latest updates from the translation remote.
 */
function fetchRemote() {
	ensureRemote();
	info(`Fetching latest translations from ${CONFIG.remoteName}/${CONFIG.remoteBranch}...`);
	git(['fetch', CONFIG.remoteName, CONFIG.remoteBranch]);
}

/**
 * Get the tree SHA of a git rev/path.
 */
function getTreeSha(revPath) {
	try {
		return git(['rev-parse', revPath], { ignoreError: true });
	} catch {
		return null;
	}
}

/**
 * Get the current commit SHA of a ref.
 */
function getCommitSha(ref) {
	try {
		return git(['rev-parse', ref], { ignoreError: true });
	} catch {
		return null;
	}
}

/**
 * Check if the working tree has uncommitted changes in the locales directory.
 */
function getLocalWorkingChanges() {
	const statusOut = git(['status', '--porcelain', '--', CONFIG.localLocalesRelPath]);
	if (!statusOut) return [];
	return statusOut.split('\n').map((line) => line.trim()).filter(Boolean);
}

/**
 * Resolve or initialize the synchronization base commit.
 */
function getOrInitSyncBase(remoteCommitSha) {
	const currentSyncSha = getCommitSha(CONFIG.syncRef);
	if (currentSyncSha) return currentSyncSha;

	// If no syncRef exists yet, check if remote commit tree matches local HEAD tree
	const localTree = getTreeSha(`HEAD:${CONFIG.localLocalesRelPath}`);
	const remoteTree = getTreeSha(`${remoteCommitSha}:${CONFIG.remoteLocalesRelPath}`);

	if (localTree && remoteTree && localTree === remoteTree) {
		// Exactly identical trees: record current remote commit as sync ref
		git(['update-ref', CONFIG.syncRef, remoteCommitSha]);
		return remoteCommitSha;
	}

	// Try to find an ancestor commit on remote that matches local HEAD
	try {
		const commits = git(['log', '-n', '50', '--format=%H', remoteCommitSha]).split('\n').filter(Boolean);
		for (const sha of commits) {
			const tree = getTreeSha(`${sha}:${CONFIG.remoteLocalesRelPath}`);
			if (tree && tree === localTree) {
				git(['update-ref', CONFIG.syncRef, sha]);
				return sha;
			}
		}
	} catch {
		// Ignore
	}

	// Fallback: use the remote commit as base
	git(['update-ref', CONFIG.syncRef, remoteCommitSha]);
	return remoteCommitSha;
}

/**
 * Command: i18n:status
 */
function statusCommand() {
	fetchRemote();

	const remoteCommitSha = getCommitSha(`${CONFIG.remoteName}/${CONFIG.remoteBranch}`);
	if (!remoteCommitSha) {
		error(`Cannot find remote ref ${CONFIG.remoteName}/${CONFIG.remoteBranch}.`);
		process.exit(1);
	}

	const syncBaseCommit = getOrInitSyncBase(remoteCommitSha);
	const localHeadTree = getTreeSha(`HEAD:${CONFIG.localLocalesRelPath}`);
	const remoteHeadTree = getTreeSha(`${remoteCommitSha}:${CONFIG.remoteLocalesRelPath}`);
	const syncBaseTree = getTreeSha(`${syncBaseCommit}:${CONFIG.remoteLocalesRelPath}`);

	const workingChanges = getLocalWorkingChanges();

	log(`\n${c.bold}Translation Synchronization Status${c.reset}`);
	log(`${c.dim}Local Path:      ${CONFIG.localLocalesRelPath}${c.reset}`);
	log(`${c.dim}Remote Target:   ${CONFIG.remoteName}/${CONFIG.remoteBranch} (${CONFIG.remoteUrl})${c.reset}`);
	log(`${c.dim}Last Synced SHA: ${syncBaseCommit.slice(0, 8)}${c.reset}\n`);

	let hasDifferences = false;

	// 1. Working tree changes
	if (workingChanges.length > 0) {
		hasDifferences = true;
		log(`${c.yellow}${c.bold}Local Uncommitted Changes (${workingChanges.length} files):${c.reset}`);
		for (const change of workingChanges) {
			log(`  ${change}`);
		}
		log(`${c.dim}Commit these changes before running 'pnpm i18n:push' or 'pnpm i18n:pull'.${c.reset}\n`);
	} else {
		log(`${c.green}✔ Local working directory is clean.${c.reset}`);
	}

	// 2. Remote commits pending pull
	if (remoteCommitSha !== syncBaseCommit) {
		const remoteLog = git(['log', `${syncBaseCommit}..${remoteCommitSha}`, '--oneline'], { ignoreError: true });
		if (remoteLog) {
			hasDifferences = true;
			log(`${c.cyan}${c.bold}Public Repository Updates Available to Pull:${c.reset}`);
			for (const line of remoteLog.split('\n')) {
				log(`  ↓ ${line}`);
			}
			log(`${c.dim}Run 'pnpm i18n:pull' to merge these updates.${c.reset}\n`);
		}
	} else {
		log(`${c.green}✔ No pending commits to pull from public repository.${c.reset}`);
	}

	// 3. Local commits pending push
	if (localHeadTree !== syncBaseTree) {
		hasDifferences = true;
		log(`${c.magenta}${c.bold}Local Changes Ready to Push:${c.reset}`);
		const diffList = git(['diff-tree', '-r', '--no-commit-id', '--name-status', syncBaseTree, localHeadTree]);
		if (diffList) {
			for (const line of diffList.split('\n')) {
				log(`  ↑ ${line}`);
			}
		}
		log(`${c.dim}Run 'pnpm i18n:push' to push these changes to public repository.${c.reset}\n`);
	} else {
		log(`${c.green}✔ Monorepo HEAD is synchronized with base.${c.reset}`);
	}

	if (!hasDifferences) {
		log(`\n${c.green}${c.bold}✨ All translations are 100% up to date and in sync!${c.reset}\n`);
	}
}

/**
 * Command: i18n:pull
 */
function pullCommand() {
	const workingChanges = getLocalWorkingChanges();
	if (workingChanges.length > 0) {
		error('You have uncommitted changes in your local translations:');
		for (const change of workingChanges) {
			console.log(`  ${change}`);
		}
		log(`\n${c.yellow}Please commit or stash your changes before running 'pnpm i18n:pull' to avoid accidental data loss.${c.reset}`);
		process.exit(1);
	}

	fetchRemote();

	const remoteCommitSha = getCommitSha(`${CONFIG.remoteName}/${CONFIG.remoteBranch}`);
	if (!remoteCommitSha) {
		error(`Cannot find remote ref ${CONFIG.remoteName}/${CONFIG.remoteBranch}.`);
		process.exit(1);
	}

	const syncBaseCommit = getOrInitSyncBase(remoteCommitSha);
	const localHeadTree = getTreeSha(`HEAD:${CONFIG.localLocalesRelPath}`);
	const remoteHeadTree = getTreeSha(`${remoteCommitSha}:${CONFIG.remoteLocalesRelPath}`);
	const syncBaseTree = getTreeSha(`${syncBaseCommit}:${CONFIG.remoteLocalesRelPath}`);

	if (localHeadTree === remoteHeadTree && syncBaseCommit === remoteCommitSha) {
		success('Translations are already up to date with public repository! Nothing to pull.');
		return;
	}

	// Compute remote changes since base: S -> R
	const remoteDiff = git(['diff-tree', '-r', '--no-commit-id', '--name-status', syncBaseTree, remoteHeadTree]);
	if (!remoteDiff) {
		// Remote hasn't changed, but maybe local has. Just update ref.
		git(['update-ref', CONFIG.syncRef, remoteCommitSha]);
		success('Public repository has no changes since last sync.');
		return;
	}

	// Compute local changes since base: S -> L
	const localDiff = git(['diff-tree', '-r', '--no-commit-id', '--name-status', syncBaseTree, localHeadTree]);
	const localModifiedMap = new Map();
	if (localDiff) {
		for (const line of localDiff.split('\n').filter(Boolean)) {
			const [status, filePath] = line.split('\t');
			localModifiedMap.set(filePath, status);
		}
	}

	log(`\n${c.bold}Applying translation updates from ${CONFIG.remoteName}/${CONFIG.remoteBranch}...${c.reset}`);

	let conflictCount = 0;
	let updatedCount = 0;
	let addedCount = 0;
	let deletedCount = 0;

	for (const line of remoteDiff.split('\n').filter(Boolean)) {
		const [remoteStatus, relPath] = line.split('\t');
		const fullLocalPath = path.resolve(LOCAL_LOCALES_DIR, relPath);
		const localStatus = localModifiedMap.get(relPath);

		// Case 1: Modified/Added on remote, untouched locally
		if (!localStatus) {
			if (remoteStatus.startsWith('D')) {
				if (fs.existsSync(fullLocalPath)) {
					fs.unlinkSync(fullLocalPath);
					deletedCount++;
					log(`  ${c.red}D${c.reset} ${relPath}`);
				}
			} else {
				// Added or Modified
				const content = git(['show', `${remoteCommitSha}:${CONFIG.remoteLocalesRelPath}/${relPath}`]);
				fs.mkdirSync(path.dirname(fullLocalPath), { recursive: true });
				fs.writeFileSync(fullLocalPath, content, 'utf-8');
				if (remoteStatus.startsWith('A')) {
					addedCount++;
					log(`  ${c.green}A${c.reset} ${relPath}`);
				} else {
					updatedCount++;
					log(`  ${c.blue}M${c.reset} ${relPath}`);
				}
			}
			continue;
		}

		// Case 2: Modified on BOTH remote and local -> 3-way merge
		if (remoteStatus.startsWith('D') && localStatus.startsWith('D')) {
			continue; // Deleted on both
		}

		if (remoteStatus.startsWith('D') && !localStatus.startsWith('D')) {
			warn(`File deleted on remote but modified locally: ${relPath}. Kept local version.`);
			continue;
		}

		// Both modified or added
		const remoteContent = git(['show', `${remoteCommitSha}:${CONFIG.remoteLocalesRelPath}/${relPath}`]);
		let baseContent = '';
		try {
			baseContent = git(['show', `${syncBaseCommit}:${CONFIG.remoteLocalesRelPath}/${relPath}`]);
		} catch {
			baseContent = '';
		}

		// Create temp files for git merge-file
		const tmpDir = path.resolve(REPO_ROOT, '.git', 'i18n-merge-tmp');
		fs.mkdirSync(tmpDir, { recursive: true });
		const tmpBase = path.resolve(tmpDir, 'base.json');
		const tmpRemote = path.resolve(tmpDir, 'remote.json');

		fs.writeFileSync(tmpBase, baseContent, 'utf-8');
		fs.writeFileSync(tmpRemote, remoteContent, 'utf-8');

		try {
			// git merge-file <current-file> <base-file> <other-file>
			execFileSync('git', [
				'merge-file',
				'-L', 'Local (MindustryToolWeb)',
				'-L', 'Base',
				'-L', `Remote (${CONFIG.remoteName}/${CONFIG.remoteBranch})`,
				fullLocalPath,
				tmpBase,
				tmpRemote,
			], { cwd: REPO_ROOT });
			updatedCount++;
			log(`  ${c.cyan}Merged${c.reset} ${relPath}`);
		} catch (mergeErr) {
			// git merge-file returns non-zero when conflicts occur
			conflictCount++;
			error(`Conflict detected in ${relPath}!`);
		} finally {
			try {
				fs.rmSync(tmpDir, { recursive: true, force: true });
			} catch {}
		}
	}

	if (conflictCount > 0) {
		log(`\n${c.red}${c.bold}❌ ${conflictCount} conflict(s) detected during pull!${c.reset}`);
		log('Conflict markers (<<<<<<<, =======, >>>>>>>) have been written into the affected files.');
		log('Please open the conflicted files, resolve conflicts, test, and commit:');
		log(`  ${c.cyan}git add ${CONFIG.localLocalesRelPath}${c.reset}`);
		log(`  ${c.cyan}git commit -m "chore(i18n): resolve translation merge conflicts"${c.reset}\n`);
		process.exit(1);
	}

	// Update sync ref to the new remote commit
	git(['update-ref', CONFIG.syncRef, remoteCommitSha]);

	log(`\n${c.green}${c.bold}✔ Successfully pulled translations!${c.reset}`);
	log(`Summary: ${updatedCount} updated, ${addedCount} added, ${deletedCount} deleted.`);
	log(`\n${c.dim}Next steps: Commit the pulled changes to your local branch:${c.reset}`);
	log(`  ${c.cyan}git add ${CONFIG.localLocalesRelPath}${c.reset}`);
	log(`  ${c.cyan}git commit -m "chore(i18n): sync translations from public repository"${c.reset}\n`);
}

/**
 * Command: i18n:push
 */
function pushCommand(commitMessage) {
	const workingChanges = getLocalWorkingChanges();
	if (workingChanges.length > 0) {
		error('You have uncommitted changes in your local translations:');
		for (const change of workingChanges) {
			console.log(`  ${change}`);
		}
		log(`\n${c.yellow}Please commit your translation changes in MindustryToolWeb before running 'pnpm i18n:push'.${c.reset}`);
		process.exit(1);
	}

	fetchRemote();

	const remoteCommitSha = getCommitSha(`${CONFIG.remoteName}/${CONFIG.remoteBranch}`);
	if (!remoteCommitSha) {
		error(`Cannot find remote ref ${CONFIG.remoteName}/${CONFIG.remoteBranch}.`);
		process.exit(1);
	}

	const syncBaseCommit = getOrInitSyncBase(remoteCommitSha);
	const localHeadTree = getTreeSha(`HEAD:${CONFIG.localLocalesRelPath}`);
	const remoteHeadTree = getTreeSha(`${remoteCommitSha}:${CONFIG.remoteLocalesRelPath}`);

	// Check if local is identical to remote
	if (localHeadTree === remoteHeadTree) {
		success('Public translation repository is already up to date! Nothing to push.');
		git(['update-ref', CONFIG.syncRef, remoteCommitSha]);
		return;
	}

	// Check if remote has newer commits that we haven't pulled yet
	if (syncBaseCommit !== remoteCommitSha) {
		error('The public translation repository has newer changes that are not in your local sync base.');
		log(`\n${c.yellow}Please pull the latest public changes first, resolve any conflicts, and then push:${c.reset}`);
		log(`  ${c.cyan}pnpm i18n:pull${c.reset}`);
		log(`  ${c.cyan}pnpm i18n:push${c.reset}\n`);
		process.exit(1);
	}

	// Read remote root tree
	const remoteRootTree = git(['rev-parse', `${remoteCommitSha}^{tree}`]);
	const remoteTreeEntries = git(['ls-tree', remoteRootTree]).split('\n').filter(Boolean);

	// Replace or add the locales entry
	let replaced = false;
	const newEntries = remoteTreeEntries.map((line) => {
		const parts = line.split('\t');
		if (parts[1] === CONFIG.remoteLocalesRelPath) {
			replaced = true;
			return `040000 tree ${localHeadTree}\t${CONFIG.remoteLocalesRelPath}`;
		}
		return line;
	});

	if (!replaced) {
		newEntries.push(`040000 tree ${localHeadTree}\t${CONFIG.remoteLocalesRelPath}`);
	}

	// Create new remote root tree
	const newRemoteRootTree = gitWithInput(['mktree'], newEntries.join('\n') + '\n');

	if (newRemoteRootTree === remoteRootTree) {
		success('No tree differences found. Nothing to push.');
		return;
	}

	// Show diff summary before pushing
	log(`\n${c.bold}Translation Changes to Push:${c.reset}`);
	const pushDiff = git(['diff-tree', '-r', '--no-commit-id', '--name-status', remoteHeadTree, localHeadTree]);
	for (const line of pushDiff.split('\n').filter(Boolean)) {
		const [st, p] = line.split('\t');
		if (st.startsWith('A')) log(`  ${c.green}+ ${p}${c.reset}`);
		else if (st.startsWith('D')) log(`  ${c.red}- ${p}${c.reset}`);
		else log(`  ${c.blue}~ ${p}${c.reset}`);
	}

	const defaultMsg = 'chore(i18n): sync translations from MindustryToolWeb';
	const finalMsg = commitMessage || defaultMsg;

	info(`Creating commit on top of ${remoteCommitSha.slice(0, 8)}...`);
	const newCommitSha = git(['commit-tree', newRemoteRootTree, '-p', remoteCommitSha, '-m', finalMsg]);

	info(`Pushing to ${CONFIG.remoteName} ${CONFIG.remoteBranch}...`);
	git(['push', CONFIG.remoteName, `${newCommitSha}:refs/heads/${CONFIG.remoteBranch}`]);

	// Update sync ref
	git(['update-ref', CONFIG.syncRef, newCommitSha]);

	success(`Successfully pushed translation changes to ${CONFIG.remoteName}/${CONFIG.remoteBranch}!`);
	log(`${c.dim}Commit SHA: ${newCommitSha}${c.reset}\n`);
}

/**
 * Main CLI entrypoint
 */
function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command || command === 'help' || command === '--help' || command === '-h') {
		log(`\n${c.bold}MindustryTool i18n Synchronization CLI${c.reset}\n`);
		log('Usage:');
		log(`  pnpm i18n:status      ${c.dim}Show sync status, uncommitted edits, and pending commits${c.reset}`);
		log(`  pnpm i18n:pull        ${c.dim}Pull and 3-way merge latest translations from public repo${c.reset}`);
		log(`  pnpm i18n:push [-m]   ${c.dim}Push local translation changes to public repository${c.reset}`);
		log('\nOptions:');
		log('  -m, --message <msg>   Custom commit message for i18n:push');
		log('\nEnvironment Variables:');
		log('  I18N_REMOTE           Git remote name (default: i18n-remote)');
		log('  I18N_REMOTE_URL       Git remote URL (default: https://github.com/MindustryTool/MindustryToolWebTranslation.git)');
		log('  I18N_BRANCH           Target branch (default: main)\n');
		return;
	}

	if (command === 'status') {
		statusCommand();
	} else if (command === 'pull') {
		pullCommand();
	} else if (command === 'push') {
		let customMsg = null;
		for (let i = 1; i < args.length; i++) {
			if ((args[i] === '-m' || args[i] === '--message') && args[i + 1]) {
				customMsg = args[i + 1];
				break;
			}
		}
		pushCommand(customMsg);
	} else {
		error(`Unknown command: ${command}`);
		log(`Run 'pnpm i18n:status' or 'node scripts/i18n.mjs --help' for available commands.`);
		process.exit(1);
	}
}

main();
