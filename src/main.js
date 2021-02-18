const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');

// ************************************************
const token = core.getInput('token');
const octokit = new Octokit({ auth: `token ${token}` });
const context = github.context;

// ************************************************
async function run() {
  try {
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    // 维护评论
    const body = core.getInput('body', { require: true });
    const emojis = core.getInput('emojis');
    let updateMode = core.getInput('update-mode');
    if (updateMode !== 'append') {
      updateMode = 'replace';
    }

    // 筛选评论
    const commentAuth = core.getInput('comment-auth');
    const bodyInclude = core.getInput('body-include');

    // 手动 number
    const inputNumber = core.getInput('number');

    let number;
    if (inputNumber) {
      number = inputNumber;
    } else if (context.eventName.includes('issue')) {
      number = context.payload.issue.number;
    } else if (context.eventName.includes('pull_request')) {
      number = context.payload.pull_request.number;
    } else {
      core.info(
        `Now eventName: ${context.eventName}. And input number is empty. This Action only support issue and pull_request related!`,
      );
      return false;
    }

    const res = await octokit.issues.listComments({
      owner,
      repo,
      issue_number: number,
    });
    core.info(`Actions: [find-comments][${number}] success!`);
    let comments = [];
    res.data.forEach(item => {
      const a = commentAuth ? item.user.login === commentAuth : true;
      const b = bodyInclude ? item.body.includes(bodyInclude) : true;
      if (a && b) {
        comments.push({
          id: item.id,
          auth: item.user.login,
          body: item.body,
        });
      }
    });
    core.info(`filter-comments: ${JSON.stringify(comments)}`);
    if (comments.length === 0) {
      const { data } = await octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body,
      });
      core.info(`Actions: [create-comment][${body}] success!`);

      if (emojis) {
        dealStringToArr(emojis).forEach(async item => {
          if (testEmoji(item)) {
            await octokit.reactions.createForIssueComment({
              owner,
              repo,
              comment_id: data.id,
              content: item,
            });
            core.info(`Actions: [create-emoji][${item}] success!`);
          }
        });
      }
    } else if (comments.length === 1) {
      let commentId = comments[0].id;
      const comment = await octokit.issues.getComment({
        owner,
        repo,
        comment_id: commentId,
      });
      const comment_body = comment.data.body;

      let params = {
        owner,
        repo,
        comment_id: commentId,
      };

      if (updateMode === 'append') {
        params.body = `${comment_body}\n${body}`;
      } else {
        params.body = body;
      }

      await octokit.issues.updateComment(params);
      core.info(`Actions: [update-comment][${params.body}] success!`);
    } else {
      let length = comments.length;
      core.info(`The comments length is ${length}.`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

const ALLEMOJIS = ['+1', '-1', 'laugh', 'confused', 'heart', 'hooray', 'rocket', 'eyes'];

function testEmoji(con) {
  if (ALLEMOJIS.includes(con)) {
    return true;
  } else {
    core.info(`This emoji: ${con} not supported!`);
    return false;
  }
}

function dealStringToArr(para) {
  /**
   * in  'x1,x2,x3'
   * out ['x1','x2','x3']
   */
  let arr = [];
  if (para) {
    const paraArr = para.split(',');
    paraArr.forEach(it => {
      if (it.trim()) {
        arr.push(it.trim());
      }
    });
  }
  return arr;
}

// ************************************************
run();
