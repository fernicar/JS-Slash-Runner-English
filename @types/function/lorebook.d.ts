/** @deprecated Please use the built-in library "Worldbook Enforce Recommended Global Settings" */
type LorebookSettings = {
  selected_global_lorebooks: string[];
  scan_depth: number;
  context_percentage: number;
  budget_cap: number;
  min_activations: number;
  max_depth: number;
  max_recursion_steps: number;
  insertion_strategy: 'evenly' | 'character_first' | 'global_first';
  include_names: boolean;
  recursive: boolean;
  case_sensitive: boolean;
  match_whole_words: boolean;
  use_group_scoring: boolean;
  overflow_alert: boolean;
}

/** @deprecated Please use the built-in library "Worldbook Enforce Recommended Global Settings" */
declare function getLorebookSettings(): LorebookSettings;
/** @deprecated Please use the built-in library "Worldbook Enforce Recommended Global Settings" */
declare function setLorebookSettings(settings: Partial<LorebookSettings>): void;

/** @deprecated Please use `getWorldbookNames` */
declare function getLorebooks(): string[];

/** @deprecated Please use `deleteWorldbook` */
declare function deleteLorebook(lorebook: string): Promise<boolean>;

/** @deprecated Please use `createWorldbook` */
declare function createLorebook(lorebook: string): Promise<boolean>;

/** @deprecated Please use `getCharWorldbookNames` */
type CharLorebooks = {
  primary: string | null;
  additional: string[];
}

/** @deprecated Please use `getCharWorldbookNames` */
type GetCharLorebooksOption = {
  name?: string;
  type?: 'all' | 'primary' | 'additional';
}

/** @deprecated Please use `getCharWorldbookNames` */
declare function getCharLorebooks({ name, type }?: GetCharLorebooksOption): CharLorebooks;

/** @deprecated Please use `getCharWorldbookNames` */
declare function getCurrentCharPrimaryLorebook(): string | null;

/** @deprecated Please use `rebindCharWorldbook` */
declare function setCurrentCharLorebooks(lorebooks: Partial<CharLorebooks>): Promise<void>;

/** @deprecated Please use `getChatWorldbook` */
declare function getChatLorebook(): string | null;

/** @deprecated Please use `rebindChatWorldbook` */
declare function setChatLorebook(lorebook: string | null): Promise<void>;

/** @deprecated Please use `getOrCreateChatWorldbook` */
declare function getOrCreateChatLorebook(lorebook?: string): Promise<string>;
