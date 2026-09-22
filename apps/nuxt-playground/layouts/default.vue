<script setup lang="ts">
import { groups } from "~/examples";

/**
 * Sidebar of example groups, the page, the log panel and every <DriverTour>:
 * the plugin's shared driver plus the extra instances examples create.
 */
const { extras, notice } = useExampleRunner();

const route = useRoute();

const pages = [
  { to: "/", title: "Overview" },
  ...groups.map(group => ({ to: `/${group.slug}`, title: group.title })),
  { to: "/animation", title: "Highlight box animation" },
  { to: "/styling", title: "Vue: slots & components" },
  { to: "/hints", title: "Hints" },
  { to: "/multi-page/one", title: "Multi-page tour" },
];

const isActive = (to: string) => (to === "/" ? route.path === "/" : route.path.startsWith(to));
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
