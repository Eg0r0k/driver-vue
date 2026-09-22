import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { DriverPlugin } from "driver-vue";
import "driver-vue/style.css";
import "./custom.css";

import Layout from "./Layout.vue";
import Demo from "./components/Demo.vue";
import DemoBox from "./components/DemoBox.vue";
import CustomPopoverDemo from "./components/CustomPopoverDemo.vue";
import StepComponentDemo from "./components/StepComponentDemo.vue";
import GlowStageDemo from "./components/GlowStageDemo.vue";
import CustomOverlayDemo from "./components/CustomOverlayDemo.vue";
import HeadlessDemo from "./components/HeadlessDemo.vue";
import ThemeDemo from "./components/ThemeDemo.vue";
import FormHelpDemo from "./components/FormHelpDemo.vue";
import AsyncTourDemo from "./components/AsyncTourDemo.vue";
import WaitForElementDemo from "./components/WaitForElementDemo.vue";
import CustomButtonDemo from "./components/CustomButtonDemo.vue";
import EventLogDemo from "./components/EventLogDemo.vue";
import ConfirmExitDemo from "./components/ConfirmExitDemo.vue";
import HintsDemo from "./components/HintsDemo.vue";
import ComposableDemo from "./components/ComposableDemo.vue";

const theme: Theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp: ({ app }) => {
    // One shared driver for the plain <Demo> blocks; the Layout renders its
    // <DriverTour />. Demos that need slots create their own driver.
    app.use(DriverPlugin, { components: true });

    app.component("Demo", Demo);
    app.component("DemoBox", DemoBox);
    app.component("CustomPopoverDemo", CustomPopoverDemo);
    app.component("StepComponentDemo", StepComponentDemo);
    app.component("GlowStageDemo", GlowStageDemo);
    app.component("CustomOverlayDemo", CustomOverlayDemo);
    app.component("HeadlessDemo", HeadlessDemo);
    app.component("ThemeDemo", ThemeDemo);
    app.component("FormHelpDemo", FormHelpDemo);
    app.component("AsyncTourDemo", AsyncTourDemo);
    app.component("WaitForElementDemo", WaitForElementDemo);
    app.component("CustomButtonDemo", CustomButtonDemo);
    app.component("EventLogDemo", EventLogDemo);
    app.component("ConfirmExitDemo", ConfirmExitDemo);
    app.component("ComposableDemo", ComposableDemo);
    app.component("HintsDemo", HintsDemo);
  },
};

export default theme;
