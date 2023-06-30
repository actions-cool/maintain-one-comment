# 📌 Maintain One Comment

[![](https://github.com/actions-cool/maintain-one-comment/actions/workflows/test.yml/badge.svg)](https://github.com/actions-cool/maintain-one-comment/actions/workflows/test.yml)
[![](https://img.shields.io/badge/marketplace-maintain--one--comment-blueviolet?style=flat-square)](https://github.com/marketplace/actions/maintain-one-comment)
[![](https://img.shields.io/github/v/release/actions-cool/maintain-one-comment?style=flat-square&color=orange)](https://github.com/actions-cool/maintain-one-comment/releases)

Maintain just one comment in Issue and PR.

- This Action is only applicable to triggers related to issue and pull_request
- When the **filtered comments** do not exist, will add a comment
- When the **filtered comments** is only one, this comment will be updated
- When the number of **filtered comments** exceeds 1, no operation will be performed

## Preview
- Issue: https://github.com/actions-cool/maintain-one-comment/issues/1
- PR: https://github.com/actions-cool/maintain-one-comment/pull/2

## How to use?
```yml
name: Maintain One Comment

on:
  issues:
    types: [opened, edited]
  issue_comment:
    types: [created, edited]
  pull_request:
    types: [assigned, opened, synchronize, edited]

jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - name: maintain-comment
        uses: actions-cool/maintain-one-comment@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          body: |
            Hi 😀
          emojis: '+1, laugh'
          body-include: '<!-- Created by actions-cool/maintain-one-comment -->'
```

### Inputs

| Name | Desc | Type | Required |
| -- | -- | -- | -- |
| token | GitHub token | string | ✖ |
| number | Manually control the issue or PR number | string | ✖ |
| body | Create comment body | string | ✖ |
| emojis | Add [emoji](#emoji-list) | string | ✖ |
| update-mode | Comment update mode. Options: `replace` `append`. Default: `replace` | string | ✖ |
| comment-auth | Filter comment auth | string | ✖ |
| body-include | Filter comment body | string | ✖ |
| delete | Will delete all filter comments. Default `false` | boolean |  ✖ |

- `number`: When no input, it will be the issue or PR number that triggered. When input, it is the highest priority
- `body`: When has 1 comment, and no body input will delete this filter comment

### Outputs

- `comment-id`: Return the ID of create or updated comment.
  - About `comment-id` use, can refer: https://github.com/actions-cool/issues-helper

## Note

- When PR come from fork, it requires `pull_request_target` to comment (Reasons for github built-in permissions). When use `pull_request_target`, must [read](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull_request_target)

## Emoji List

| input | emoji |
| -- | -- |
| `+1` | 👍 |
| `-1` | 👎 |
| `laugh` | 😄 |
| `confused` | 😕 |
| `heart` | ❤️ |
| `hooray` | 🎉 |
| `rocket` | 🚀 |
| `eyes` | 👀 |

## Changelog

[CHANGELOG](./CHANGELOG.md)

## LICENSE

[MIT](./LICENSE)
