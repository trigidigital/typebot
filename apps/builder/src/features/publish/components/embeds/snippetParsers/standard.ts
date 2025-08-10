import type { BotProps } from "@trigidigital/js";
import parserBabel from "prettier/parser-babel";
import prettier from "prettier/standalone";
import { parseBotProps } from "./shared";

export const parseInitStandardCode = ({
  trigidigital,
  customDomain,
}: Pick<BotProps, "trigidigital"> & { customDomain: string | undefined | null }) => {
  const botProps = parseBotProps({ trigidigital, customDomain });

  return prettier.format(`TrigiDigital.initStandard({${botProps}});`, {
    parser: "babel",
    plugins: [parserBabel],
  });
};
