import { createDriver, injectDriver, type Config, type Driver } from "driver-vue";
import type { ExampleContext } from "~/examples/types";

export type LogEntry = { id: number; time: string; text: string };

let nextId = 0;

const describe = (value: unknown): string => {
  if (value instanceof Element) {
    const id = value.id ? `#${value.id}` : "";
    const cls = value.classList.length ? `.${[...value.classList].slice(0, 2).join(".")}` : "";
    return `<${value.tagName.toLowerCase()}${id}${cls}>`;
  }
  if (typeof value === "string") {
    return value;
  }
  if (value === undefined) {
    return "undefined";
  }
  try {
    return JSON.stringify(value, (_key, item) => (item instanceof Element ? describe(item) : item));
  } catch {
    return String(value);
  }
};

/**
 * Shared playground state: the extra drivers created by examples (rendered
 * by the layout), the log panel entries and the notice. `useState` keeps it
 * app-wide across pages and SSR-safe.
 */
export const useExampleRunner = () => {
  const extras = useState<Driver[]>("playground-extras", () => []);
  const entries = useState<LogEntry[]>("playground-log", () => []);
  const notice = useState<string | undefined>("playground-notice", () => undefined);
  const shared = injectDriver();

  let noticeTimer: ReturnType<typeof setTimeout> | undefined;

  const log = (...parts: unknown[]) => {
    const time = new Date().toLocaleTimeString(undefined, { hour12: false });
    entries.value = [{ id: ++nextId, time, text: parts.map(describe).join(" ") }, ...entries.value].slice(0, 60);
  };

  const showNotice = (message: string) => {
    notice.value = message;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => {
      notice.value = undefined;
    }, 2500);
  };

  const reset = () => {
    shared.value.destroy();
    extras.value.forEach(driver => driver.destroy());
    extras.value = [];
  };

  const configure = (config: Config = {}): Driver => {
    shared.value.destroy();
    shared.value.setConfig(config);
    return shared.value;
  };

  const create = (config: Config = {}): Driver => {
    const driver = createDriver(config);
    extras.value = [...extras.value, driver];
    return driver;
  };

  const context = (): ExampleContext => ({
    configure,
    driver: shared.value,
    create,
    log,
    notice: showNotice,
    reset,
  });

  const clearLog = () => {
    entries.value = [];
  };

  return { extras, entries, notice, showNotice, context, reset, clearLog, log };
};
