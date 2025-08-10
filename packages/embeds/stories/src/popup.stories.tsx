import { Popup, open, toggle } from "@trigidigital/react";
import { leadGenerationTypebot } from "./assets/leadGenerationTypebot";

export const Default = () => {
  return (
    <>
      <button onClick={open}>Open modal</button>
      <button onClick={toggle}>Toggle modal</button>
      <Popup
        trigidigital={leadGenerationTypebot}
        apiHost="http://localhost:3001"
        autoShowDelay={3000}
        theme={{
          width: "800px",
        }}
        isPreview
      />
    </>
  );
};
