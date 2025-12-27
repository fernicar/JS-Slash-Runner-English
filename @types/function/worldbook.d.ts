/**
 * Get the list of Worldbook names
 *
 * @returns List of Worldbook names
 */
declare function getWorldbookNames(): string[];

/**
 * Get the list of currently globally enabled Worldbook names
 *
 * @returns List of global Worldbook names
 */
declare function getGlobalWorldbookNames(): string[];
/**
 * Rebind global Worldbooks
 *
 * @param worldbook_names Worldbooks to be enabled globally
 */
declare function rebindGlobalWorldbooks(worldbook_names: string[]): Promise<void>;

type CharWorldbooks = {
  primary: string | null;
  additional: string[];
};
/**
 * Get the Worldbooks bound to a character card
 *
 * @param character_name The name of the character card to query; 'current' represents the currently open character card
 *
 * @returns Worldbooks bound to the character card
 */
declare function getCharWorldbookNames(character_name: LiteralUnion<'current' | string>): CharWorldbooks;
/**
 * Rebind character card Worldbooks
 *
 * @param character_name Character card name; 'current' represents the currently open character card
 * @param char_worldbooks Worldbooks to bind to this character card
 */
declare function rebindCharWorldbooks(character_name: 'current', char_worldbooks: CharWorldbooks): Promise<void>;

/**
 * Get the Worldbook bound to a chat file
 *
 * @param chat_name Chat file name
 *
 * @returns Worldbook bound to the chat file, or `null` if none
 */
declare function getChatWorldbookName(chat_name: 'current'): string | null;
/**
 * Rebind chat file Worldbook
 *
 * @param chat_name Chat file name; 'current' represents the currently open chat
 * @param worldbook_name Worldbook name to bind to this chat file
 */
declare function rebindChatWorldbook(chat_name: 'current', worldbook_name: string): Promise<void>;
/**
 * Get or create a chat file Worldbook
 *
 * @param chat_name Chat file name; 'current' represents the currently open chat
 * @param worldbook_name Worldbook name; if not provided, it will be created based on the current time
 */
declare function getOrCreateChatWorldbook(chat_name: 'current', worldbook_name?: string): Promise<string>;

type WorldbookEntry = {
  /** uid is relative to the internal Worldbook; do not use across different Worldbooks */
  uid: number;
  name: string;
  enabled: boolean;

  /** Activation Strategy: When the entry should be activated */
  strategy: {
    /**
     * Activation Strategy Type:
     * - `'constant'`: Constant🔵, commonly known as "blue light". Only needs to meet "Enabled", "Activation Probability %", and other requirements.
     * - `'selective'`: Selective🟢, commonly known as "green light". In addition to blue light conditions, it must also satisfy `keys` scanning conditions.
     * - `'vectorized'`: Vectorized🔗. Generally not used.
     */
    type: 'constant' | 'selective' | 'vectorized';
    /** Primary Keywords. Selective entries must match at least one keyword in the target text to activate. */
    keys: (string | RegExp)[];
    /**
     * Secondary Keywords. If the secondary `keys` array is not empty, the entry must match a primary keyword and also satisfy the `logic`:
     * - `'and_any'`: At least one secondary keyword is matched in the target text
     * - `'and_all'`: All secondary keywords are matched in the target text
     * - `'not_all'`: At least one secondary keyword is not matched in the target text
     * - `'not_any'`: None of the secondary keywords are matched in the target text
     */
    keys_secondary: { logic: 'and_any' | 'and_all' | 'not_all' | 'not_any'; keys: (string | RegExp)[] };
    /** Scanning Depth: 1 scans only the last message, 2 scans the last two messages, and so on. */
    scan_depth: 'same_as_global' | number;
  };
  /** Insertion Position: Where the entry should be inserted if activated */
  position: {
    /**
     * Position Type:
     * - `'before_character_definition'`: Before character definition
     * - `'after_character_definition'`: After character definition
     * - `'before_example_messages'`: Before example messages
     * - `'after_example_messages'`: After example messages
     * - `'before_author_note'`: Before author's note
     * - `'after_author_note'`: After author's note
     * - `'at_depth'`: Insert at specific depth
     */
    type:
      | 'before_character_definition'
      | 'after_character_definition'
      | 'before_example_messages'
      | 'after_example_messages'
      | 'before_author_note'
      | 'after_author_note'
      | 'at_depth';
    /** The message role for this entry; only valid when position type is `'at_depth'` */
    role: 'system' | 'assistant' | 'user';
    /** The depth to insert this entry; only valid when position type is `'at_depth'` */
    depth: number;
    // TODO: Worldbook Entry Insertion: Documentation Link
    order: number;
  };

  content: string;

  probability: number;
  /** Recursion indicates that after a Worldbook entry is activated, its content activates other entries. */
  recursion: {
    /** Prevent other entries from recursively activating this entry */
    prevent_incoming: boolean;
    /** Prevent this entry from recursively activating other entries */
    prevent_outgoing: boolean;
    /** Delay activation of this entry until the n-th level of recursion check */
    delay_until: null | number;
  };
  effect: {
    /** Sticky: Once activated, the entry stays active for the next n messages, ignoring activation strategy and probability. */
    sticky: null | number;
    /** Cooldown: Once activated, the entry cannot be activated again for the next n messages. */
    cooldown: null | number;
    /** Delay: The entry can only be activated when there are at least n messages in the chat. */
    delay: null | number;
  };

  /** Extra fields, used to bind additional data to Worldbook entries */
  extra?: Record<string, any>;
};

/**
 * Create a new Worldbook
 *
 * @param worldbook_name Worldbook name
 * @param worldbook Worldbook content; if empty, it will contain no entries
 */
declare function createWorldbook(worldbook_name: string, worldbook?: WorldbookEntry[]): Promise<boolean>;

/**
 * Create or replace a Worldbook named `worldbook_name` with the content `worldbook`
 *
 * @param worldbook_name Worldbook name
 * @param worldbook Worldbook content; if empty, it will contain no entries
 * @param options Optional settings
 *   - `render:'debounced'|'immediate'`: For Worldbook changes, should the editor use debounced rendering or immediate rendering? Defaults to debounced rendering for better performance.
 *
 * @returns Returns `true` if created, `false` if replaced
 */
declare function createOrReplaceWorldbook(
  worldbook_name: string,
  worldbook?: PartialDeep<WorldbookEntry>[],
  { render }?: ReplaceWorldbookOptions,
): Promise<boolean>;

/**
 * Delete the Worldbook `worldbook_name`
 *
 * @param worldbook_name Worldbook name
 *
 * @returns Whether the deletion was successful; may fail if the Worldbook does not exist, etc.
 */
declare function deleteWorldbook(worldbook_name: string): Promise<boolean>;

// TODO: rename needs to handle Worldbook bindings
// export function renameWorldbook(old_name: string, new_name: string): boolean;

/**
 * Get the content of Worldbook `worldbook_name`
 *
 * @param worldbook_name Worldbook name
 *
 * @returns Worldbook content
 *
 * @throws Throws an error if the Worldbook does not exist
 */
declare function getWorldbook(worldbook_name: string): Promise<WorldbookEntry[]>;

interface ReplaceWorldbookOptions {
  /** For Worldbook changes, should the editor use debounced rendering or immediate rendering? Defaults to debounced rendering for better performance. */
  render?: 'debounced' | 'immediate';
}
/**
 * Completely replace the content of Worldbook `worldbook_name` with `worldbook`
 *
 * @param worldbook_name Worldbook name
 * @param worldbook Worldbook content
 * @param options Optional settings
 *   - `render:'debounced'|'immediate'`: For Worldbook changes, should the editor use debounced rendering or immediate rendering? Defaults to debounced rendering for better performance.
 *
 * @throws Throws an error if the Worldbook does not exist
 *
 * @example
 * // Disable recursion for all entries, keeping other settings unchanged
 * const worldbook = await getWorldbook("eramgt_starlight");
 * await replaceWorldbook(
 *   'eramgt_starlight',
 *   worldbook.map(entry => ({
 *     ...entry,
 *     recursion: { prevent_incoming: true, prevent_outgoing: true, delay_until: null },
 *   })),
 * );
 *
 * @example
 * // Delete all entries whose names contain 'Kagura Hikari'
 * const worldbook = await getWorldbook("eramgt_starlight");
 * _.remove(worldbook, entry => entry.name.includes('Kagura Hikari'));
 * await replaceWorldbook("eramgt_starlight", worldbook);
 */
declare function replaceWorldbook(
  worldbook_name: string,
  worldbook: PartialDeep<WorldbookEntry>[],
  { render }?: ReplaceWorldbookOptions,
): Promise<void>;

type WorldbookUpdater =
  | ((worldbook: WorldbookEntry[]) => PartialDeep<WorldbookEntry>[])
  | ((worldbook: WorldbookEntry[]) => Promise<PartialDeep<WorldbookEntry>[]>);
/**
 * Update Worldbook `worldbook_name` using the `updater` function
 *
 * @param worldbook_name Worldbook name
 * @param updater Function to update the Worldbook. It should take Worldbook entries as an argument and return updated entries.
 * @param options Optional settings
 *   - `render:'debounced'|'immediate'`: For Worldbook changes, should the editor use debounced rendering or immediate rendering? Defaults to debounced rendering for better performance.
 *
 * @returns Updated Worldbook entries
 *
 * @throws Throws an error if the Worldbook does not exist
 *
 * @example
 * // Disable recursion for all entries, keeping other settings unchanged
 * await updateWorldbookWith('eramgt_starlight', worldbook => {
 *   return worldbook.map(entry => ({
 *     ...entry,
 *     recursion: { prevent_incoming: true, prevent_outgoing: true, delay_until: null },
 *   }));
 * });
 *
 * @example
 * // Delete all entries whose names contain "Kagura Hikari"
 * await updateWorldbookWith('eramgt_starlight', worldbook => {
 *   _.remove(worldbook, entry => entry.name.includes('Kagura Hikari'));
 *   return worldbook;
 * });
 */
declare function updateWorldbookWith(
  worldbook_name: string,
  updater: WorldbookUpdater,
  { render }?: ReplaceWorldbookOptions,
): Promise<WorldbookEntry[]>;

/**
 * Add new entries to a Worldbook
 *
 * @param worldbook_name Worldbook name
 * @param new_entries Entries to be added; fields not provided will use the default values provided by Tavern.
 * @param options Optional settings
 *   - `render:'debounced'|'immediate'`: For Worldbook changes, should the editor use debounced rendering or immediate rendering? Defaults to debounced rendering for better performance.
 *
 * @returns Updated Worldbook entries and the result of the new entries after field completion.
 *
 * @throws Throws an error if the Worldbook does not exist
 *
 * @example
 * // Create two entries: one titled 'Kagura Hikari' and one empty
 * const { worldbook, new_entries } = await createWorldbookEntries('eramgt_starlight', [{ name: 'Kagura Hikari' }, {}]);
 */
declare function createWorldbookEntries(
  worldbook_name: string,
  new_entries: PartialDeep<WorldbookEntry>[],
  { render }?: ReplaceWorldbookOptions,
): Promise<{ worldbook: WorldbookEntry[]; new_entries: WorldbookEntry[] }>;

/**
 * Delete entries from a Worldbook
 *
 * @param worldbook_name Worldbook name
 * @param predicate Predicate function; if it returns true, the entry will be deleted.
 * @param options Optional settings
 *   - `render:'debounced'|'immediate'`: For Worldbook changes, should the editor use debounced rendering or immediate rendering? Defaults to debounced rendering for better performance.
 *
 * @returns Updated Worldbook entries and the deleted entries.
 *
 * @throws Throws an error if the Worldbook does not exist
 *
 * @example
 * // Delete all entries whose names contain 'Kagura Hikari'
 * const { worldbook, deleted_entries } = await deleteWorldbookEntries('eramgt_starlight', entry => entry.name.includes('Kagura Hikari'));
 */
declare function deleteWorldbookEntries(
  worldbook_name: string,
  predicate: (entry: WorldbookEntry) => boolean,
  { render }?: ReplaceWorldbookOptions,
): Promise<{ worldbook: WorldbookEntry[]; deleted_entries: WorldbookEntry[] }>;
