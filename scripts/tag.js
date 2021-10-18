const chalk = require('chalk');
const simpleGit = require('simple-git/promise');
const { execSync } = require('child_process');

const cwd = process.cwd();
const git = simpleGit(cwd);

async function run() {
  const data = await git.tags();
  const tags = data.all;
  const tag = tags.reverse()[0];
  console.log(chalk.green(`[Git Query] tag: ${tag}`));

  const tagSimple = tag.startsWith('v') ? tag.substring(0, 2) : tag.substring(0, 1);
  console.log(chalk.green(`[Git Query] tagSimple: ${tagSimple}`));

  if (tags.includes(tagSimple)) {
    console.log(chalk.yellow(`[Git Action] Delete ${tagSimple} tag`));
    execSync(`git push origin :refs/tags/${tagSimple}`);
  }

  console.log(chalk.yellow(`[Git Action] Add new ${tagSimple} tag`));
  execSync(`git push origin ${tag}:${tagSimple}`);
  console.log(chalk.green('🎉 Done!'));
}

run();
