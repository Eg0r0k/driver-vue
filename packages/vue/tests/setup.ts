import { config } from "@vue/test-utils";

// Transitions are part of the public styling contract (enter/leave classes),
// so tests run against the real <Transition>, not the stub.
config.global.stubs = { transition: false, "transition-group": false };

// happy-dom does no layout, so the document element reports a 0x0 client box
// and Floating UI would treat the whole viewport as overflowing. Mirror the
// window size instead, so flip/shift see the 1024x768 viewport happy-dom reports.
Object.defineProperty(document.documentElement, "clientWidth", {
  configurable: true,
  get: () => window.innerWidth,
});
Object.defineProperty(document.documentElement, "clientHeight", {
  configurable: true,
  get: () => window.innerHeight,
});
