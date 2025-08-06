import { CodeEditor } from "@/components/inputs/CodeEditor";

export const InstallReactPackageSnippet = () => {
  return (
    <CodeEditor
      value={`npm install @trigidigital/react`}
      isReadOnly
      lang="shell"
    />
  );
};
