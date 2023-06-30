const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');

// ************************************************
const token = core.getInput('token');
const octokit = new Octokit({ auth: `token ${token}` });
const context = github.context;
const defaultBody = '<!-- Created by actions-cool/maintain-one-comment -->';

const { dealStringToArr, THANKS } = require('actions-util');

// ************************************************
async function run() {
  try {
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    // 维护评论
    const body = core.getInput('body');
    const emojis = core.getInput('emojis');
    let updateMode = core.getInput('update-mode');
    if (updateMode !== 'append') {
      updateMode = 'replace';
    }

    const commentAuth = core.getInput('comment-auth');
    const bodyInclude = core.getInput('body-include') || defaultBody;
    const doDelete = core.getInput('delete') === 'true';

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

    async function listComments(page = 1) {
      let { data: comments } = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: number,
        per_page: 100,
        page,
      });
      if (comments.length >= 100) {
        comments = comments.concat(await listComments(page + 1));
      }
      return comments;
    }

    const commentList = await listComments();
    core.info(`Actions: [find-comments][${number}] success!`);
    let comments = [];
    commentList.forEach(item => {
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
    core.info(`filter-comments-length: ${comments.length}`);

    if (doDelete) {
      for (const { id } of comments) {
        await octokit.issues.deleteComment({
          owner,
          repo,
          comment_id: id,
        });
      }
      core.info(`Actions: [delete-comments] success!`);
    } else {
      if (comments.length === 0 && body.length > 0) {
        const commentBody = `${body}\n${bodyInclude}`;
        const { data } = await octokit.issues.createComment({
          owner,
          repo,
          issue_number: number,
          body: commentBody,
        });
        core.info(`Actions: [create-comment][${commentBody}] success!`);
        core.setOutput('comment-id', data.id);

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
        if (!body) {
          await octokit.issues.deleteComment({
            owner,
            repo,
            comment_id: commentId,
          });
          core.info(`Actions: [delete-comment][${commentId}] success!`);
          return false;
        }
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

        let commentBody;
        if (updateMode === 'append') {
          commentBody = `${comment_body}\n${body}`;
        } else {
          commentBody = body;
        }
        params.body = `${commentBody}\n${bodyInclude}`;
        await octokit.issues.updateComment(params);
        core.setOutput('comment-id', commentId);
        core.info(`Actions: [update-comment][${params.body}] success!`);
      }
    }

    core.info(THANKS);
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

// ************************************************
run();
