<script setup lang="ts">
useHead({ title: "Settings · driver-vue playground" });

/** The second screen of the mock app; steps 4 and 5 of the multi-page tour. */
const workspace = ref("Acme Inc.");
const timezone = ref("UTC");
const weekly = ref(true);

const { showNotice } = useExampleRunner();
</script>

<template>
  <div class="page">
    <MultiPageNav />

    <section class="mp-screen">
      <header class="mp-head">
        <h2>Settings</h2>
        <p>Workspace preferences · only you can see these</p>
      </header>

      <form class="mp-form" @submit.prevent="showNotice('Settings saved')">
        <label class="mp-field">
          Workspace name
          <input id="mp-workspace-name" v-model="workspace" type="text" autocomplete="off" />
        </label>

        <label class="mp-field">
          Time zone
          <select id="mp-timezone" v-model="timezone">
            <option>UTC</option>
            <option>Europe/Berlin</option>
            <option>America/New_York</option>
          </select>
        </label>

        <label class="mp-check">
          <input id="mp-weekly" v-model="weekly" type="checkbox" />
          Email me a weekly summary
        </label>

        <button id="mp-save" type="submit" class="demo-button">Save changes</button>
      </form>
    </section>
  </div>
</template>
