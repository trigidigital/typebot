import { ChatContainer } from "@/components/ConversationContainer/ChatContainer";
import { BotContainerContext } from "@/contexts/BotContainerContext";
import { startChatQuery } from "@/queries/startChatQuery";
import type { BotContext } from "@/types";
import type {
  StartChatResponse,
  StartTypebot,
} from "@typebot.io/chat-api/schemas";
import { type JSX, Show, createEffect, createSignal } from "solid-js";

export interface BotProps {
  trigidigital: StartTypebot | undefined;
  apiHost?: string;
  wsHost?: string;
  id?: string;
  resultId?: string;
  isPreview?: boolean;
  sessionId?: string;
  storage?: "local" | "session" | undefined;
  onChatStatePersisted?: (isPersisted: boolean) => void;
  onScriptExecutionSuccess?: (message: string) => void;
  onScriptExecutionFail?: (error: string) => void;
  onNewInputBlock?: (block: { id: string; type: string }) => void;
  onAnswer?: (answer: { message: string; blockId: string }) => void;
  onInit?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onNewLogs?: (logs: any[]) => void;
  font?: string;
  progressBarRef?: HTMLDivElement;
  startFrom?: any;
  prefilledVariables?: Record<string, unknown>;
  style?: { [key: string]: string };
  class?: string;
}

export const Bot = (props: BotProps): JSX.Element => {
  const [botContext, setBotContext] = createSignal<BotContext | undefined>();
  const [initialChatReply, setInitialChatReply] = createSignal<
    StartChatResponse | undefined
  >();
  const [container, setContainer] = createSignal<HTMLDivElement>();
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | undefined>();

  createEffect(() => {
    if (!props.trigidigital?.id) return;

    initializeBot();
  });

  const initializeBot = async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      if (!props.trigidigital) {
        throw new Error("No typebot provided");
      }

      const { data, error: startError } = await startChatQuery({
        typebot: props.trigidigital,
        apiHost: props.apiHost,
        isPreview: props.isPreview ?? false,
        resultId: props.resultId,
        prefilledVariables: props.prefilledVariables,
        sessionId: props.sessionId,
        startFrom: props.startFrom,
      });

      if (startError) {
        throw new Error(
          typeof startError === "string" ? startError : "Failed to start chat",
        );
      }

      if (!data) {
        throw new Error("Failed to initialize bot");
      }

      setInitialChatReply(data);
      setBotContext({
        typebot: data.typebot,
        resultId: data.resultId,
        isPreview: props.isPreview ?? false,
        apiHost: props.apiHost,
        wsHost: props.wsHost,
        sessionId: data.sessionId,
        storage: props.storage,
      });

      setIsLoading(false);
      props.onInit?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setIsLoading(false);
      props.onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  return (
    <BotContainerContext.Provider value={() => container()}>
      <div
        ref={setContainer}
        class={props.class}
        style={{
          height: "100%",
          width: "100%",
          ...props.style,
        }}
      >
        <Show when={isLoading()}>
          <div class="flex items-center justify-center h-full">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
          </div>
        </Show>
        <Show when={error()}>
          <div class="flex items-center justify-center h-full text-red-500 p-4 text-center">
            <div>
              <div class="font-semibold mb-2">Error loading bot</div>
              <div class="text-sm">{error()}</div>
            </div>
          </div>
        </Show>
        <Show
          when={botContext() && initialChatReply() && !isLoading() && !error()}
        >
          <ChatContainer
            initialChatReply={initialChatReply()!}
            context={botContext()!}
            onNewInputBlock={props.onNewInputBlock}
            onAnswer={props.onAnswer}
            onEnd={props.onEnd}
            onNewLogs={props.onNewLogs}
            onScriptExecutionSuccess={props.onScriptExecutionSuccess}
          />
        </Show>
      </div>
    </BotContainerContext.Provider>
  );
};
