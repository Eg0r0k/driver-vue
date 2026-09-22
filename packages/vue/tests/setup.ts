import { config } from "@vue/test-utils";

// Transitions are part of the public styling contract (enter/leave classes),
// so tests run against the real <Transition>, not the stub.
config.global.stubs = { transition: false, "transition-group": false };
