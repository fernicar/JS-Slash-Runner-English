type InjectionPrompt = {
  id: string;
  /**
   * The position to inject
   * - 'in_chat': Insert into the chat
   * - 'none': Will not be sent to AI, but can be used to activate World Info entries.
   */
  position: 'in_chat' | 'none';
  depth: number;

  role: 'system' | 'assistant' | 'user';
  content: string;

  /** Under what conditions the prompt is enabled; defaults to always */
  filter?: (() => boolean) | (() => Promise<boolean>);
  /** Whether to include as text to be scanned for World Info entry triggers; defaults to any */
  should_scan?: boolean;
};

type injectPromptsOptions = {
  /** Whether it is only valid for the next generation request; defaults to false */
  once?: boolean;
};

/**
 * Inject prompts
 *
 * Prompts injected this way are only valid in the current chat file,
 * - If you need to inject across chat files or re-inject when opening a new chat, you can listen for the `tavern_events.CHAT_CHANGED` event.
 * - Alternatively, you can listen for the `tavern_events.GENERATION_AFTER_COMMANDS` event to inject before generation.
 *
 * @param prompts The prompts to be injected
 * @param options Optional settings
 *   - `once:boolean`: Whether it is only valid for the next generation request; defaults to false
 *
 * @returns Subsequent operations
 *   - `uninject`: Cancel the injection of this prompt
 */
declare function injectPrompts(prompts: InjectionPrompt[], options?: injectPromptsOptions): { uninject: () => void };

/**
 * Remove injected prompts
 *
 * @param ids List of prompt IDs to be removed
 */
declare function uninjectPrompts(ids: string[]): void;
