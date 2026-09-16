import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const tag = process.env.RELEASE_TAG ?? '';
const match = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/.exec(tag);

if (
	!match ||
	match[0] !== tag ||
	match.slice(1, 4).some((part) => !Number.isSafeInteger(Number(part)))
) {
	throw new Error(
		'Release tags must use vMAJOR.MINOR.PATCH, optionally followed by a prerelease.',
	);
}

const suffix = match[4];

if (
	suffix !== undefined &&
	suffix.split('.').some((part) => !/^[0-9A-Za-z-]+$/.test(part) || /^0\d+$/.test(part))
) {
	throw new Error(
		'Prerelease identifiers must be nonempty and numeric identifiers cannot have leading zeros.',
	);
}

const prerelease = suffix !== undefined;

if (process.env.RELEASE_PRERELEASE !== String(prerelease)) {
	throw new Error('The GitHub prerelease setting must match the release tag suffix.');
}

const repo = process.env.GITHUB_REPOSITORY ?? '';

if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
	throw new Error('GITHUB_REPOSITORY must identify the publishing repository.');
}

const pkg: unknown = JSON.parse(readFileSync('package.json', 'utf8'));

if (
	typeof pkg !== 'object' ||
	pkg === null ||
	!('name' in pkg) ||
	typeof pkg.name !== 'string' ||
	!pkg.name.startsWith(`@${repo.split('/')[0].toLowerCase()}/`)
) {
	throw new Error('The package scope must match the GitHub repository owner.');
}

if (
	!('publishConfig' in pkg) ||
	typeof pkg.publishConfig !== 'object' ||
	pkg.publishConfig === null ||
	!('registry' in pkg.publishConfig) ||
	pkg.publishConfig.registry !== 'https://npm.pkg.github.com'
) {
	throw new Error('The package must target the GitHub Packages registry.');
}

const version = tag.slice(1);
const distTag = prerelease ? 'next' : 'latest';
const next = {
	...pkg,
	version,
	repository: { type: 'git', url: `git+https://github.com/${repo}.git` },
};

writeFileSync('package.json', `${JSON.stringify(next, null, '\t')}\n`);

if (process.env.GITHUB_OUTPUT) {
	appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\ndist-tag=${distTag}\n`);
}

console.log(`Prepared ${pkg.name}@${version} for ${distTag}.`);
