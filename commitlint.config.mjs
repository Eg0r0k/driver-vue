// Conventional Commits, checked by the husky commit-msg hook and in CI.
// Format: <type>(<scope>): <subject>   — see .gitmessage for the template.
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "perf", "refactor", "docs", "test", "build", "ci", "chore", "style", "revert"],
    ],
    "scope-enum": [
      2,
      "always",
      ["vue", "nuxt", "core", "hints", "position", "components", "docs", "playground", "release", "deps", "lint"],
    ],
    "scope-empty": [0],
    "subject-case": [2, "never", ["start-case", "pascal-case", "upper-case"]],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [1, "always", 120],
  },
};
