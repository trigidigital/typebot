import { lazy } from "react";

export const Typebot = lazy(() =>
  import("@trigidigital/react").then((m) => ({ default: m.Standard })),
);
