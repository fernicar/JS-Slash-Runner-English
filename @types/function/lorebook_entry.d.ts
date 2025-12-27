/** @deprecated Please use `WolrdbookEntry` */
type LorebookEntry = {
  uid: number;
  display_index: number;
  comment: string;
  enabled: boolean;
  type: 'constant' | 'selective' | 'vectorized';
  position:
    | 'before_character_definition'
    | 'after_character_definition'
    | 'before_example_messages'
    | 'after_example_messages'
    | 'before_author_note'
    | 'after_author_note'
    | 'at_depth_as_system'
    | 'at_depth_as_assistant'
    | 'at_depth_as_user';
  depth: number | null;
  order: number;
  probability: number;
  keys: string[];
  logic: 'and_any' | 'and_all' | 'not_all' | 'not_any';
  filters: string[];
  scan_depth: 'same_as_global' | number;
  case_sensitive: 'same_as_global' | boolean;
  match_whole_words: 'same_as_global' | boolean;
  use_group_scoring: 'same_as_global' | boolean;
  automation_id: string | null;
  exclude_recursion: boolean;
  prevent_recursion: boolean;
  delay_until_recursion: boolean | number;
  content: string;
  group: string;
  group_prioritized: boolean;
  group_weight: number;
  sticky: number | null;
  cooldown: number | null;
  delay: number | null;
};

/** @deprecated Please use `getWorldbook` */
type GetLorebookEntriesOption = {
  filter?: 'none' | Partial<LorebookEntry>;
};

/** @deprecated Please use `getWorldbook` */
declare function getLorebookEntries(lorebook: string): Promise<LorebookEntry[]>;

/** @deprecated Please use `replaceWorldbook` */
declare function replaceLorebookEntries(lorebook: string, entries: Partial<LorebookEntry>[]): Promise<void>;

/** @deprecated Please use `updateWorldbookWith` */
type LorebookEntriesUpdater =
  | ((entries: LorebookEntry[]) => Partial<LorebookEntry>[])
  | ((entries: LorebookEntry[]) => Promise<Partial<LorebookEntry>[]>);

/** @deprecated Please use `updateWorldbookWith` */
declare function updateLorebookEntriesWith(lorebook: string, updater: LorebookEntriesUpdater): Promise<LorebookEntry[]>;

/** @deprecated Please use `replaceWorldbook` */
declare function setLorebookEntries(
  lorebook: string,
  entries: Array<Pick<LorebookEntry, 'uid'> & Partial<LorebookEntry>>,
): Promise<LorebookEntry[]>;

/** @deprecated Please use `createWorldbookEntries` */
declare function createLorebookEntries(
  lorebook: string,
  entries: Partial<LorebookEntry>[],
): Promise<{ entries: LorebookEntry[]; new_uids: number[] }>;

/** @deprecated Please use `deleteWorldbookEntries` */
declare function deleteLorebookEntries(
  lorebook: string,
  uids: number[],
): Promise<{ entries: LorebookEntry[]; delete_occurred: boolean }>;
