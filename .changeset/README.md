# Changesets

Every user-facing change to `driver-vue` or `nuxt-driver-vue` ships with a changeset: a small markdown file in this folder that names the package, the bump (`patch` / `minor` / `major`) and a line for the changelog.

```sh
pnpm changeset          # answer the prompts, commit the generated file with your change
```

Releasing:

```sh
pnpm version-packages   # applies pending changesets: bumps versions, writes CHANGELOG.md
git commit -am "chore(release): version packages"
pnpm release            # build + test + lint:package + changeset publish (npm)
```

`driver-vue` and `nuxt-driver-vue` are linked, so they always move to the same version together. See CONTRIBUTING.md for the full flow, including the GitHub Actions release.
