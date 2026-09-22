// Generates apps/docs/api/components.md from the components' props, events,
// slots and exposed members, using vue-component-meta on the library's
// tsconfig so the tables always match the source.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createChecker } from "vue-component-meta";

const root = resolve(import.meta.dirname, "..");
const pkg = resolve(root, "../../packages/vue");

const COMPONENTS = [
  {
    name: "DriverTour",
    file: "src/components/DriverTour.vue",
    intro:
      "Renders a driver's tour: the overlay, the stage and the popover, teleported to `body` (or `config.teleportTo`) while the tour is active. Place it once in your layout; pass the driver as a prop or install `DriverPlugin` and omit it to render the shared instance.",
  },
  {
    name: "DriverPopover",
    file: "src/components/DriverPopover.vue",
    intro:
      "The default popover: the driver.js DOM, classes and accessibility contract, positioned with Floating UI. Every part is a slot; the whole body can be replaced through the default slot or `model.component`.",
  },
  {
    name: "DriverOverlay",
    file: "src/components/DriverOverlay.vue",
    intro:
      "The dimmed page with the stage cut out: a full-screen SVG whose single evenodd path is the dim minus the rounded cutout. Only the path receives pointer events.",
  },
  {
    name: "DriverStage",
    file: "src/components/DriverStage.vue",
    intro:
      "An empty, non-interactive box tracking the stage cutout, for decorations. Exposes its rect as `--driver-stage-*` CSS variables and takes a slot.",
  },
  {
    name: "DriverHints",
    file: "src/components/DriverHints.vue",
    intro:
      "Renders a hints instance: the beacons, the optional overlay and the open hint's popover (from `driver-vue/hints`).",
  },
  {
    name: "DriverHintBeacon",
    file: "src/components/DriverHintBeacon.vue",
    intro: "The default pulsing beacon of a hint.",
  },
].filter(component => existsSync(resolve(pkg, component.file)));

const checker = createChecker(resolve(pkg, "tsconfig.json"), {
  schema: { ignore: ["Element", "HTMLElement", "Component", "Driver", "Hints"] },
  printer: { newLine: 1 },
});

const code = value =>
  value === undefined || value === "" ? "" : `\`${String(value).replace(/\|/g, "\\|").replace(/\n/g, " ")}\``;
const text = value =>
  (value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\s*\n\s*/g, " ")
    .trim();

const table = (headers, rows) => {
  if (!rows.length) {
    return "_None._\n";
  }
  const line = cells => `| ${cells.join(" | ")} |`;
  return [line(headers), line(headers.map(() => "---")), ...rows.map(line)].join("\n") + "\n";
};

const section = component => {
  const meta = checker.getComponentMeta(resolve(pkg, component.file));

  const props = meta.props
    .filter(prop => !prop.global)
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name))
    .map(prop => [
      code(prop.name) + (prop.required ? " *" : ""),
      code(prop.type),
      code(prop.default),
      text(prop.description),
    ]);

  const events = meta.events.map(event => [code(event.name), code(event.type), text(event.description)]);

  const slots = meta.slots.map(slot => [code(slot.name), code(slot.type), text(slot.description)]);

  const exposed = meta.exposed
    .filter(
      item =>
        ![
          "$slots",
          "$props",
          "$attrs",
          "$emit",
          "$el",
          "$refs",
          "$parent",
          "$root",
          "$options",
          "$data",
          "$watch",
          "$forceUpdate",
          "$nextTick",
          "$",
        ].includes(item.name)
    )
    .filter(item => !meta.props.some(prop => prop.name === item.name))
    .map(item => [code(item.name), code(item.type), text(item.description)]);

  return [
    `## ${component.name}`,
    "",
    component.intro,
    "",
    "### Props",
    "",
    table(["Name", "Type", "Default", "Description"], props),
    "### Events",
    "",
    table(["Name", "Payload", "Description"], events),
    "### Slots",
    "",
    table(["Name", "Scope", "Description"], slots),
    "### Exposed",
    "",
    table(["Name", "Type", "Description"], exposed),
  ].join("\n");
};

const body = [
  "# Components",
  "",
  "Generated from the components' source with `vue-component-meta`; do not edit by hand. Required props are marked with `*`.",
  "",
  ...COMPONENTS.map(section),
].join("\n");

mkdirSync(resolve(root, "api"), { recursive: true });
writeFileSync(resolve(root, "api/components.md"), body);
console.log(`components.md: ${COMPONENTS.map(component => component.name).join(", ")}`);
