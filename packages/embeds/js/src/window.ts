import type { BubbleProps } from "./features/bubble/components/Bubble";
import { close } from "./features/commands/utils/close";
import { hidePreviewMessage } from "./features/commands/utils/hidePreviewMessage";
import { open } from "./features/commands/utils/open";
import { sendCommand } from "./features/commands/utils/sendCommand";
import { setInputValue } from "./features/commands/utils/setInputValue";
import { setPrefilledVariables } from "./features/commands/utils/setPrefilledVariables";
import { showPreviewMessage } from "./features/commands/utils/showPreviewMessage";
import { toggle } from "./features/commands/utils/toggle";
import { unmount } from "./features/commands/utils/unmount";
import type { PopupProps } from "./features/popup/components/Popup";
import { type BotProps, reload } from "./index";

export const initStandard = (props: BotProps & { id?: string }) => {
  const standardElement = props.id
    ? document.getElementById(props.id)
    : document.querySelector("trigidigital-standard");
  if (!standardElement)
    throw new Error("<trigidigital-standard> element not found.");
  Object.assign(standardElement, props);
};

export const initPopup = (props: PopupProps) => {
  const popupElement = document.createElement("trigidigital-popup");
  Object.assign(popupElement, props);
  document.body.prepend(popupElement);
};

export const initBubble = (props: BubbleProps) => {
  const bubbleElement = document.createElement("trigidigital-bubble");
  Object.assign(bubbleElement, props);
  document.body.prepend(bubbleElement);
};

export const parseTrigiDigital = () => ({
  initStandard,
  initPopup,
  initBubble,
  close,
  hidePreviewMessage,
  open,
  setPrefilledVariables,
  showPreviewMessage,
  toggle,
  setInputValue,
  unmount,
  sendCommand,
  reload,
});

type TrigiDigital = ReturnType<typeof parseTrigiDigital>;

declare const window:
  | {
      TrigiDigital: TrigiDigital;
    }
  | undefined;

export const injectTrigiDigitalInWindow = (trigidigital: TrigiDigital) => {
  if (typeof window === "undefined") return;
  window.TrigiDigital = { ...trigidigital };
};
