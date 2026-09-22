import type { ExampleGroup } from "./types";

const CREATED_ID = "created-on-demand";

export const advanceWaitGroup: ExampleGroup = {
  slug: "advance-wait",
  title: "Advance & Wait",
  intro: "Let the highlighted element itself move the tour on, and wait for elements that appear later.",
  examples: [
    {
      id: "advance-on-click",
      title: "Advance on Click",
      description:
        "With advanceOnClick on, clicking the highlighted element acts like pressing Next. The element's own click behavior still runs.",
      run: ctx => {
        ctx
          .configure({
            showProgress: true,
            advanceOnClick: true,
            steps: [
              {
                element: "#card-1",
                popover: {
                  title: "Click the Button",
                  description: "Click the highlighted button itself to move on. Next works too.",
                },
              },
              {
                element: "#card-2",
                popover: {
                  title: "This One Too",
                  description: "Clicking the highlighted element acts exactly like pressing Next.",
                },
              },
              {
                element: ".page-header",
                popover: {
                  title: "Last Step",
                  description: "Clicking the header now ends the tour, like the Done button.",
                },
              },
            ],
          })
          .drive();
      },
    },
    {
      id: "advance-on-click-no-next",
      title: "Advance on Click (No Next Button)",
      description:
        "The real-world pattern: hide the next button on click-driven steps so the highlighted element is the only way forward.",
      run: ctx => {
        ctx
          .configure({
            steps: [
              {
                element: "#card-3",
                advanceOnClick: true,
                popover: {
                  showButtons: ["close"],
                  title: "Click to Continue",
                  description: "No next button here. Clicking the highlighted button is the only way forward.",
                },
              },
              {
                element: ".feature-list",
                popover: {
                  title: "Regular Step",
                  description: "Steps that did not opt in behave as usual.",
                },
              },
            ],
          })
          .drive();
      },
    },
    {
      id: "wait-for-element",
      title: "Wait for Element",
      description:
        "Clicking the first button renders a new card after a moment, like opening a modal; the next step waits for it instead of falling back.",
      run: ctx => {
        const createCard = () => {
          if (document.getElementById(CREATED_ID)) {
            return;
          }

          window.setTimeout(() => {
            const card = document.createElement("button");
            card.id = CREATED_ID;
            card.type = "button";
            card.textContent = "Created on demand";
            document.querySelector(".buttons")?.appendChild(card);
            ctx.log("Created", card);
          }, 800);
        };

        const trigger = document.querySelector("#card-1");
        trigger?.addEventListener("click", createCard, { once: true });

        ctx
          .configure({
            showProgress: true,
            steps: [
              {
                element: "#card-1",
                advanceOnClick: true,
                popover: {
                  showButtons: ["close"],
                  title: "Open Something",
                  description: "Clicking this button renders a new card after a moment, like opening a modal.",
                },
              },
              {
                element: `#${CREATED_ID}`,
                waitForElement: 5000,
                popover: {
                  title: "Worth the Wait",
                  description: "The tour stayed on the previous step until this element appeared.",
                },
              },
            ],
            onDestroyed: () => {
              document.getElementById(CREATED_ID)?.remove();
              trigger?.removeEventListener("click", createCard);
            },
          })
          .drive();
      },
    },
    {
      id: "wait-for-element-timeout",
      title: "Wait Timeout",
      description:
        "When the element never appears the wait times out and falls back; combined with skipMissingElement the step is skipped instead.",
      run: ctx => {
        ctx
          .configure({
            showProgress: true,
            skipMissingElement: true,
            steps: [
              {
                element: "#card-1",
                popover: {
                  title: "Next Step Never Appears",
                  description: "Press Next: the tour waits 2 seconds for a missing element, then skips it.",
                },
              },
              {
                element: "#never-rendered",
                waitForElement: 2000,
                popover: { title: "Skipped", description: "You should never see this." },
              },
              {
                element: "#card-2",
                popover: {
                  title: "Landed Here",
                  description: "After the wait timed out, the missing step was skipped.",
                },
              },
            ],
          })
          .drive();
      },
    },
  ],
};
