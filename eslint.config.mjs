import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import preferArrowFunctions from "eslint-plugin-prefer-arrow-functions";
import globals from "globals";

// ESLint for the whole monorepo: the Vue team's configs (eslint-plugin-vue,
// @vue/eslint-config-typescript, prettier compatibility) plus the house
// style: functions are written as `const fn = () => {}`.
export default defineConfigWithVueTs(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.nuxt/**",
      "**/.output/**",
      "**/.turbo/**",
      "**/coverage/**",
      "apps/docs/.vitepress/cache/**",
      "apps/docs/.vitepress/dist/**",
      "apps/docs/api/reference/**",
      "apps/docs/api/components.md",
    ],
  },
  js.configs.recommended,
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  {
    plugins: { "prefer-arrow-functions": preferArrowFunctions },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "prefer-arrow-functions/prefer-arrow-functions": [
        "error",
        { returnStyle: "unchanged", disallowPrototype: true, singleReturnOnly: false, classPropertiesAllowed: false },
      ],
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["packages/vue/tests/**/*.ts"],
    rules: {
      "vue/one-component-per-file": "off",
      "vue/require-prop-types": "off",
    },
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
  },
  {
    files: ["apps/nuxt-playground/**/*.{ts,vue}"],
    languageOptions: {
      // Nuxt auto-imports; the names are checked by nuxi typecheck instead.
      globals: {
        defineNuxtConfig: "readonly",
        useDriver: "readonly",
        useHints: "readonly",
        injectDriver: "readonly",
        createDriver: "readonly",
        useRuntimeConfig: "readonly",
        defineNuxtPlugin: "readonly",
        useRoute: "readonly",
        useRouter: "readonly",
        navigateTo: "readonly",
        useState: "readonly",
        ref: "readonly",
        computed: "readonly",
        onMounted: "readonly",
        watch: "readonly",
      },
    },
  },
  skipFormatting
);
