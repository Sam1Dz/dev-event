---
argument-hint: '[head_branch] or [base_branch] [head_branch]'
description: 'Generate a PR title and description from the diff between two git branches'
---

# Pull Request Generator

Generate a Pull Request title and description from the git changes between the provided branches: `$ARGUMENTS`

## Branch Inputs

Interpret `$ARGUMENTS` using these rules:

1. If two branch names are provided, treat them as `<base_branch> <head_branch>`.
2. If one branch name is provided, treat it as `<head_branch>` and use `main` as `<base_branch>`.
3. If no branch names are provided, use `main` as `<base_branch>` and the current git branch as `<head_branch>`.

## Workflow

1. Determine the effective `base_branch` and `head_branch`.
2. Gather the relevant git context needed to understand the change:
   - current branch
   - changed files summary
   - commit summary between the branches
   - diff stat between the branches
   - full diff when the summary is not sufficient
3. Analyze the changes between `head_branch` and `base_branch`.
4. Generate a concise PR title and description that accurately reflect the diff.

If `base_branch` and `head_branch` resolve to the same branch, stop and ask the user for an explicit branch pair instead of guessing.

## Title Guidelines

- Format: short summary without brackets
- Example: Add user login integration
- Keep it concise and technically accurate

## Description Guidelines

1. For `Summary`, provide a concise technical summary.
2. For `Impact`, describe the functional or system impact.
3. Do not invent changes that are not present in the diff.

## Output Format

Return both the title and description inside a single copyable Markdown code block.

```markdown
PR Title: [Insert Generated Title Here]

PR Description:

## Summary

[Insert concise technical summary here]

## Impact

[Insert functional or system impact here]
```
