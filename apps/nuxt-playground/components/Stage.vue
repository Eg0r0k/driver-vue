<script setup lang="ts">
// The shared demo content every example highlights against. Examples
// reference these elements by selector (.page-header, .buttons,
// #scrollable-area, ...), so keep the ids and classes stable when editing.
</script>

<template>
  <div class="demo-container">
    <header class="page-header">
      <h1>driver-vue <sup>v0.1</sup></h1>
      <p>A Vue port of driver.js: tours, highlights and hints rendered with your own components.</p>
    </header>

    <h2>Highlight any element</h2>
    <p id="large-paragraph-text">
      Highlight anything, anywhere on the page: literally anything, including SVG portions, scrollable items and
      off-screen elements. Pick an example on the left to see it in action.
    </p>

    <div class="buttons">
      <button id="card-1" type="button">Card One</button>
      <button id="card-2" type="button">Card Two</button>
      <button id="card-3" type="button">Card Three</button>
      <button id="card-4" type="button">Card Four</button>
      <button id="card-5" type="button">Card Five</button>
      <button id="card-6" type="button">Card Six</button>
    </div>

    <ul class="feature-list">
      <li>Written in TypeScript</li>
      <li>Popover, overlay and stage are Vue components</li>
      <li>Positioned by Floating UI</li>
      <li>MIT Licensed</li>
    </ul>

    <ul id="hooks-list">
      <li>The log panel below the examples follows the hooks fired by an example.</li>
    </ul>

    <form class="demo-form" @submit.prevent>
      <label>
        Name
        <input id="form-name" type="text" placeholder="Your name" autocomplete="off" />
      </label>
      <label>
        Email
        <input id="form-email" type="email" placeholder="you@example.com" autocomplete="off" />
      </label>
      <label class="demo-check">
        <input id="form-agree" type="checkbox" />
        I agree to receive product updates
      </label>
      <button id="form-submit" type="submit">Submit</button>
    </form>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi blanditiis consectetur ea eligendi id in inventore
      ipsa iure laudantium libero, minus molestias necessitatibus nesciunt non omnis, quasi recusandae tempore
      voluptates!
    </p>

    <div id="scrollable-area">
      <p>First: scroll down inside this box to reach the highlighted paragraph.</p>
      <p>Second: Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      <p id="third-scroll-paragraph">Third: even nested scrollable elements are handled correctly.</p>
      <p>Fourth: Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      <p>Fifth: Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      <p>Sixth: Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      <p>Seventh: Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      <p>Eighth: Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      <p>Ninth: Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
    </div>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi blanditiis consectetur ea eligendi id in inventore
      ipsa iure laudantium libero, minus molestias necessitatibus nesciunt non omnis, quasi recusandae tempore
      voluptates!
    </p>

    <svg id="demo-svg" viewBox="0 0 320 120" width="320" height="120" aria-label="Sample chart">
      <rect id="svg-bar-1" x="20" y="40" width="50" height="70" rx="4" fill="#6366f1" />
      <rect id="svg-bar-2" x="90" y="20" width="50" height="90" rx="4" fill="#818cf8" />
      <rect id="svg-bar-3" x="160" y="60" width="50" height="50" rx="4" fill="#a5b4fc" />
      <circle id="svg-dot" cx="270" cy="50" r="22" fill="#f59e0b" />
    </svg>
  </div>
</template>
