<script setup lang="ts">
useHead({ title: "Profile · driver-vue playground" });

/** The last screen of the mock app; the tour ends here with a centered step. */
const details = [
  { label: "Role", value: "Owner" },
  { label: "Member since", value: "March 2023" },
  { label: "Two-factor auth", value: "Enabled" },
];
</script>

<template>
  <div class="page">
    <MultiPageNav />

    <section class="mp-screen">
      <header class="mp-head">
        <h2>Profile</h2>
        <p>Your account inside the Acme workspace</p>
      </header>

      <article id="mp-profile-card" class="mp-profile">
        <span class="mp-avatar" aria-hidden="true">DA</span>
        <div class="mp-profile-body">
          <strong>Dana Alvarez</strong>
          <span class="mp-muted">dana@acme.example</span>
          <dl class="mp-details">
            <template v-for="detail in details" :key="detail.label">
              <dt>{{ detail.label }}</dt>
              <dd>{{ detail.value }}</dd>
            </template>
          </dl>
        </div>
      </article>
    </section>
  </div>
</template>
