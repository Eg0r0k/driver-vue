<script setup lang="ts">
/**
 * The sandbox content every demo points at: a deliberately fake little app
 * (avatar, name, three placeholder numbers, a search field and two buttons)
 * inside the dashed `.demo-box` frame, so nobody mistakes it for real docs
 * content. Every id is prefixed so several boxes can live on one page.
 *
 * Slots: `default` renders extra sandbox content under the buttons, `footer`
 * renders the demo's own controls inside the frame's footer.
 */
withDefaults(defineProps<{ prefix?: string }>(), { prefix: "demo" });
</script>

<template>
  <div :id="`${prefix}-box`" class="demo-box">
    <div class="demo-app-head">
      <span class="demo-avatar" aria-hidden="true">AA</span>
      <div>
        <h4 :id="`${prefix}-title`">Acme Analytics</h4>
        <p class="demo-app-sub">Pretend workspace · nothing here is real</p>
      </div>
    </div>
    <p :id="`${prefix}-summary`">
      Made-up content that exists only so the tour has something to point at. The numbers are placeholders and the
      buttons do nothing.
    </p>
    <div class="demo-kpis">
      <div class="demo-kpi"><span>Revenue</span><strong>$00.0k</strong></div>
      <div class="demo-kpi"><span>Signups</span><strong>000</strong></div>
      <div class="demo-kpi"><span>Churn</span><strong>0.0%</strong></div>
    </div>
    <input :id="`${prefix}-search`" class="demo-input" type="text" placeholder="Search the pretend workspace" />
    <div class="demo-row">
      <button :id="`${prefix}-export`" type="button" class="demo-button">Export</button>
      <button :id="`${prefix}-share`" type="button" class="demo-button secondary">Share</button>
    </div>
    <slot />
    <div v-if="$slots.footer" class="demo-box-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
