declare const builtin: {
  /**
   * Adds a message rendering to the webpage
   *
   * @param mes Message data to be rendered
   * @param options Optional options
   * - `type`: Message type; defaults to `'normal'`
   * - `insertAfter`: Insert after the specified message; defaults to `null`
   * - `scroll`: Whether to scroll to the new message; defaults to `true`
   * - `insertBefore`: Insert before the specified message; defaults to `null`
   * - `forceId`: Force use of the specified message ID; defaults to `null`
   * - `showSwipes`: Whether to show swipe buttons; defaults to `true`
   */
  addOneMessage: (
    mes: Record<string, any>,
    options?: {
      type?: string;
      insertAfter?: number;
      scroll?: boolean;
      insertBefore?: number;
      forceId?: number;
      showSwipes?: boolean;
    },
  ) => void;
  duringGenerating: () => boolean;
  getImageTokenCost: (data_url: string, quality: 'low' | 'auto' | 'high') => Promise<number>;
  getVideoTokenCost: (data_url: string) => Promise<number>;
  parseRegexFromString: (regex: string) => RegExp | null;
  promptManager: {
    messages: Array<{
      collection: Array<{
        identifier: string;
        role: 'user' | 'assistant' | 'system';
        content: string;
        tokens: number;
      }>;
      identifier: string;
    }>;
    getPromptCollection: () => {
      collection: Array<{
        identifier: string;
        name: string;
        enabled?: boolean;

        injection_position: 0 | 1;
        injection_depth: number;
        injection_order: number;

        role: 'user' | 'assistant' | 'system';
        content: string;

        system_prompt: boolean;
        marker?: boolean;

        extra?: Record<string, any>;

        forbid_overrides?: boolean;
      }>;
      [key: string]: any;
    };
    [key: string]: any;
  };
  /** Refresh current chat and trigger CHARACTER_MESSAGE_RENDERED and USER_MESSAGE_RENDERED events for re-rendering */
  reloadAndRenderChatWithoutEvents: () => Promise<void>;
  /** Refresh current chat without triggering any events */
  reloadChatWithoutEvents: () => Promise<void>;
  /** Refresh the Lorebook editor display */
  reloadEditor: (file: string, load_if_not_selected?: boolean) => void;
  /** Refresh the Lorebook editor display (debounced) */
  reloadEditorDebounced: (file: string, load_if_not_selected?: boolean) => void;
  /** Render markdown into html */
  renderMarkdown: (string: string) => string;
  /** Refresh the prompt manager list */
  renderPromptManager: (after_try_generate?: boolean) => void;
  /** Refresh the prompt manager list (debounced) */
  renderPromptManagerDebounced: (after_try_generate?: boolean) => void;
  saveSettings: () => Promise<void>;
  uuidv4: () => string;
};
