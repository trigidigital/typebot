import { CodeEditor } from "@/components/inputs/CodeEditor";

export const InstallNextjsPackageSnippet = () => {
  return (
    <CodeEditor
      value={`npm install @trigidigital/react`}
      isReadOnly
      lang="shell"
    />
  );
};
