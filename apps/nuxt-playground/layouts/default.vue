<script setup lang="ts">
import { groups } from "~/examples";
import { multiPageSteps } from "~/examples/multi-page";

/**
 * Sidebar of example groups, the page, the log panel and every <DriverTour>:
 * the plugin's shared driver plus the extra instances examples create.
 */
const { extras, notice } = useExampleRunner();

// The multi-page tour is driven from here: the layout outlives every route,
// so its route watcher can continue the tour on the next page.
useMultiPageTour({ steps: multiPageSteps });

const route = useRoute();

const pages = [
  { to: "/", title: "Overview" },
  { to: "/styling", title: "Your own components (slots)" },
  { to: "/animation", title: "Highlight box animation" },
  ...groups.map(group => ({ to: `/${group.slug}`, title: group.title })),
  { to: "/hints", title: "Hints" },
  { to: "/multi-page/dashboard", title: "Multi-page tour" },
];

const isActive = (to: string) => {
  if (to === "/") {
    return route.path === "/";
  }

  return to.startsWith("/multi-page") ? route.path.startsWith("/multi-page") : route.path.startsWith(to);
};
</script>

<template>
  <div class="shell">
    <nav class="sidebar">
      <NuxtLink to="/" class="brand">driver-vue playground</NuxtLink>
      <ul class="nav">
        <li v-for="page in pages" :key="page.to">
          <NuxtLink :to="page.to" class="nav-link" :class="{ 'nav-active': isActive(page.to) }">
            {{ page.title }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <main class="content">
      <TourProgress />
      <slot />
    </main>

    <ExampleLog />

    <Transition name="notice">
      <div v-if="notice" class="notice" role="status">{{ notice }}</div>
    </Transition>

    <ClientOnly>
      <DriverTour />
      <DriverTour v-for="(driver, index) in extras" :key="index" :driver="driver" />
    </ClientOnly>
  </div>
</template>
