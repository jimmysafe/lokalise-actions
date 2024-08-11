# 🌏 Unobravo Translations Actions

This repo provides all functionalities for the Unobravo Translations Flow.

The project combines Reusable Workflows with Custom Actions to improve developer experience as all actions are written with Typescript.

### Reusable Workflows

```
.github
    workflows
        # THESE FILES ARE REUSABLE WORKFLOWS
        open-pr.yml
        release.yml
        ...
```

These are simple actions `yml` files that will be called by the repo which implements the translations flow (unobravo-fe-monorepo, unobravo-be-monorepo ecc..).

The reusable workflows will eventually invoke a custom action.

### Custom Actions

```
# THESE FOLDERS ARE CUSTOM ACTIONS
translations-open-pr
    ...
translations-release
    ...
```

Custom actions are TS projects that hold all the logic for a specific workflow.

### Api (Vercel Serverless Functions)

The `api` folder includes all public endpoints available if we need to trigger a specific github webhook.

For example we have implemented an endpoint that gets called by a Lokalise webhook whenever a Task gets updated. This endpoint will then trigger a Github Workflow dispatch of the `task-handler` reusable action.

## How to publish a new workflow

- Merge the pull request with your changes on main branch
- On your local machine checkout the main branch and pull changes with `git checkout main` and `git pull`
- Pull latest tags with `git pull --tags --force`. Force is important to keep in sync overwritten tags
- If you want to release a **patch** or a **minor** change, overwrite the already existing tag for that action/workflow.
  For example we want to release a minor change on `translations` action and the tag `translations-v1` already exists. You need to run

```
git tag translations-v1 -f
git push origin translations-v1 -f
```

- If you want to release a **major** change, create a tag with a version increase.
  For example we want to release a **major** change on `translations` action and the tag `translations-v1` already exists. You need to run

```
git tag translations-v2
git push origin translations-v2
```

**Please don't ever run `git push --tags --force`, you can overwrite other actions/workflows tags with this command and cause disruption.**
