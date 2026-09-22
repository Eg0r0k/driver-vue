import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

const pkg = (path: string) => fileURLToPath(new URL(`../../../packages/vue/${path}`, import.meta.url));

export default defineConfig({
  title: "driver-vue",
  description:
    "Vue 3 / Nuxt 4 port of driver.js: product tours, highlights and hints rendered with your own Vue components.",
  lang: "en-US",
  lastUpdated: false,
  cleanUrls: true,
  ignoreDeadLinks: [/^https?:\/\/localhost/],

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["link", { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" }],
    ["link", { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }],
    ["meta", { name: "theme-color", content: "#3866e8" }],
    ["meta", { property: "og:image", content: "/logo-512.png" }],
  ],

  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "driver-vue",
    search: { provider: "local" },

    nav: [
      { text: "Guide", link: "/guide/installation", activeMatch: "/guide/" },
      { text: "Components", link: "/styling/custom-components", activeMatch: "/styling/" },
      { text: "Examples", link: "/examples/simple-highlight", activeMatch: "/examples/" },
      { text: "API", link: "/api/components", activeMatch: "/api/" },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Installation", link: "/guide/installation" },
          { text: "Basic Usage", link: "/guide/basic-usage" },
          { text: "Configuration", link: "/guide/configuration" },
          { text: "Migrating from driver.js", link: "/guide/migrating-from-driverjs" },
          { text: "Nuxt", link: "/guide/nuxt" },
        ],
      },
      {
        text: "Your own components",
        items: [
          { text: "Custom Components", link: "/styling/custom-components" },
          { text: "Headless", link: "/styling/headless" },
          { text: "Highlight Animation", link: "/styling/highlight-animation" },
        ],
      },
      {
        text: "Styling the defaults",
        items: [
          { text: "Styling Popover", link: "/styling/styling-popover" },
          { text: "Styling Overlay", link: "/styling/styling-overlay" },
          { text: "Styling Hints", link: "/styling/styling-hints" },
          { text: "Theming", link: "/guide/theming" },
        ],
      },
      {
        text: "Examples",
        items: [
          { text: "Simple Highlight", link: "/examples/simple-highlight" },
          { text: "Static Tour", link: "/examples/static-tour" },
          { text: "Animated Tour", link: "/examples/animated-tour" },
          { text: "Async Tour", link: "/examples/async-tour" },
          { text: "Interactive Tour", link: "/examples/interactive-tour" },
          { text: "Multi-Page Tour", link: "/examples/multi-page-tour" },
          { text: "Popover Position", link: "/examples/popover-position" },
          { text: "Smooth Scroll", link: "/examples/smooth-scroll" },
          { text: "Tour Progress", link: "/examples/tour-progress" },
          { text: "Popover Buttons", link: "/examples/buttons" },
          { text: "Confirm on Exit", link: "/examples/confirm-on-exit" },
          { text: "Prevent Tour Exit", link: "/examples/prevent-destroy" },
          { text: "Hints", link: "/examples/hints" },
        ],
      },
      {
        text: "API",
        items: [
          { text: "Components", link: "/api/components" },
          { text: "Reference", link: "/api/reference/" },
          { text: "Driver methods", link: "/api/driver" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/Eg0r0k/driver-vue" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "driver.js by Kamran Ahmed; driver-vue port.",
    },
  },

  vite: {
    resolve: {
      alias: [
        { find: "driver-vue/style.css", replacement: pkg("src/style.css") },
        { find: "driver-vue/hints", replacement: pkg("src/hints.ts") },
        { find: /^driver-vue$/, replacement: pkg("src/index.ts") },
      ],
    },
    ssr: {
      noExternal: ["driver-vue", "@floating-ui/vue", "@floating-ui/dom"],
    },
  },
});
