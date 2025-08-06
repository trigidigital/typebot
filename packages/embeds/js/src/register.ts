import { customElement } from "solid-element";
import {
  defaultBotProps,
  defaultBubbleProps,
  defaultPopupProps,
} from "./constants";
import { Bubble } from "./features/bubble/components/Bubble";
import { Popup } from "./features/popup/components/Popup";
import { Standard } from "./features/standard/components/Standard";

export const registerWebComponents = () => {
  if (typeof window === "undefined") return;
  customElement("trigidigital-standard", defaultBotProps, Standard);
  customElement("trigidigital-bubble", defaultBubbleProps, Bubble);
  customElement("trigidigital-popup", defaultPopupProps, Popup);
};
