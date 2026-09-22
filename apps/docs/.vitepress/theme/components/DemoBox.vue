<script setup lang="ts">
/**
 * Sample "product" content that demo steps target by id: a small dashboard
 * card with a heading, a paragraph, an input and two buttons. Every id is
 * prefixed so several boxes can live on one page.
 */
withDefaults(defineProps<{ prefix?: string }>(), { prefix: "demo" });
</script>

<template>
  <div class="demo-box" :id="`${prefix}-box`">
    <h4 :id="`${prefix}-title`">Quarterly report</h4>
    <p :id="`${prefix}-summary`">
      Revenue grew 12% quarter over quarter, driven by the new onboarding flow. Churn stayed flat at 2.1%.
    </p>
    <input :id="`${prefix}-search`" class="demo-input" type="text" placeholder="Search the report" />
    <div class="demo-row">
      <button :id="`${prefix}-export`" type="button" class="demo-button">Export</button>
      <button :id="`${prefix}-share`" type="button" class="demo-button secondary">Share</button>
    </div>
  </div>
</template>
