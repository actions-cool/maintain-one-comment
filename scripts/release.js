const open = require('open');
const newGithubReleaseUrl = require('new-github-release-url');
const { readFileSync } = require('fs');
const path = require('path');

let tag = '';

const CHANGELOG_NAME = 'CHANGELOG.md';
const user = 'actions-cool';
const repo = 'maintain-one-comment';

function getChangelog(content) {
  const lines = content.split('\n');
  const changeLog = [];
  const startPattern = new RegExp(`^## `);
  const stopPattern = /^## /; // 前一个版本
  let begin = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (begin && stopPattern.test(line)) {
      break;
    }
    if (begin && line) {
      changeLog.push(line);
    }
    if (!begin) {
      begin = startPattern.test(line);
      if (begin) {
        tag = line.substring(3, line.length);
      }
    }
  }
  return changeLog.join('\n');
}

const changelogPath = path.join(__dirname, '..', CHANGELOG_NAME);
const changelog = readFileSync(changelogPath, 'utf-8');

const body = getChangelog(changelog);

async function run() {
  const url = newGithubReleaseUrl({
		user,
    repo,
		tag,
		body: body,
	});

  await open(url);
};

run();
