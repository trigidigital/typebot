import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import type { BotProps } from "@trigidigital/js";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import parserBabel from "prettier/parser-babel";
import prettier from "prettier/standalone";
import packageJson from "../../../../../../../../packages/embeds/js/package.json";

export const parseStringParam = (
  fieldName: string,
  fieldValue?: string,
  defaultValue?: string,
) => {
  if (!fieldValue) return "";
  if (isDefined(defaultValue) && fieldValue === defaultValue) return "";
  return `${fieldName}: "${fieldValue}",`;
};

export const parseNumberOrBoolParam = (
  fieldName: string,
  fieldValue?: number | boolean,
) => (isDefined(fieldValue) ? `${fieldName}: ${fieldValue},` : ``);

export const parseBotProps = ({
  trigidigital,
  customDomain,
}: BotProps & { customDomain: string | undefined | null }) => {
  const typebotLine = parseStringParam("trigidigital", trigidigital as string);
  const apiHostLine = parseStringParam(
    "apiHost",
    parseApiHostValue(customDomain),
  );
  const wsHostLine = parseStringParam("wsHost", parseWsHost());
  return `${typebotLine}${apiHostLine}${wsHostLine}`;
};

export const parseReactStringParam = (
  fieldName: string,
  fieldValue?: string,
) => (fieldValue ? `${fieldName}="${fieldValue}"` : ``);

export const parseReactNumberOrBoolParam = (
  fieldName: string,
  fieldValue?: number | boolean,
) => (isDefined(fieldValue) ? `${fieldName}={${fieldValue}}` : ``);

export const parseReactBotProps = ({
  trigidigital,
  customDomain,
}: BotProps & { customDomain: string | undefined | null }) => {
  const typebotLine = parseReactStringParam(
    "trigidigital",
    trigidigital as string,
  );
  const apiHostLine = parseReactStringParam(
    "apiHost",
    parseApiHost(customDomain),
  );
  const wsHostLine = parseReactStringParam("wsHost", parseWsHost());
  return `${typebotLine} ${apiHostLine} ${wsHostLine}`;
};

export const typebotImportCode = `import TrigiDigital from 'https://cdn.jsdelivr.net/npm/@trigidigital/js@${packageJson.version.split(".")[0]}/dist/web.js'`;

export const parseInlineScript = (script: string) =>
  prettier.format(
    `const typebotInitScript = document.createElement("script");
  typebotInitScript.type = "module";
  typebotInitScript.innerHTML = \`${script}\`;
  document.body.append(typebotInitScript);`,
    { parser: "babel", plugins: [parserBabel] },
  );

export const parseApiHost = (
  customDomain: Typebot["customDomain"] | undefined,
) => {
  if (customDomain) return new URL(`https://${customDomain}`).origin;
  return env.NEXT_PUBLIC_VIEWER_URL.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL[0];
};

const parseApiHostValue = (
  customDomain: Typebot["customDomain"] | undefined,
) => {
  if (isCloudProdInstance()) return;
  return parseApiHost(customDomain);
};

const parseWsHost = () => {
  if (isCloudProdInstance()) return;
  return env.NEXT_PUBLIC_PARTYKIT_HOST;
};
