# Contributing

## Setup

```sh
pnpm install            # also installs the git hooks (husky)
git config commit.template .gitmessage
```

## Day to day

| Command | What |
| --- | --- |
| `pnpm test` | driver-vue unit tests in watch mode |
| `pnpm test:run` | every test once |
| `pnpm lint` / `pnpm lint:fix` | ESLint (Vue team configs + arrow-function style) |
| `pnpm typecheck` | vue-tsc for every package |
| `pnpm build` | library, Nuxt module, playground, docs |
| `pnpm docs:dev` | documentation with live demos |
| `pnpm play:nuxt` | Nuxt playground |

The pre-commit hook runs ESLint and Prettier on staged files; the commit-msg hook checks the message format.

## Commit messages

Conventional Commits, enforced by commitlint:

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**: `feat` `fix` `perf` `refactor` `docs` `test` `build` `ci` `chore` `style` `revert`
- **scope** (optional): `vue` `nuxt` `core` `hints` `position` `components` `docs` `playground` `release` `deps` `lint`
- **subject**: imperative, lower-case, no trailing period, header ≤ 100 chars
- breaking changes: a `BREAKING CHANGE:` footer (or `!` after the type/scope)

`git commit` opens the template from `.gitmessage` with the rules inline.

## Versions and releases

Versioning is done with [Changesets](https://github.com/changesets/changesets). `driver-vue` and `nuxt-driver-vue` are linked and always share a version.

1. Make the change. If it is user-facing for a package, add a changeset in the same commit:
   ```sh
   pnpm changeset      # pick the package(s), the bump (patch/minor/major), write the changelog line
   ```
   Docs/playground/tooling-only changes need no changeset.
2. Open a pull request. CI runs commitlint, lint, typecheck, tests, build and the package checks.
3. Merging to `master` makes the release workflow open (or update) a **"chore(release): version packages"** pull request that bumps the versions and writes the `CHANGELOG.md` files from the pending changesets.
4. Merging that pull request publishes `driver-vue` and `nuxt-driver-vue` to npm (`pnpm release` = build + test + package lint + `changeset publish`) and tags the commit. `NPM_TOKEN` must be set in the repository secrets.

Releasing by hand from a machine with npm access:

```sh
pnpm version-packages
git commit -am "chore(release): version packages"
pnpm release
git push --follow-tags
```

Pre-releases: `pnpm changeset pre enter beta` … `pnpm changeset pre exit` around the normal flow.
