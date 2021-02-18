# 📌 Maintain One Comment

![](https://img.shields.io/github/workflow/status/actions-cool/maintain-one-comment/CI?style=flat-square)
[![](https://img.shields.io/badge/marketplace-maintain--one--comment-blueviolet?style=flat-square)](https://github.com/marketplace/actions/maintain-one-comment)

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
        uses: actions-cool/maintain-one-comment@v1.0.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          body: |
            Hi 😀
            <!-- Created by actions-cool/maintain-one-comment -->
          emojis: '+1, laugh'
          body-include: '<!-- Created by actions-cool/maintain-one-comment -->'
```

| Name | Desc | Type | Required |
| -- | -- | -- | -- |
| token | GitHub token | string | ✖ |
| body | Create comment body | string | ✔ |
| emojis | Add [emoji](#emoji-list) | string | ✖ |
| update-mode | Comment update mode. Options: `replace` `append`. Default: `replace` | string | ✖ |
| comment-auth | Filter comment auth | string | ✖ |
| body-include | Filter comment body | string | ✖ |

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

## 💖 Who is using?

## LICENSE

[MIT](./LICENSE)
